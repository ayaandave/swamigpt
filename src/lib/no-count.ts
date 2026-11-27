// Visits from the team's own devices (the owner's phone and laptop, test browsers, the iPhone
// simulator) are left out of the visitor numbers, so they show real people only.
// A device stops being counted when the owner signs in on it, or when someone opens any page with
// ?nocount=1 once (handy for a family phone or a test browser). ?nocount=0 turns counting back on.
const KEY = "swamigpt:no-count";

export function countingOff(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setCountingOff(off: boolean) {
  try {
    if (off) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: this visit is simply counted
  }
}

// Reads ?nocount=1 / ?nocount=0 from a page address, if it has one
export function noCountSwitch(url: string): boolean | null {
  const m = /[?&]nocount=([01])(?:[&#]|$)/.exec(url);
  return m ? m[1] === "1" : null;
}

// True when this visit or event should not be sent. Automated browsers (navigator.webdriver) are
// never counted either.
export function skipCounting(url: string): boolean {
  const flip = noCountSwitch(url);
  if (flip != null) setCountingOff(flip);
  if (typeof navigator !== "undefined" && navigator.webdriver) return true;
  return countingOff();
}
