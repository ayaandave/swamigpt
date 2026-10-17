import type { CapacitorConfig } from "@capacitor/cli";

// The iPhone app: a native shell around the live site, so every website update reaches the app
// straight away. Native extras (daily verse notification, lock-screen audio, offline) are added
// on top. cap-shell holds the small pages the app shows on its own: the offline screen.
const config: CapacitorConfig = {
  appId: "com.swamigpt.app",
  appName: "SwamiGPT",
  webDir: "cap-shell",
  backgroundColor: "#f2e3c6",
  server: {
    url: "https://www.swamigpt.com",
    // Shown when the site can't load (no internet and the page wasn't saved before)
    errorPath: "offline.html",
  },
  ios: {
    // swamigpt.com is listed as an app-bound domain (Info.plist), which lets the site's service
    // worker save pages for offline use inside the app
    limitsNavigationsToAppBoundDomains: true,
    contentInset: "never",
    backgroundColor: "#f2e3c6",
  },
  plugins: {
    SplashScreen: { launchShowDuration: 600, backgroundColor: "#f2e3c6", showSpinner: false },
    LocalNotifications: { iconColor: "#d9741a" },
  },
};

export default config;
