import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Maintenance en cours | Chalet Express",
  description: "Chalet Express est temporairement en maintenance. Nous serons de retour sous peu.",
  robots: { index: false, follow: false },
};

export default function MaintenanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col items-center justify-center bg-gray-50">
        {children}
      </body>
    </html>
  );
}