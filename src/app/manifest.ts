import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sera - AI Dinner Planner",
    short_name: "Sera",
    description: "Premium weekly dinner planning and smart shopping lists.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    id: "/",
    background_color: "#F5F0E8",
    theme_color: "#C96A3D",
    orientation: "portrait",
    categories: ["food", "shopping", "productivity"],
    icons: [
      {
        src: "/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/sera-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
