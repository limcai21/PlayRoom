$(document).ready(function () {
  if (sessionStorage.token) {
    $(".unauthenticatedSection").hide();
    $(".authenticatedSection").show();
  } else {
    $(".unauthenticatedSection").show();
    $(".authenticatedSection").hide();
  }
});