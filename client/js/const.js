// const BASE_URL = "http://localhost:3000/api/";
const BASE_URL = "https://play-room.vercel.app/api/";

const INDIVIDUAL_GAME_URL = BASE_URL + 'game/'
const SEARCH_GAME_URL = BASE_URL + "game/search?q=";
const GAME_REVIEW_URL = BASE_URL + "game/review/"

const REVIEW_LIST_URL = BASE_URL + "user/review/list";
const CREATE_REVIEW_URL = BASE_URL + "user/review";
const REMOVE_REVIEW_URL = BASE_URL + "user/review/"

const USER_FAVOURTE_LIST_URL = BASE_URL + "user/favourite/list";
const ADD_TO_FAVOURITE_URL = BASE_URL + "user/favourite";
const UPDATE_FAVOURIE_TIER_URL = BASE_URL + "user/favourite/"
const REMOVE_FAVOURITE_URL = BASE_URL + "user/favourite/";

const USER_DETAILS = BASE_URL + "account/user";
const LOGIN_URL = BASE_URL + "account/login";
const REGISTER_URL = BASE_URL + "account/register";
const LOGOUT_URL = BASE_URL + "account/logout";
const UPDATE_PASSWORD_URL = BASE_URL + 'account/update/password';