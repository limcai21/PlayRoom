$(document).ready(async function () {
  let typingTimer;
  $(".searchGames").hide();

  // SEARCH
  $("#search").on("input", function (e) {
    clearTimeout(typingTimer);

    typingTimer = setTimeout(async () => {
      const query = $(this).val();
      if (query != "") {
        let response = await fetch(SEARCH_GAME_URL + query);
        if (response.ok) {
          var output = "";
          let data = await response.json();
          $(".searchGames").show();
          if (data['message'].length != 0) {
            console.log(data);

            data['message'].forEach(g => {
              output += `
            <a class="searchResults nav-link" href="./game.html?id=${g['id']}">
              <img src="${g['thumbnail']}" />
              <label>${g['name']}</label>
            </div>
            `
            });
          } else {
            output = "<span style='padding: 10px'>No Result Found</span>"
          }
        } else {
          let error = await response.json();
          console.log(error.message);
        }

        $(".searchGames").html(output)
      } else {
        $(".searchGames").hide();
      }
    }, 500);
  });
});