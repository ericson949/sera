"use client";

import React from "react";

interface BudgetSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export default function BudgetSlider({ min, max, onChange }: BudgetSliderProps) {
  const minLimit = 15;
  const maxLimit = 150;
  const step = 5;

  const minPercent = ((min - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((max - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-4">
      {/* Slider display */}
      <div className="text-center">
        <span className="text-sm font-semibold text-muted block uppercase tracking-wider mb-1">
          Il tuo budget settimanale
        </span>
        <span className="text-4xl font-extrabold text-primary flex items-center justify-center gap-1">
          €{min} <span className="text-foreground/30 text-2xl font-light mx-1">–</span> €{max}
        </span>
      </div>

      {/* Double Slider track container */}
      <div className="relative w-full h-6 flex items-center select-none">
        {/* Outer grey track */}
        <div className="absolute left-0 right-0 h-2 bg-border rounded-full pointer-events-none" />

        {/* Highlighted range track */}
        <div
          className="absolute h-2 bg-primary rounded-full pointer-events-none"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Range Inputs */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={min}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), max - step);
            onChange(val, max);
          }}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none cursor-pointer z-30"
        />

        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={max}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), min + step);
            onChange(min, val);
          }}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none cursor-pointer z-20"
        />
      </div>

      <div className="w-full flex justify-between text-xs font-semibold text-muted px-1 mt-[-10px]">
        <span>Min €15</span>
        <span>Max €150</span>
      </div>
    </div>
  );
}
