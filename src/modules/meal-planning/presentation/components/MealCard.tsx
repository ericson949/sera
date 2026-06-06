"use client";

import React from "react";
import { Meal } from "../../domain/entities/Meal";
import { formatMoney } from "../../domain/value-objects/Money";
import { Clock, Flame, ChevronRight } from "lucide-react";

interface MealCardProps {
  meal: Meal;
  onClick: () => void;
}

export default function MealCard({ meal, onClick }: MealCardProps) {
  // Generate a soft warm gradient background based on calories/prepTime for premium aesthetics
  const getGradientClass = (day: string) => {
    const dayColors: Record<string, string> = {
      Monday: "from-orange-500/10 to-amber-500/10 border-orange-500/20",
      Tuesday: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
      Wednesday: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
      Thursday: "from-rose-500/10 to-red-500/10 border-rose-500/20",
      Friday: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
      Saturday: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
      Sunday: "from-teal-500/10 to-emerald-500/10 border-teal-500/20",
    };
    return dayColors[day] || "from-stone-500/10 to-stone-600/10 border-stone-500/20";
  };

  return (
    <div
      onClick={onClick}
      className={`w-full bg-card rounded-2xl border border-border/80 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex gap-4 items-center tap-highlight bg-gradient-to-r ${getGradientClass(meal.day)}`}
    >
      <div className="flex-1 space-y-1.5">
        {/* Day badge */}
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
          {meal.day}
        </span>
        
        {/* Title */}
        <h3 className="text-base font-extrabold text-foreground leading-tight">
          {meal.title}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-muted line-clamp-1">
          {meal.description}
        </p>

        {/* Badges row */}
        <div className="flex gap-3 text-[11px] font-semibold text-muted/80 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {meal.prepTimeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-stone-400" />
            {meal.calories} kcal
          </span>
          <span className="font-bold text-secondary">
            {formatMoney(meal.estimatedCost)}
          </span>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
    </div>
  );
}
