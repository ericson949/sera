"use client";

import { Beef, Clock, HeartPulse, Leaf, PiggyBank, Sparkles, Users } from "lucide-react";
import { MealGoal } from "../../domain/value-objects/MealGoal";

type GoalSelectorProps = {
  goals: readonly MealGoal[];
  selected: MealGoal;
  copy: Record<MealGoal, { title: string; body: string }>;
  onSelect: (goal: MealGoal) => void;
};

export default function GoalSelector({ goals, selected, copy, onSelect }: GoalSelectorProps) {
  return (
    <div className="space-y-2">
      {goals.map((goal, index) => {
        const active = selected === goal;
        const goalCopy = copy[goal];
        const Icon = getGoalIcon(goal);

        return (
          <button
            key={goal}
            onClick={() => onSelect(goal)}
            className={`group flex w-full items-center gap-3 rounded-[1.2rem] border p-3 text-left shadow-sm transition ${
              active ? "border-primary bg-primary text-white" : "border-warm-stone/50 bg-card text-foreground"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
              <Icon className="h-4 w-4 stroke-[1.6]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-[21px] leading-[23px]">{goalCopy.title}</span>
              <span className={`mt-1 block text-xs leading-5 ${active ? "text-white/78" : "text-muted"}`}>{goalCopy.body}</span>
            </span>
            <span className={`font-serif text-xl ${active ? "text-white" : "text-warm-stone"}`}>{String(index + 1).padStart(2, "0")}</span>
          </button>
        );
      })}
    </div>
  );
}

function getGoalIcon(goal: MealGoal) {
  if (goal === "Save money") return PiggyBank;
  if (goal === "Eat healthier") return Leaf;
  if (goal === "Lose weight") return HeartPulse;
  if (goal === "High protein") return Beef;
  if (goal === "Family meals") return Users;
  if (goal === "Quick dinners") return Clock;
  return Sparkles;
}
