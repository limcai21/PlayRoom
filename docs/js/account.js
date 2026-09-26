$(document).ready(async function () {

  $("#passwordModal").submit(updatePassword)
  $(document).on('change', '.favFormSelect', updateGameTier);
  $(document).on('click', '.unfavBtn', removeFromFavourite);
  $(document).on('click', '.deleteReviewBtn', deleteReview);


  if (await sessionStorage.token) {
    loadProfile();
    getFavourites();
    getReviews();
  } else {
    location.href = "index.html";
  }

  // WORKS
  async function loadProfile() {
    let response = await fetch(USER_DETAILS,
      {
        method: "post",
        body: JSON.stringify({ token: sessionStorage.token }),
        headers: { 'Content-Type': 'application/json' }
      });
    if (response.ok) {
      let data = await response.json();
      const email = data['email'];
      const name = data['name'];

      $("#name").text(name);
      $("#email").text(email);

    } else {
      let error = await response.json();
      console.log(error.message);
      alert(err.message)
      history.back();
    }
  }

  // WORKS
  async function getFavourites() {
    $(".yourFav").html('Loading');
    let response = await fetch(USER_FAVOURTE_LIST_URL,
      {
        method: "post",
        body: JSON.stringify({ token: sessionStorage.token }),
        headers: { 'Content-Type': 'application/json' }
      });

    if (response.ok) {
      let data = await response.json();
      const allFav = data['message'];
      var output = "";

      if (Array.isArray(allFav)) {
        const detailPromises = allFav.map(async (v) => {
          const gameDetails = await getGameDetails(v['game_id']);
          return { id: v['_id'], tier: v['tier'], details: gameDetails };
        });

        const details = await Promise.all(detailPromises);
        details.forEach((d) => {
          const detail = d['details']
          const tier = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
          var selectOutput = "";
          tier.forEach((v) => {
            v == d.tier ? selectOutput += `<option value="${v}" selected>${v}</option>` : selectOutput += `<option value="${v}">${v}</option>`;
          });

          output += `
            <div class="card">
              <img class="card-img-top" src="${detail['data']['screenshots'][0]['path_thumbnail']}" alt="${detail['data']['name']}">
              <div class="card-body">
                <a href="./game.html?id=${detail['data']['steam_appid']}"><h5 class="card-title">${detail['data']['name']}</h5></a>
                <p class="card-text short_description">${detail['data']['short_description']}</p>
                <div class='cardAction'>
                  <select class='form-control favFormSelect' name='tier' id=${d['id']}>
                    <option value='' disabled selected>Select Tier</option>
                    ${selectOutput}
                  </select>
                  <button type="submit" class="btn btn-light unfavBtn" id=${d['id']}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="m12.82 5.58-.82.822-.824-.824a5.375 5.375 0 1 0-7.601 7.602l7.895 7.895a.75.75 0 0 0 1.06 0l7.902-7.897a5.376 5.376 0 0 0-.001-7.599 5.38 5.38 0 0 0-7.611 0Z"
                        fill="#E84B3C" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        });

        $(".yourFav").html(output);
      } else {
        $(".yourFav").text("No favourite yet");
      }

    } else {
      let error = await response.json();
      console.log(error.message);
      alert(err.message)
      history.back();
    }
  }

  // WORKS
  async function updatePassword(e) {
    e.preventDefault();
    let data = new FormData(e.target);
    let registerEntries = Object.fromEntries(data.entries());
    if (registerEntries['new_password'] != registerEntries['retype_password']) {
      alert("New Password and Retype Password has to be the same!")
    } else {
      delete registerEntries['retype_password']
      registerEntries['token'] = sessionStorage.token;
      let response = await fetch(UPDATE_PASSWORD_URL,
        {
          method: 'put',
          body: JSON.stringify(registerEntries),
          headers: { 'Content-Type': 'application/json' }
        }
      )
      let returnData = await response.json();
      alert(returnData.message)
    }
  }

  // WORKS
  async function getGameDetails(id) {
    let gameDetailResponse = await fetch(INDIVIDUAL_GAME_URL + id);
    let data = gameDetailResponse.json();
    return data;
  }

  // WORKS
  async function updateGameTier(e) {
    e.preventDefault();
    const favID = $(this).attr('id');
    const newTier = $(this).val();

    let response = await fetch(UPDATE_FAVOURIE_TIER_URL + favID, {
      method: 'put',
      body: JSON.stringify({ tier: newTier, token: sessionStorage.token }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.ok) {
      let returnData = await response.json();
      alert(returnData.message);
    } else {
      let error = await response.json();
      console.log(error.message);
      alert(err.message)
    }
  }

  // WORKS
  async function removeFromFavourite(e) {
    e.preventDefault();
    const id = $(this).attr("id");
    let response = await fetch(REMOVE_FAVOURITE_URL + id, {
      method: "delete",
      body: JSON.stringify({ token: sessionStorage.token }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      let output = await response.json();
      alert(output.message)
      getFavourites();
    } else {
      let error = await response.json();
      console.log(error.message);
      alert(error.message)
    }
  }

  // WORKS
  async function getReviews() {
    $(".yourReview").html('Loading');
    let response = await fetch(REVIEW_LIST_URL,
      {
        method: "post",
        body: JSON.stringify({ token: sessionStorage.token }),
        headers: { 'Content-Type': 'application/json' }
      });

    if (response.ok) {
      let data = await response.json();
      const allReview = data['message'];
      var output = "";

      if (Array.isArray(allReview)) {
        const detailPromises = allReview.map(async (v) => {
          const gameDetails = await getGameDetails(v['game_id']);
          return { id: v['_id'], comment: v['comment'], rating: v['rating'], details: gameDetails };
        });

        const details = await Promise.all(detailPromises);

        details.forEach((d) => {
          const detail = d['details']
          output += `
            <div class="card">
              <div class="card-body">
                <a href="./game.html?id=${detail['data']['steam_appid']}"><h5 class="card-title">${detail['data']['name']}</h5></a>
                <p class="card-text short_description">${d['rating']}⭐</p>
                <p class="card-text short_description">${d['comment']}</p>
                <div class='cardAction'>
                  <button type="submit" class="btn btn-danger deleteReviewBtn" id=${d['id']}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 6a1 1 0 0 1-.883.993L20.5 7h-.845l-1.231 12.52A2.75 2.75 0 0 1 15.687 22H8.313a2.75 2.75 0 0 1-2.737-2.48L4.345 7H3.5a1 1 0 0 1 0-2h5a3.5 3.5 0 1 1 7 0h5a1 1 0 0 1 1 1Zm-7.25 3.25a.75.75 0 0 0-.743.648L13.5 10v7l.007.102a.75.75 0 0 0 1.486 0L15 17v-7l-.007-.102a.75.75 0 0 0-.743-.648Zm-4.5 0a.75.75 0 0 0-.743.648L9 10v7l.007.102a.75.75 0 0 0 1.486 0L10.5 17v-7l-.007-.102a.75.75 0 0 0-.743-.648ZM12 3.5A1.5 1.5 0 0 0 10.5 5h3A1.5 1.5 0 0 0 12 3.5Z" fill="#DDE6E8"/></svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        });

        $(".yourReview").html(output);
      } else {
        $(".yourReview").text("No review yet");
      }
    } else {
      let error = await response.json();
      console.log(error.message);
      alert(err.message)
    }
  }

  // WORK
  async function deleteReview(e) {
    e.preventDefault();
    const id = $(this).attr("id");
    let response = await fetch(REMOVE_REVIEW_URL + id, {
      method: "delete",
      body: JSON.stringify({ token: sessionStorage.token }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      let output = await response.json();
      alert(output.message)
      getReviews();
    } else {
      let error = await response.json();
      console.log(error.message);
      alert(error.message)
    }
  }
});