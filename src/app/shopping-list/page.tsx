"use client";

import { useState } from "react";
import Link from "next/link";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { ShoppingCategory } from "@/modules/meal-planning/domain/value-objects/ShoppingCategory";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { ShoppingBag, Check, Clipboard, Trash2, ArrowRight, Apple, Beef, GlassWater, Package, Snowflake, Flame, ClipboardCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function ShoppingListPage() {
  const { activePlan, toggleShoppingItem } = useDinneroStore();
  const [copied, setCopied] = useState(false);

  if (!activePlan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background">
        <ShoppingBag className="w-12 h-12 text-muted mb-4" />
        <h2 className="text-xl font-bold">Nessuna lista della spesa</h2>
        <p className="text-sm text-muted mt-2 mb-6">
          Genera un menu settimanale per ottenere la tua lista ingredienti ottimizzata.
        </p>
        <Link
          href="/onboarding"
          className="py-3 px-6 bg-primary text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 hover:bg-primary-hover transition-colors tap-highlight"
        >
          <span>Crea lista della spesa</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const items = activePlan.shoppingList;

  // Group items by category
  const categories: ShoppingCategory[] = [
    "Vegetables",
    "Meat & Fish",
    "Dairy",
    "Pantry",
    "Frozen",
    "Spices",
    "Other"
  ];

  const categoryIcons: Record<ShoppingCategory, LucideIcon> = {
    Vegetables: Apple,
    "Meat & Fish": Beef,
    Dairy: GlassWater,
    Pantry: Package,
    Frozen: Snowflake,
    Spices: Flame,
    Other: ShoppingBag,
  };

  const categoryLabels: Record<ShoppingCategory, string> = {
    Vegetables: "Verdure e Frutta",
    "Meat & Fish": "Carne e Pesce",
    Dairy: "Latticini e Uova",
    Pantry: "Dispensa",
    Frozen: "Surgelati",
    Spices: "Erbe e Spezie",
    Other: "Altro",
  };

  // Toggles checked state of an item
  const handleToggle = (itemId: string) => {
    toggleShoppingItem(itemId);
  };

  // Clear checked items (uncheck all)
  const handleClearPurchased = () => {
    items.forEach((item) => {
      if (item.checked) {
        toggleShoppingItem(item.id);
      }
    });
  };

  // Check all items
  const handleMarkAllPurchased = () => {
    items.forEach((item) => {
      if (!item.checked) {
        toggleShoppingItem(item.id);
      }
    });
  };

  // Export list to clipboard formatted nicely
  const handleExportList = () => {
    let text = `🛒 *Lista della Spesa Dinnero - ${activePlan.shop}*\n\n`;

    categories.forEach((cat) => {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length === 0) return;

      text += `*${categoryLabels[cat].toUpperCase()}*\n`;
      catItems.forEach((item) => {
        const check = item.checked ? "✅" : "⬜";
        text += `${check} ${item.name} (${item.quantity}) — ${formatMoney(item.estimatedPrice)} [${item.usedInMeals.join(", ")}]\n`;
      });
      text += "\n";
    });

    text += `💰 *Totale stimato: ${formatMoney(activePlan.estimatedTotal)}*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Count active / checked
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  return (
    <div className="flex-1 flex flex-col bg-background p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
            Lista Spesa Ottimizzata
          </span>
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
            Spesa della Settimana
          </h1>
          <p className="text-xs text-muted mt-1.5">
            Negozio: <span className="font-bold text-foreground">{activePlan.shop}</span> • {checkedCount}/{totalCount} acquistati
          </p>
        </div>

        {/* Checked status percentage circular bar */}
        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center relative bg-stone-50 select-none shrink-0">
          <span className="text-xs font-extrabold text-secondary">
            {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="flex gap-2">
        <button
          onClick={handleExportList}
          className={cn(
            "flex-1 py-3 border rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 tap-highlight",
            copied
              ? "bg-secondary/15 border-secondary/35 text-secondary"
              : "bg-card border-border/80 text-foreground hover:bg-stone-50"
          )}
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-4 h-4" />
              <span>Copiata su WhatsApp!</span>
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4 text-muted" />
              <span>Esporta lista</span>
            </>
          )}
        </button>

        <button
          onClick={checkedCount > 0 ? handleClearPurchased : handleMarkAllPurchased}
          className="py-3 px-4 border border-border/80 bg-card hover:bg-stone-50 rounded-xl font-bold text-xs text-stone-600 transition-colors flex items-center gap-1.5 shrink-0 tap-highlight"
        >
          {checkedCount > 0 ? (
            <>
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Svuota spuntati</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-secondary" />
              <span>Spunta tutti</span>
            </>
          )}
        </button>
      </div>

      {/* Categories Accordion/Groupings */}
      <div className="space-y-6 flex-1">
        {categories.map((category) => {
          const categoryItems = items.filter((i) => i.category === category);
          if (categoryItems.length === 0) return null;

          const Icon = categoryIcons[category];

          return (
            <div key={category} className="space-y-2.5 animate-fade-in-up">
              {/* Category Header */}
              <div className="flex items-center gap-2 text-stone-500 border-b border-border/40 pb-1.5 select-none">
                <Icon className="w-4 h-4 text-secondary" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {categoryLabels[category]}
                </h3>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-full font-bold">
                  {categoryItems.length}
                </span>
              </div>

              {/* Items in Category */}
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={cn(
                      "w-full bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer select-none transition-all tap-highlight",
                      item.checked
                        ? "border-secondary/15 opacity-60 bg-stone-50/50"
                        : "border-border/80"
                    )}
                  >
                    <div className="flex gap-3 items-center flex-1">
                      {/* Checkbox button */}
                      <div className="shrink-0">
                        {item.checked ? (
                          <div className="w-5 h-5 rounded-md bg-secondary text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-border bg-transparent" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <span className={cn(
                          "text-sm font-bold text-foreground leading-none",
                          item.checked && "line-through text-muted"
                        )}>
                          {item.name}
                        </span>
                        
                        {/* Days used badge */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.usedInMeals.map((day) => (
                            <span key={day} className="text-[9px] font-medium text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded">
                              {day.substr(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & Qty */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold block text-foreground">
                        {item.quantity}
                      </span>
                      <span className="text-[10px] text-muted font-bold block mt-0.5">
                        {formatMoney(item.estimatedPrice)}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
