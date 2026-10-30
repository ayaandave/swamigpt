// The opening: "SwamiGPT" decodes into place in thick gold letters, a shine sweeps across it, a
// thin gold line draws under it and the one-liner fades in; then the page rises in. About two
// seconds, once each time SwamiGPT is opened (a new app launch or browser visit; sessionStorage
// forgets when it closes).
// This script runs in the page head before anything paints and sets html[data-intro], which shows
// the overlay and starts the animations in CSS (see .brand-intro in globals.css). It is skipped
// for people who ask their phone to reduce motion, and when the home film is about to play
// (it has its own opening). Runs after FILM_SEEN_SCRIPT, which it reads.
export const INTRO_KEY = "swamigpt.introShown";
export const INTRO_MS = 2300; // when the last part of the opening has finished
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("${INTRO_KEY}"))return;sessionStorage.setItem("${INTRO_KEY}","1");if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(location.pathname==="/"&&!d.dataset.seenFilm)return;d.dataset.intro="1"}catch(e){}})()`;
// Scrambles the letters for their first moments, then locks each in turn, left to right. Runs
// inline right after the overlay's markup, so it starts before the page's JavaScript arrives.
export const INTRO_WORD = "SwamiGPT";
export const INTRO_DECODE_SCRIPT = `(function(){if(!document.documentElement.dataset.intro)return;var w=document.getElementById("intro-word");if(!w)return;var T="${INTRO_WORD}",G="01\\u0950/<>#=+",s=w.children,t0=performance.now();(function f(){var e=performance.now()-t0,done=true;for(var i=0;i<s.length;i++){if(e>80+i*45)s[i].textContent=T[i];else{done=false;s[i].textContent=G[Math.random()*G.length|0]}}if(!done)requestAnimationFrame(f)})()})()`;
