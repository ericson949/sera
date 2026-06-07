"use client";

import Link from "next/link";
import { Bell, ChevronRight, Crown, Globe2, Languages, Scale, UserRound, Users } from "lucide-react";
import { AppCountry, AppLanguage, useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { getCountryConfig, SERA_COUNTRIES } from "@/modules/meal-planning/presentation/hooks/useSeraLocaleDetection";
import SeraNotificationCard from "@/shared/presentation/components/SeraNotificationCard";
import { BETA_RESET_STORAGE_KEYS, LANGUAGE_OPTIONS } from "@/shared/profileOptions";
import { getProductCopy } from "@/shared/seraProductCopy";
import { isStagingEnv } from "@/shared/env";

export default function ProfilePage() {
  const { user, appLanguage, appCountry, onboardingBudgetMax, onboardingPeople, setOnboardingField } = useDinneroStore();
  const copy = getProductCopy(appLanguage).profile;
  const pricing = getProductCopy(appLanguage).pricing;
  const isPro = user?.subscriptionStatus === "pro";

  const changeLanguage = (language: AppLanguage) => {
    setOnboardingField("appLanguage", language);
  };

  const changeCountry = (country: AppCountry) => {
    const config = getCountryConfig(country);
    setOnboardingField("appCountry", config.value);
    setOnboardingField("onboardingShop", config.defaultShop);
  };

  const resetBetaAccount = async () => {
    await fetch("/api/beta/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });
    BETA_RESET_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    window.location.href = "/onboarding";
  };

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <header className="shrink-0 px-5 pb-4 pt-5">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-2 font-serif text-[44px] leading-[45px] text-foreground">{copy.title}</h1>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div className="rounded-[2rem] bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
              <UserRound className="h-6 w-6 stroke-[1.5]" />
            </span>
            <div>
              <p className="font-serif text-[28px] leading-[30px] text-foreground">{copy.demo}</p>
              <p className="mt-1 text-sm text-muted">{user?.email}</p>
            </div>
          </div>
          <button className="mt-5 w-full rounded-[1.4rem] bg-surface-container-low p-4 text-left">
            <p className="text-sm font-semibold text-foreground">{copy.account}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{copy.accountBody}</p>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <ProfileSelect
            icon={<Languages />}
            label={copy.language}
            options={LANGUAGE_OPTIONS}
            value={appLanguage}
            onChange={changeLanguage}
          />
          <ProfileSelect
            icon={<Globe2 />}
            label={copy.country}
            options={SERA_COUNTRIES.map((country) => ({ value: country.value, label: `${country.flag} ${country.label}` }))}
            value={appCountry}
            onChange={changeCountry}
          />
          <ProfileRow icon={<Scale />} label={copy.budget} value={`EUR ${onboardingBudgetMax}`} />
          <ProfileRow icon={<Users />} label={copy.people} value={String(onboardingPeople)} />
        </div>

        <div className="mt-4">
          <SeraNotificationCard />
        </div>

        <Link href="/pricing" className="mt-4 flex items-center justify-between rounded-[1.8rem] bg-card p-5 shadow-sm">
          <span className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <span>
              <span className="block text-sm font-semibold text-foreground">{copy.subscription}</span>
              <span className="mt-1 block text-xs text-muted">{isPro ? pricing.member : pricing.pro}</span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>

        <Link href="/legal" className="mt-3 flex items-center justify-between rounded-[1.8rem] border border-warm-stone/70 p-5">
          <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            {copy.legal}
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>

        {isStagingEnv() && (
          <button onClick={resetBetaAccount} className="mt-3 h-12 w-full rounded-full bg-foreground text-sm font-semibold text-white">
            Reinitialiser mon compte de test
          </button>
        )}
      </section>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-container-low p-4">
      <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
        <span className="text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {label}
      </span>
      <span className="text-sm text-muted">{value}</span>
    </div>
  );
}

function ProfileSelect<T extends string>({ icon, label, options, value, onChange }: { icon: React.ReactNode; label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.4rem] bg-surface-container-low p-4">
      <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
        <span className="text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-w-[128px] rounded-full border border-warm-stone/60 bg-card px-3 py-2 text-right text-sm font-semibold text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
