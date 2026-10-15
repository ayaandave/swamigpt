import Link from "next/link";

export const CONTACT = "adave0601@gmail.com";
export const UPDATED = "October 13, 2026";

// Plain-language policy pages: a title, the date, and short sections
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">{title}</h1>
      <p className="mt-1 text-[0.95rem] text-kajal-soft">Last updated {UPDATED}</p>
      <p className="mt-4 max-w-[62ch] text-[1.1rem] leading-[1.7]">{intro}</p>
      <div className="mt-6 flex max-w-[62ch] flex-col gap-8 text-[1.05rem] leading-[1.7] [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:leading-tight [&_li]:mt-1.5 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
      <p className="mt-10 text-[1rem]">
        Questions? Email{" "}
        <a href={`mailto:${CONTACT}`} className="font-semibold text-kesar-deep underline underline-offset-4">
          {CONTACT}
        </a>
        .
      </p>
      <p className="mt-6">
        <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-kesar-deep hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
