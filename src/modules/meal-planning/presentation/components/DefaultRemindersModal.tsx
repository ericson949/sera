"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Clock, ShoppingBag, X } from "lucide-react";

export default function DefaultRemindersModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [cookingTime, setCookingTime] = useState("19:00");
  const [shoppingDay, setShoppingDay] = useState("6"); // Saturday by default
  const [shoppingTime, setShoppingTime] = useState("10:00");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSetupDone = localStorage.getItem("sera_reminders_setup_done");
    const activePlan = localStorage.getItem("dinnero_meal_plans");
    const acceptedPlanId = localStorage.getItem("sera_preview_accepted_plan_id");

    const isExcludedRoute = pathname.includes("onboarding") || pathname.includes("preview") || pathname === "/";
    if (activePlan && acceptedPlanId && isSetupDone !== "true" && !isExcludedRoute) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pathname]);

  const handleSave = async () => {
    localStorage.setItem("sera_default_cooking_time", cookingTime);
    localStorage.setItem("sera_shopping_day", shoppingDay);
    localStorage.setItem("sera_shopping_time", shoppingTime);
    localStorage.setItem("sera_reminders_setup_done", "true");

    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        localStorage.setItem("sera_notifications_enabled", "true");
      }
    }

    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E1E]/65 px-4">
      <div className="relative w-full max-w-[420px] rounded-[2.25rem] bg-background p-6 shadow-2xl border border-warm-stone/50">
        <header className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className="font-serif text-2xl text-foreground">Set Reminders</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <p className="mt-2 text-sm leading-6 text-muted">
          Never miss a meal or a shopping run. Select your preferred default cooking hours and your grocery shopping day.
        </p>

        <div className="mt-6 space-y-4">
          {/* Cooking Time Setting */}
          <div className="rounded-[1.4rem] bg-surface-container-low p-4">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Daily Cooking Time
            </label>
            <p className="mt-0.5 text-xs text-muted">Get alerted when it is time to prep your dinner.</p>
            <input 
              type="time" 
              value={cookingTime} 
              onChange={(e) => setCookingTime(e.target.value)}
              className="mt-3 w-full rounded-full border border-warm-stone/60 bg-card px-4 py-2 text-center text-sm font-semibold text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Grocery Shopping Day Setting */}
          <div className="rounded-[1.4rem] bg-surface-container-low p-4">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Weekly Shopping Day
            </label>
            <p className="mt-0.5 text-xs text-muted">Receive a reminder to pick up your weekly market list.</p>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select 
                value={shoppingDay} 
                onChange={(e) => setShoppingDay(e.target.value)}
                className="w-full rounded-full border border-warm-stone/60 bg-card px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="0">Sunday</option>
              </select>
              <input 
                type="time" 
                value={shoppingTime} 
                onChange={(e) => setShoppingTime(e.target.value)}
                className="w-full rounded-full border border-warm-stone/60 bg-card px-4 py-2 text-center text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          className="mt-6 flex h-13 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary/90"
        >
          Save & Enable Alerts
        </button>
      </div>
    </div>
  );
}
