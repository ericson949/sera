"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLegalCopy } from "@/shared/legalCopy";
import { useStoredLanguage } from "@/shared/presentation/hooks/useStoredLanguage";

export default function LegalIndexPage() {
  const language = useStoredLanguage();
  const copy = getLegalCopy(language);
  const title = language === "fr" ? "Avant le paiement." : language === "it" ? "Prima del pagamento." : "Before checkout.";
  const links = [
    { href: "/privacy", label: copy.privacy.title },
    { href: "/terms", label: copy.terms.title },
    { href: "/cancellation", label: copy.cancellation.title },
  ];

  return (
    <main className="min-h-svh bg-background px-5 py-8 text-foreground">
      <p className="editorial-kicker">Sera legal</p>
      <h1 className="mt-3 font-serif text-[44px] leading-[46px]">{title}</h1>
      <div className="mt-8 space-y-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between rounded-[1.5rem] bg-card p-5 shadow-sm">
            <span className="font-serif text-[26px] leading-[28px]">{link.label}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        ))}
      </div>
    </main>
  );
}
