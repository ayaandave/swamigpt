// The opening: the golden leaf and the name, for about a second and a half, once each time
// SwamiGPT is opened (a new app launch or browser visit; sessionStorage forgets when it closes).
// This script runs in the page head before anything paints and sets html[data-intro], which shows
// the overlay and starts the animations in CSS (see .brand-intro in globals.css). It is skipped
// for people who ask their phone to reduce motion, and when the home film is about to play
// (it has its own opening). Runs after FILM_SEEN_SCRIPT, which it reads.
export const INTRO_KEY = "swamigpt.introShown";
export const INTRO_MS = 2600; // when the last part of the opening has finished
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("${INTRO_KEY}"))return;sessionStorage.setItem("${INTRO_KEY}","1");if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(location.pathname==="/"&&!d.dataset.seenFilm)return;d.dataset.intro="1"}catch(e){}})()`;
