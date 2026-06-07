"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AppCountry } from "../hooks/useDinneroStore";
import { getCountryConfig, SERA_COUNTRIES } from "../hooks/useSeraLocaleDetection";
import { Dictionary } from "@/shared/i18n";
import { usePwaInstallPrompt } from "@/shared/presentation/hooks/usePwaInstallPrompt";
import IosInstallBanner from "@/shared/presentation/components/IosInstallBanner";

const SAVINGS_STEPS = [0, 12, 28, 41, 57];
const WELCOME_PAGE_STORAGE_KEY = "sera_welcome_page";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKLY_MEALS = ["Pasta al pomodoro", "Chicken risotto", "Lentil soup", "Veggie frittata", "Pesto pasta", "Tuna salad", "Chickpea stew"];
const SHOPPING_ITEMS = ["Pasta", "Tomatoes", "Eggs", "Olive oil", "Rice", "Chicken"];

const screenVariants = {
  enter: { opacity: 0, y: 24, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.98 },
};

const itemVariants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0 },
};

type Props = {
  appCountry: AppCountry;
  copy: Dictionary;
  setOnboardingField: (key: string, value: unknown) => void;
  onStart: () => void;
};

export default function SeraPreOnboarding({ appCountry, copy, setOnboardingField, onStart }: Props) {
  const [welcomePage, setWelcomePage] = useState(0);
  const [savingsValue, setSavingsValue] = useState(0);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const selectedCountry = getCountryConfig(appCountry);
  const { canPromptInstall, promptInstall } = usePwaInstallPrompt();

  useEffect(() => {
    const savedPage = Number(localStorage.getItem(WELCOME_PAGE_STORAGE_KEY));
    if (!Number.isNaN(savedPage) && savedPage >= 0 && savedPage <= 2) {
      setWelcomePage(savedPage);
    }
  }, []);

  useEffect(() => {
    if (welcomePage !== 0) return;
    setSavingsValue(0);
    const timers = SAVINGS_STEPS.map((value, index) => setTimeout(() => setSavingsValue(value), index * 520));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [welcomePage]);

  const selectCountry = (country: AppCountry) => {
    const config = getCountryConfig(country);
    setOnboardingField("appCountry", config.value);
    setOnboardingField("appLanguage", config.language);
    setOnboardingField("onboardingShop", config.defaultShop);
    setCountryPickerOpen(false);
  };

  const next = async () => {
    if (welcomePage < 2) {
      setCountryPickerOpen(false);
      setWelcomePage((page) => {
        const nextPage = page + 1;
        localStorage.setItem(WELCOME_PAGE_STORAGE_KEY, String(nextPage));
        return nextPage;
      });
      return;
    }

    if (canPromptInstall) {
      await promptInstall();
    }

    onStart();
    localStorage.removeItem(WELCOME_PAGE_STORAGE_KEY);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden pb-[env(safe-area-inset-bottom)]">
        <AnimatePresence mode="wait">
          {welcomePage === 0 && (
            <motion.div key="savings" variants={screenVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }} className="flex h-full flex-col justify-between gap-3">
              <div className="pt-2 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary text-3xl font-black text-white shadow-lg">S</motion.div>
                <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground">Sera</p>
                <div className="mt-3 rounded-[1.6rem] bg-card px-5 py-4 shadow-md">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">Monthly savings</p>
                  <motion.div key={savingsValue} initial={{ opacity: 0, y: 18, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="mt-1 font-serif text-5xl font-semibold tracking-tight text-foreground">€{savingsValue}</motion.div>
                </div>
              </div>
              <div className="space-y-2 text-center">
                <h1 className="font-serif text-[31px] font-semibold leading-[34px] tracking-tight text-foreground">{copy.welcome.savingsTitle}</h1>
                <p className="mx-auto max-w-[320px] text-sm leading-5 text-muted">{copy.welcome.savingsSubtitle}</p>
              </div>
              <div className="space-y-2">
                <button onClick={() => setCountryPickerOpen((open) => !open)} className="flex w-full items-center justify-between rounded-full bg-card px-5 py-3 text-left shadow-sm tap-highlight">
                  <span className="text-base font-black text-foreground">{selectedCountry.flag} {selectedCountry.label}</span>
                  <span className="text-xs font-bold text-muted">{countryPickerOpen ? "Close" : "Change"}</span>
                </button>
                <AnimatePresence>
                  {countryPickerOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: 10, height: 0 }} className="grid grid-cols-2 gap-2 overflow-hidden">
                      {SERA_COUNTRIES.map((country) => (
                        <button key={country.value} onClick={() => selectCountry(country.value)} className={`rounded-2xl px-4 py-2.5 text-left text-sm font-black shadow-sm tap-highlight ${appCountry === country.value ? "bg-secondary text-white" : "bg-card text-foreground"}`}>{country.flag} {country.label}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-center text-xs font-semibold text-muted">{copy.welcome.wrongCountry}</p>
              </div>
            </motion.div>
          )}

          {welcomePage === 1 && (
            <motion.div key="planner" variants={screenVariants} initial="enter" animate="center" exit="exit" className="flex h-full flex-col justify-center gap-5">
              <div className="space-y-1.5 rounded-[1.6rem] bg-card p-3 shadow-md">
                {WEEK_DAYS.map((day, index) => (
                  <motion.div key={day} variants={itemVariants} initial="enter" animate="center" transition={{ delay: index * 0.08 }} className="flex items-center gap-3 rounded-[1.1rem] bg-surface-container-low px-3 py-2.5">
                    <span className="w-9 text-xs font-black uppercase text-muted">{day}</span>
                    <motion.span initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + index * 0.2 }} className="flex items-center gap-2 text-sm font-black text-foreground">
                      <Check className="h-4 w-4 text-secondary" />{WEEKLY_MEALS[index]}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-2 text-center">
                <h1 className="font-serif text-[31px] font-semibold leading-[34px] tracking-tight text-foreground">{copy.welcome.plannerTitle}</h1>
                <p className="mx-auto max-w-[320px] text-sm leading-5 text-muted">{copy.welcome.plannerSubtitle}</p>
              </div>
            </motion.div>
          )}

          {welcomePage === 2 && (
            <motion.div key="shopping" variants={screenVariants} initial="enter" animate="center" exit="exit" className="flex h-full flex-col justify-center gap-5">
              <div className="rounded-[1.6rem] bg-card p-4 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-black text-foreground">Sera list</span>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">{copy.welcome.timeBadge}</span>
                </div>
                <div className="space-y-2">
                  {SHOPPING_ITEMS.map((item, index) => (
                    <motion.div key={item} variants={itemVariants} initial="enter" animate="center" transition={{ delay: index * 0.16 }} className="flex items-center gap-3 rounded-[1.1rem] bg-surface-container-low px-4 py-2.5 text-base font-semibold text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white"><Check className="h-4 w-4" /></span>{item}
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-center">
                <h1 className="font-serif text-[31px] font-semibold leading-[34px] tracking-tight text-foreground">{copy.welcome.listTitle}</h1>
                <p className="mx-auto max-w-[320px] text-sm leading-5 text-muted">{copy.welcome.listSubtitle}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((page) => (
            <span key={page} className={`h-2 rounded-full transition-all ${page === welcomePage ? "w-8 bg-primary" : "w-2 bg-surface-container-high"}`} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-3 select-none">
        {welcomePage === 2 && (
          <div className="absolute inset-x-5 bottom-[5.6rem] z-10">
            <IosInstallBanner copy={copy} />
          </div>
        )}
        {welcomePage > 0 && (
          <button onClick={() => setWelcomePage((page) => {
            const nextPage = Math.max(0, page - 1);
            localStorage.setItem(WELCOME_PAGE_STORAGE_KEY, String(nextPage));
            return nextPage;
          })} className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-sm tap-highlight" aria-label={copy.common.back}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <button onClick={next} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white shadow-md tap-highlight">
          <span>{welcomePage === 2 && canPromptInstall ? "Install & start" : welcomePage === 2 ? copy.welcome.startPlanning : copy.common.continue}</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
