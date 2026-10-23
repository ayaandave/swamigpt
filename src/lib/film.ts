// The home film plays once, on a laptop or desktop: the first time someone opens SwamiGPT there,
// signed in or not. Phones, tablets and the iPhone app always get the quick home.
// This script runs in the page head before anything paints and marks everyone else, so CSS hides
// the film for them with no flash. Adding ?film to the address shows it again, for testing.
export const FILM_SEEN_KEY = "swamigpt.seenFilm";
const LAPTOP = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
export const FILM_SEEN_SCRIPT = `(function(){var s=!window.matchMedia("${LAPTOP}").matches||!!window.Capacitor;try{s=s||!!localStorage.getItem("${FILM_SEEN_KEY}")}catch(e){}if(s&&location.search.indexOf("film")<0)document.documentElement.dataset.seenFilm="1"})()`;
