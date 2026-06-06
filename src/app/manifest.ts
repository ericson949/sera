import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dinnero - AI Meal Planner Italy",
    short_name: "Dinnero",
    description: "Weekly Italian dinner plans, grocery lists, and budget tracking.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFDF7",
    theme_color: "#E85D04",
    orientation: "portrait",
    categories: ["food", "shopping", "productivity"],
    icons: [
      {
        src: "/icon.svg",
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
