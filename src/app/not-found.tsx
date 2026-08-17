import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  const h = await headers();
  const locale = h.get("x-locale") || "en";
  const isFr = locale === "fr";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f51ec]">
        <span className="text-3xl font-bold text-white">404</span>
      </div>
      <h1 className="mb-3 text-3xl font-bold text-[#191e3b] md:text-4xl">
        {isFr ? "Page introuvable" : "Page Not Found"}
      </h1>
      <p className="mb-8 max-w-md text-[#191e3b]/60">
        {isFr
          ? "La page que vous recherchez n'existe pas ou a été déplacée."
          : "The page you are looking for doesn't exist or has been moved."}
      </p>
      <Link
        href={`/${locale}`}
        className="rounded-full bg-[#0f51ec] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#0a3ec2]"
      >
        {isFr ? "Retour à l'accueil" : "Back to Home"}
      </Link>
    </div>
  );
}