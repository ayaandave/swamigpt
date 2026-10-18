import { describe, expect, it } from "vitest";
import { ipv6Network } from "@/lib/limits";
import { chunks } from "@/lib/speak";
import { DAILY, dailyIndex } from "@/lib/daily-verses";
import { accountsIn } from "@/lib/plus-sync";

describe("ipv6Network", () => {
  it("counts every address in one /64 as the same guest", () => {
    expect(ipv6Network("2001:db8::1")).toBe(ipv6Network("2001:db8::2"));
    expect(ipv6Network("2001:db8:0:0:abcd::9")).toBe("2001:db8:0:0::/64");
  });
  it("tells different networks apart", () => {
    expect(ipv6Network("2001:db8:1::1")).not.toBe(ipv6Network("2001:db8:2::1"));
  });
  it("handles brackets, zone ids and leading zeros", () => {
    expect(ipv6Network("[2001:0db8::1]")).toBe("2001:db8:0:0::/64");
    expect(ipv6Network("fe80::1%en0")).toBe("fe80:0:0:0::/64");
  });
  it("unwraps an IPv4 address written in IPv6 form", () => {
    expect(ipv6Network("::ffff:1.2.3.4")).toBe("1.2.3.4");
  });
});

describe("chunks", () => {
  it("keeps short text in one piece", () => {
    expect(chunks("Breathe in. Breathe out.")).toEqual(["Breathe in. Breathe out."]);
  });
  it("splits long text on whole sentences, losing nothing", () => {
    const text = Array.from({ length: 30 }, (_, i) => `Sentence number ${i} is here.`).join(" ");
    const parts = chunks(text);
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(p).toMatch(/\.$/);
    expect(parts.join(" ")).toBe(text);
  });
  it("keeps text with no full stop", () => {
    expect(chunks("Om shanti")).toEqual(["Om shanti"]);
  });
});

describe("dailyIndex", () => {
  it("stays the same all day and moves on the next", () => {
    const morning = new Date(2026, 9, 17, 6, 0);
    const night = new Date(2026, 9, 17, 23, 59);
    const tomorrow = new Date(2026, 9, 18, 6, 0);
    expect(dailyIndex(morning)).toBe(dailyIndex(night));
    expect(dailyIndex(tomorrow)).toBe((dailyIndex(morning) + 1) % DAILY.length);
  });
  it("always points at a real entry", () => {
    for (let d = 0; d < 400; d++) {
      const i = dailyIndex(new Date(2026, 0, 1 + d));
      expect(DAILY[i]).toBeDefined();
    }
  });
});

describe("accountsIn", () => {
  const a = "11111111-1111-4111-8111-111111111111";
  const b = "22222222-2222-4222-8222-222222222222";
  it("collects both sides of a transfer, once each", () => {
    expect(accountsIn({ app_user_id: a, transferred_from: [a], transferred_to: [b] }).sort()).toEqual([a, b]);
  });
  it("ignores RevenueCat's anonymous ids", () => {
    expect(accountsIn({ app_user_id: "$RCAnonymousID:abc", aliases: [a] })).toEqual([a]);
  });
});
