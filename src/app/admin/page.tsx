import { HQ } from "./_hq/HQ";

// SwamiGPT HQ: the owner's private dashboard (money, growth, TikTok, users, health, every service).
// Everyone else sees "Page not found": each data route answers only the account in ADMIN_EMAILS.
export default function AdminPage() {
  return <HQ />;
}
