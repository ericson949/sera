import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientInitializer from "@/shared/presentation/components/ClientInitializer";
import BottomNav from "@/modules/meal-planning/presentation/components/BottomNav";

export const metadata: Metadata = {
  title: "Sera - AI Dinner Planner",
  description: "Plan a full week of dinners and smart shopping lists in less than one minute.",
  manifest: "/manifest.json",
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
        <ClientInitializer />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col border-x border-border/80 bg-background shadow-[0_0_40px_rgba(0,0,0,0.05)]">
          <main className="flex flex-1 flex-col pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
