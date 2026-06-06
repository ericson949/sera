"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLegalCopy } from "@/shared/legalCopy";
import { useStoredLanguage } from "../hooks/useStoredLanguage";

type Props = {
  document: "privacy" | "terms" | "cancellation";
};

export default function LegalDocument({ document }: Props) {
  const language = useStoredLanguage();
  const copy = getLegalCopy(language)[document];

  return (
    <main className="min-h-svh bg-background px-5 py-6 text-foreground">
      <Link href="/pricing" className="inline-flex h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold shadow-sm">
        <ArrowLeft className="h-4 w-4" />
        Sera
      </Link>
      <section className="mx-auto mt-8 max-w-[420px]">
        <p className="editorial-kicker">Legal</p>
        <h1 className="mt-3 font-serif text-[42px] leading-[44px]">{copy.title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted">{copy.intro}</p>
        <div className="mt-8 space-y-6">
          {copy.sections.map((section) => (
            <section key={section.title} className="border-t border-warm-stone/70 pt-5">
              <h2 className="font-serif text-[26px] leading-[29px]">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
