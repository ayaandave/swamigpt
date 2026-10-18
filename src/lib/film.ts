// The home film shows once. This script runs in the page head before anything paints, and marks
// returning, signed-in and iPhone-app visitors so CSS hides the film for them (no flash).
// Adding ?film to the address shows it again, for testing.
export const FILM_SEEN_KEY = "swamigpt.seenFilm";
export const FILM_SEEN_SCRIPT = `try{var l=localStorage,s=l.getItem("${FILM_SEEN_KEY}")||window.Capacitor;for(var i=0;!s&&i<l.length;i++){var k=l.key(i);if(k&&k.indexOf("sb-")===0&&k.slice(-11)==="-auth-token")s=1}if(s&&location.search.indexOf("film")<0)document.documentElement.dataset.seenFilm="1"}catch(e){}`;
