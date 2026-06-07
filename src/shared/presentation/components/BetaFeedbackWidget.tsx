"use client";

import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { isBetaLikeEnv } from "@/shared/env";
import { capturePostHog } from "@/shared/observability/posthogClient";

const FEEDBACK_TYPES = ["Bug", "Suggestion", "Question"] as const;

export default function BetaFeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof FEEDBACK_TYPES)[number]>("Bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!isBetaLikeEnv()) return null;

  const submit = () => {
    if (!message.trim()) return;
    capturePostHog("beta_feedback_submitted", {
      type,
      message: message.trim(),
      path: window.location.pathname,
    });
    setSent(true);
    setMessage("");
    setTimeout(() => {
      setSent(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-40 flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-semibold text-white shadow-lg">
        <MessageCircle className="h-4 w-4" />
        Un avis / Un bug ?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E1E1E]/50 px-4 pb-4">
          <article className="w-full max-w-[440px] rounded-[2rem] bg-background p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="editorial-kicker">Beta feedback</p>
              <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {FEEDBACK_TYPES.map((item) => (
                <button key={item} onClick={() => setType(item)} className={`h-10 rounded-full text-xs font-semibold ${type === item ? "bg-primary text-white" : "bg-card text-foreground"}`}>
                  {item}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Dis-nous ce qui bloque, ce qui manque, ou ce que tu ressens."
              className="ph-no-capture mt-4 min-h-28 w-full resize-none rounded-[1.2rem] border border-warm-stone/60 bg-card p-4 text-sm outline-none"
            />
            <button onClick={submit} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md">
              <Send className="h-4 w-4" />
              {sent ? "Envoye" : "Envoyer"}
            </button>
          </article>
        </div>
      )}
    </>
  );
}
