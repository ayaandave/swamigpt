// Wraps every screen: a new one is made on each navigation, so the page settles in softly
// (see .page-in in globals.css) instead of snapping.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
