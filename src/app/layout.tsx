import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientInitializer from "@/shared/presentation/components/ClientInitializer";
import PostHogProvider from "@/shared/presentation/components/PostHogProvider";
import BetaFeedbackWidget from "@/shared/presentation/components/BetaFeedbackWidget";
import AppFrame from "@/shared/presentation/components/AppFrame";
import BottomNav from "@/modules/meal-planning/presentation/components/BottomNav";
import DefaultRemindersModal from "@/modules/meal-planning/presentation/components/DefaultRemindersModal";

export const metadata: Metadata = {
  title: "Sera - AI Dinner Planner",
  description: "Plan a full week of dinners and smart shopping lists in less than one minute.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512.png", sizes: "512x512", type: "image/png" },
      { url: "/sera-mark.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sera",
  },
};

export const viewport: Viewport = {
  themeColor: "#9f3d00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#f3f1ea]">
      <body className="h-full font-sans antialiased text-foreground">
        <PostHogProvider />
        <ClientInitializer />
        <DefaultRemindersModal />
        <div className="relative mx-auto flex min-h-svh w-full max-w-[480px] flex-col border-x border-border/80 bg-background shadow-[0_0_40px_rgba(0,0,0,0.05)]">
          <AppFrame>{children}</AppFrame>
          <BottomNav />
        </div>
        <BetaFeedbackWidget />
      </body>
    </html>
  );
}
