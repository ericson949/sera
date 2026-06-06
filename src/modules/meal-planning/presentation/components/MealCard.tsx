"use client";

import type { CSSProperties } from "react";
import { Meal } from "../../domain/entities/Meal";
import { formatMoney } from "../../domain/value-objects/Money";
import { SERA_EDITORIAL_IMAGE_POSITIONS, SERA_IMAGES } from "@/shared/seraVisuals";

interface MealCardProps {
  meal: Meal;
  onClick: () => void;
}

const dayIndex: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

export default function MealCard({ meal, onClick }: MealCardProps) {
  const imagePosition = SERA_EDITORIAL_IMAGE_POSITIONS[dayIndex[meal.day] ?? 0];

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-b border-warm-stone/70 pb-8 tap-highlight"
    >
      <div
        className="editorial-photo h-64 rounded-[2rem] shadow-md transition duration-700 group-hover:scale-[1.01]"
        style={
          {
            "--editorial-image": `url(${SERA_IMAGES.table})`,
            "--editorial-position": imagePosition,
          } as CSSProperties
        }
      />

      <div className="pt-5">
        <p className="editorial-kicker">{meal.day}</p>
        <h3 className="mt-2 font-serif text-[30px] leading-[34px] tracking-[-0.02em] text-foreground">
          {meal.title}
        </h3>
        <p className="mt-3 text-[15px] leading-6 text-muted line-clamp-2">
          {meal.description}
        </p>

        <div className="mt-5 flex items-center gap-3 text-[13px] text-foreground">
          <span>{meal.prepTimeMinutes} min</span>
          <span className="h-1 w-1 rounded-full bg-warm-stone" />
          <span>{formatMoney(meal.estimatedCost)}</span>
          <span className="h-1 w-1 rounded-full bg-warm-stone" />
          <span>{meal.calories} kcal</span>
        </div>
      </div>
    </article>
  );
}
