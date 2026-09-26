$(document).ready(async function () {
  $("#statusMessage").hide();
  $("#statusMessageSuccess").hide();
  $("#loginForm").submit(login);
  $("#registerForm").submit(register)
  $("#logoutLink").click(logout);


  async function logout() {
    let response = await fetch(LOGOUT_URL, {
      method: "post",
      body: JSON.stringify({ token: sessionStorage.token }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      sessionStorage.removeItem("token");
      location.href = "index.html";
    } else {
      let err = await response.json();
      console.log(err.message);
      alert("Unable to logout")
    }
  }

  async function register(e) {
    e.preventDefault();
    let data = new FormData(e.target);
    let registerEntries = Object.fromEntries(data.entries());
    if (registerEntries['password'] != registerEntries['retype_password']) {
      alert("New Password and Retype Password has to be the same!")
    } else {
      let response = await fetch(REGISTER_URL, {
        method: "post",
        body: JSON.stringify(registerEntries),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        let data = await response.json();
        $("#statusMessage").hide()
        $("#statusMessageSuccess").show();
        $("#statusMessageSuccess").html(data.message + "<br/> You may <a href='./login.html'>Login</a> now.")
      } else {
        let error = await response.json();
        $("#statusMessage").show();
        $("#statusMessageSuccess").hide();
        $("#statusMessage").text(error.message)
      }
    }
  }

  async function login(e) {
    e.preventDefault();
    let data = new FormData(e.target);
    let loginEntries = Object.fromEntries(data.entries());
    let response = await fetch(LOGIN_URL, {
      method: "post",
      body: JSON.stringify(loginEntries),
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      let data = await response.json();
      sessionStorage.token = data.token;
      location.href = "index.html";
    } else {
      let error = await response.json();
      $("#statusMessage").show();
      $("#statusMessage").text(error.message);
    }
  }
});