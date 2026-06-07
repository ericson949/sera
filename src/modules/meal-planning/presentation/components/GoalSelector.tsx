"use client";

import { Beef, Clock, HeartPulse, Leaf, PiggyBank, Sparkles, Users } from "lucide-react";
import { MealGoal } from "../../domain/value-objects/MealGoal";
import { AppLanguage } from "../hooks/useDinneroStore";

type GoalSelectorProps = {
  goals: readonly MealGoal[];
  selected: MealGoal;
  language: AppLanguage;
  onSelect: (goal: MealGoal) => void;
};

const goalCopy: Record<AppLanguage, Record<MealGoal, { title: string; body: string }>> = {
  en: {
    "Save money": { title: "Save money", body: "A week built around value and reuse." },
    "Eat healthier": { title: "Eat healthier", body: "Balanced dinners with fresher choices." },
    "Lose weight": { title: "Lose weight", body: "Lighter meals without feeling clinical." },
    "High protein": { title: "High protein", body: "More satisfying protein-led dinners." },
    "Family meals": { title: "Family meals", body: "Comfortable plates for the whole table." },
    "Quick dinners": { title: "Quick dinners", body: "Low-friction evenings, fewer steps." },
    "Reduce food waste": { title: "Reduce waste", body: "Use what you buy across the week." },
  },
  fr: {
    "Save money": { title: "Economiser", body: "Une semaine pensee valeur et reutilisation." },
    "Eat healthier": { title: "Manger plus sain", body: "Des diners equilibres et plus frais." },
    "Lose weight": { title: "Alleger", body: "Des plats plus legers sans ton clinique." },
    "High protein": { title: "Plus de proteines", body: "Des diners rassasiants et proteines." },
    "Family meals": { title: "Repas famille", body: "Des assiettes simples pour toute la table." },
    "Quick dinners": { title: "Diners rapides", body: "Moins d'etapes les soirs presses." },
    "Reduce food waste": { title: "Moins gaspiller", body: "Reutiliser les achats sur la semaine." },
  },
  it: {
    "Save money": { title: "Risparmiare", body: "Una settimana pensata per valore e riuso." },
    "Eat healthier": { title: "Mangiare meglio", body: "Cene equilibrate e piu fresche." },
    "Lose weight": { title: "Piu leggero", body: "Piatti leggeri senza tono clinico." },
    "High protein": { title: "Piu proteine", body: "Cene sazianti guidate dalle proteine." },
    "Family meals": { title: "Famiglia", body: "Piatti comodi per tutta la tavola." },
    "Quick dinners": { title: "Cene rapide", body: "Sere piu semplici, meno passaggi." },
    "Reduce food waste": { title: "Meno sprechi", body: "Riusa gli acquisti durante la settimana." },
  },
};

export default function GoalSelector({ goals, selected, language, onSelect }: GoalSelectorProps) {
  return (
    <div className="space-y-2">
      {goals.map((goal, index) => {
        const active = selected === goal;
        const copy = goalCopy[language][goal];
        const Icon = getGoalIcon(goal);

        return (
          <button
            key={goal}
            onClick={() => onSelect(goal)}
            className={`group flex w-full items-center gap-4 rounded-[1.45rem] border p-3.5 text-left shadow-sm transition ${
              active ? "border-primary bg-primary text-white" : "border-warm-stone/50 bg-card text-foreground"
            }`}
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
              <Icon className="h-5 w-5 stroke-[1.6]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-[23px] leading-[25px]">{copy.title}</span>
              <span className={`mt-1 block text-xs leading-5 ${active ? "text-white/78" : "text-muted"}`}>{copy.body}</span>
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
