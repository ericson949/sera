"use client";

import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { ShoppingCategory } from "@/modules/meal-planning/domain/value-objects/ShoppingCategory";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";

const categories: ShoppingCategory[] = ["Vegetables", "Meat & Fish", "Dairy", "Pantry", "Frozen", "Spices", "Other"];

export default function PreviewShoppingListPage() {
  const { activePlan, toggleShoppingItem, appLanguage } = useDinneroStore();
  const productCopy = getProductCopy(appLanguage);
  const copy = productCopy.shopping;

  if (!activePlan) {
    return (
      <div className="flex h-svh flex-col justify-center bg-background px-6 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted" />
        <h1 className="mt-5 font-serif text-[38px] leading-[40px] text-foreground">{copy.emptyTitle}</h1>
        <Link href="/onboarding" className="mt-7 flex h-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          {copy.compose}
        </Link>
      </div>
    );
  }

  const checkedCount = activePlan.shoppingList.filter((item) => item.checked).length;

  return (
    <div className="flex h-svh flex-col bg-background p-5">
      <header className="shrink-0 pb-4">
        <Link href="/plan-preview" className="mb-4 flex h-10 w-fit items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold text-foreground shadow-sm">
          <ArrowLeft className="h-4 w-4" />
          {productCopy.common.back}
        </Link>
        <p className="editorial-kicker">{copy.guide}</p>
        <h1 className="mt-2 font-serif text-[40px] leading-[41px] text-foreground">{copy.titleA}<br />{copy.titleB}</h1>
        <p className="mt-2 text-sm text-muted">{activePlan.shop} - {checkedCount}/{activePlan.shoppingList.length} {copy.gathered}</p>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-6">
          {categories.map((category) => {
            const items = activePlan.shoppingList.filter((item) => item.category === category);
            if (items.length === 0) return null;
            const labels = productCopy.marketSections[category];

            return (
              <section key={category} className="border-t border-warm-stone/70 pt-4">
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-[27px] leading-[29px] text-foreground">{labels[0]}</h2>
                    <p className="editorial-kicker mt-1">{labels[1]}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted">{items.length} {copy.items}</span>
                </div>
                <div className="divide-y divide-warm-stone/50">
                  {items.map((item) => (
                    <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className="flex w-full items-center justify-between gap-4 py-3 text-left">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${item.checked ? "border-primary bg-primary text-white" : "border-warm-stone"}`}>
                          {item.checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span>
                          <span className={`block text-[15px] font-medium text-foreground ${item.checked ? "line-through opacity-50" : ""}`}>{item.name}</span>
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
