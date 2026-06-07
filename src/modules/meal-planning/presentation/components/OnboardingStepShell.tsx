"use client";

import { motion } from "framer-motion";

type OnboardingStepShellProps = {
  icon: React.ReactNode;
  title: string;
  body: string;
  kicker: string;
  children: React.ReactNode;
};

export default function OnboardingStepShell({ icon, title, body, kicker, children }: OnboardingStepShellProps) {
  return (
    <motion.div key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }} className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-3 overflow-hidden rounded-[1.6rem] border border-warm-stone/60 bg-card p-4 shadow-md">
        <div className="absolute right-4 top-4 h-14 w-14 rounded-full border border-primary/20" />
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary text-white shadow-md [&_svg]:h-5 [&_svg]:w-5 [&_svg]:stroke-[1.5]">
          {icon}
        </div>
        <p className="editorial-kicker mt-5">{kicker}</p>
        <h2 className="mt-2 font-serif text-[30px] leading-[32px] text-foreground">{title}</h2>
        <p className="mt-2 max-w-[330px] text-[13px] leading-5 text-muted">{body}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-1 no-scrollbar">{children}</div>
    </motion.div>
  );
}
