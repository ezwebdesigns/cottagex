import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chalet Express - Canadian Cottage Rentals",
    short_name: "Chalet Express",
    description:
      "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f51ec",
    icons: [
      {
        src: "/icon?1",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon?1",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}