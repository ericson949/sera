"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { ShoppingCategory } from "@/modules/meal-planning/domain/value-objects/ShoppingCategory";
import { createMoney, formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { SERA_MARKET_SECTION_LABELS } from "@/shared/seraVisuals";
import { ArrowLeft, ArrowRight, Check, Clipboard, ClipboardCheck, ShoppingBag, Trash2 } from "lucide-react";

const categories: ShoppingCategory[] = [
  "Vegetables",
  "Meat & Fish",
  "Dairy",
  "Pantry",
  "Frozen",
  "Spices",
  "Other",
];

export default function ShoppingListPage() {
  const router = useRouter();
  const { activePlan, toggleShoppingItem } = useDinneroStore();
  const [exportStatus, setExportStatus] = useState<"idle" | "done" | "error">("idle");

  if (!activePlan) {
    return (
      <div className="flex min-h-[calc(100svh-5rem)] flex-col justify-center bg-background px-6 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted" />
        <h1 className="mt-5 font-serif text-[40px] leading-[43px] text-foreground">No market list yet.</h1>
        <p className="mx-auto mt-4 max-w-[300px] text-sm leading-6 text-muted">
          Create a weekly plan and Sera will arrange your ingredients by market section.
        </p>
        <Link
          href="/onboarding"
          className="mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-md"
        >
          Compose the week
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const items = activePlan.shoppingList;
  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const checkedTotal = items.reduce((sum, item) => sum + (item.checked ? item.estimatedPrice.amount : 0), 0);
  const listTotal = items.reduce((sum, item) => sum + item.estimatedPrice.amount, 0);
  const remainingTotal = Math.max(0, listTotal - checkedTotal);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/results");
  };

  const buildExportText = () => {
    let text = `Sera market list - ${activePlan.shop}\n\n`;

    categories.forEach((category) => {
      const categoryItems = items.filter((item) => item.category === category);
      if (categoryItems.length === 0) return;

      const labels = SERA_MARKET_SECTION_LABELS[category];
      text += `${labels.title} / ${labels.subtitle}\n`;
      categoryItems.forEach((item) => {
        const check = item.checked ? "[x]" : "[ ]";
        text += `${check} ${item.name} (${item.quantity}) - ${formatMoney(item.estimatedPrice)}\n`;
      });
      text += "\n";
    });

    text += `Estimated total: ${formatMoney(activePlan.estimatedTotal)}`;
    return text;
  };

  const downloadTextFile = (text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sera-market-list.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportList = async () => {
    const text = buildExportText();

    try {
      if (navigator.share) {
        await navigator.share({ title: "Sera market list", text });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        downloadTextFile(text);
      }

      setExportStatus("done");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      try {
        downloadTextFile(text);
        setExportStatus("done");
      } catch {
        setExportStatus("error");
      }
    }

    setTimeout(() => setExportStatus("idle"), 2500);
  };

  const handleClearPurchased = () => {
    items.forEach((item) => {
      if (item.checked) toggleShoppingItem(item.id);
    });
  };

  const handleMarkAllPurchased = () => {
    items.forEach((item) => {
      if (!item.checked) toggleShoppingItem(item.id);
    });
  };

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <header className="shrink-0 px-5 pb-4 pt-5">
        <button
          onClick={handleBack}
          className="mb-4 flex h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold text-foreground shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="editorial-kicker">Sera market guide</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[40px] leading-[42px] tracking-tight text-foreground">
              One trip.
              <br />
              Everything needed.
            </h1>
            <p className="mt-2 text-sm text-muted">{activePlan.shop} · {checkedCount}/{totalCount} gathered</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
            <span className="font-serif text-xl text-secondary">
              {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[1.1rem] bg-surface-container-low px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Collected</p>
            <p className="mt-1 font-serif text-xl leading-none text-foreground">{formatMoney(createMoney(checkedTotal))}</p>
          </div>
          <div className="rounded-[1.1rem] bg-card px-3 py-2.5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Remaining</p>
            <p className="mt-1 font-serif text-xl leading-none text-secondary">{formatMoney(createMoney(remainingTotal))}</p>
          </div>
          <div className="rounded-[1.1rem] bg-secondary px-3 py-2.5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Total</p>
            <p className="mt-1 font-serif text-xl leading-none">{formatMoney(createMoney(listTotal))}</p>
          </div>
        </div>
      </header>

      <div className="flex shrink-0 gap-2 px-5 pb-4">
        <button
          onClick={handleExportList}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background"
        >
          {exportStatus === "done" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          {exportStatus === "done" ? "Exported" : exportStatus === "error" ? "Try again" : "Export"}
        </button>
        <button
          onClick={checkedCount > 0 ? handleClearPurchased : handleMarkAllPurchased}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-card px-5 text-sm font-semibold text-foreground shadow-sm"
        >
          {checkedCount > 0 ? <Trash2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {checkedCount > 0 ? "Clear" : "All"}
        </button>
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.category === category);
            if (categoryItems.length === 0) return null;

            const labels = SERA_MARKET_SECTION_LABELS[category];

            return (
              <section key={category} className="border-t border-warm-stone/70 pt-4">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-[28px] leading-[30px] text-foreground">{labels.title}</h2>
                    <p className="editorial-kicker mt-1">{labels.subtitle}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted">{categoryItems.length} items</span>
                </div>

                <div className="divide-y divide-warm-stone/50">
                  {categoryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleShoppingItem(item.id)}
                      className="flex w-full items-center justify-between gap-4 py-3 text-left tap-highlight"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            item.checked ? "border-secondary bg-secondary text-white" : "border-warm-stone"
                          }`}
                        >
                          {item.checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span>
                          <span className={`block text-[15px] font-medium text-foreground ${item.checked ? "line-through opacity-50" : ""}`}>
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{item.quantity}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-sm text-muted">{formatMoney(item.estimatedPrice)}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
