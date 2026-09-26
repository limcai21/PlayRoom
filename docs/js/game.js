let id;

function removeHtmlTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

function getNumberFromString(str) {
  const regex = /\d+/;
  const match = regex.exec(str);
  if (!match) {
    return undefined;
  }
  return Number(match[0]);
}


$(document).ready(async function () {
  $("#addToFav").hide();
  $("#removeFromFav").hide();

  const urlParams = new URLSearchParams(window.location.search);
  id = getNumberFromString(urlParams)

  checkFavourite();
  loadGame();
  loadReview()



  $("#addReview").submit(createReview)
  $("#addToFav").submit(addToFavourite);
  $("#removeFromFav").submit(removeFromFavourite)


  // WORKS
  async function addToFavourite(e) {
    e.preventDefault();
    let data = new FormData(e.target);
    let createEntries = Object.fromEntries(data.entries());
    createEntries['game_id'] = id

    if (sessionStorage.token) {
      createEntries['token'] = sessionStorage.token;
      let response = await fetch(ADD_TO_FAVOURITE_URL, {
        method: "post",
        body: JSON.stringify(createEntries),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        let output = await response.json();
        alert(output.message)
        $("#addToFav").hide();
        checkFavourite();
      } else {
        let error = await response.json();
        console.log(error.message);
        alert(err.message)
      }
    } else {
      alert("Please login to save this game to your favourite list")
      location.href = "login.html";
    }

  }

  // WORKS
  async function checkFavourite() {
    let response = await fetch(USER_FAVOURTE_LIST_URL, {
      method: "post",
      body: JSON.stringify({ token: sessionStorage.token }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      let data = await response.json();
      let allFav = data['message'];

      var isFav = false;
      if (Array.isArray(allFav)) {
        allFav.forEach((fav) => {
          if (fav.game_id == id) {
            $("#fillFavBtn").attr("favID", fav['_id'])
            isFav = true;
          }
        })
      }

      if (isFav) {
        $("#removeFromFav").show();
      } else {
        $("#addToFav").show();
      }

    } else {
      let error = await response.json();
      console.log(error.message);
      alert(err.message)
    }
  }

  // WORKS
  async function removeFromFavourite(e) {
    const favID = $(this).children().attr("favID");
    e.preventDefault();
    if (sessionStorage.token) {
      let response = await fetch(REMOVE_FAVOURITE_URL + favID, {
        method: "delete",
        body: JSON.stringify({ token: sessionStorage.token }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        let output = await response.json();
        alert(output.message)

        $("#addToFav").show();
        $("#removeFromFav").hide();
      } else {
        let error = await response.json();
        console.log(error.message);
        alert(err.message)
      }
    } else {
      alert("Please login to remove this game from your favourite list")
      location.href = "login.html";
    }
  }

  // WORKS
  async function loadGame() {
    let response = await fetch(INDIVIDUAL_GAME_URL + id);
    if (response.ok) {
      let data = await response.json();
      if (data['success']) {
        const gameData = data['data']
        var screenshotOutput = "";
        var trailerOutput = "";
        const linearGradient = "linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(100, 100, 100, 0.1))";

        // HEADER
        $("#title").text(gameData['name'])
        $("#developer").text(gameData['developers'])
        $("#publisher").text(gameData['publishers'])
        $(".gameHeader").css("background", linearGradient + ", url(" + gameData['screenshots'][0]['path_full'] + ")")
        $("#shortDescription").text(gameData['short_description'])
        // CONTENT 
        $("#description").html(gameData['about_the_game'])
        if (gameData['screenshots']) {
          gameData['screenshots'].forEach(pic => {
            screenshotOutput += `<img src="${pic['path_full']}"/>`
          });
        }

        if (gameData['movies']) {
          gameData['movies'].forEach(trailer => {
            trailerOutput += `
              <video controls>
                <source src="${trailer['mp4']['max']}" type="video/mp4">
              </video>
              `
          });
        }
        $("#trailerScroll").html(trailerOutput)
        $("#screenshotScroll").html(screenshotOutput)

        document.title = gameData['name'] + " - PlayRoom"
      } else {
        location.href = "index.html";
      }
    } else {
      let error = await response.json();
      console.log(error.message);
      alert(err.message)
      history.back();
    }
  }

  // WORKS
  async function loadReview() {
    let reviewResponse = await fetch(GAME_REVIEW_URL + id)
    if (reviewResponse.ok) {
      var reviewOutput = "";
      let data = await reviewResponse.json();
      if (data['reviews']) {
        data['reviews'].forEach((r) => {
          reviewOutput += `
          <fluent-card class="card">
            <label class="title">${r['user_id']['name']}</label>
            <div class="ratingAndComment">
              <span class="comment">${r['comment']}</span>
              <span class='rate'>${r['rating']}⭐</span>
            </div>
          </fluent-card>
        `
        })

      } else {
        reviewOutput = "No review yet"
      }

      $(".userReviews").html(reviewOutput)
    } else {
      let error = await reviewResponse.json();
      $("#statusMessage").text(error.message)
    }
  }

  // WORKS
  async function createReview(e) {
    e.preventDefault();
    let data = new FormData(e.target);
    let createEntries = Object.fromEntries(data.entries());
    createEntries['game_id'] = id

    if (sessionStorage.token) {
      createEntries['token'] = sessionStorage.token;
      let response = await fetch(CREATE_REVIEW_URL, {
        method: "post",
        body: JSON.stringify(createEntries),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        let data = await response.json();
        alert(data.message);
        loadReview();
      } else {
        let error = await response.json();
        $("#statusMessage").text(error.message)
      }
    } else {
      alert("Please login to post your review")
      location.href = "login.html";
    }
  }
});