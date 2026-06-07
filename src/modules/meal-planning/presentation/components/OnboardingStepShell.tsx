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
      <div className="relative mb-5 overflow-hidden rounded-[2rem] border border-warm-stone/60 bg-card p-5 shadow-md">
        <div className="absolute right-4 top-4 h-20 w-20 rounded-full border border-primary/20" />
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-primary text-white shadow-md [&_svg]:h-6 [&_svg]:w-6 [&_svg]:stroke-[1.5]">
          {icon}
        </div>
        <p className="editorial-kicker mt-7">{kicker}</p>
        <h2 className="mt-2 font-serif text-[36px] leading-[38px] text-foreground">{title}</h2>
        <p className="mt-3 max-w-[330px] text-sm leading-6 text-muted">{body}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-1 no-scrollbar">{children}</div>
    </motion.div>
  );
}
