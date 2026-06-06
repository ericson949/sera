import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sera - AI Dinner Planner",
    short_name: "Sera",
    description: "Premium weekly dinner planning and smart shopping lists.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFDF7",
    theme_color: "#9f3d00",
    orientation: "portrait",
    categories: ["food", "shopping", "productivity"],
    icons: [
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
