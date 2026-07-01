'use client';

import { CheckCircle, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/seo/SchemaOrg';
import FAQAccordion from '@/components/FAQAccordion';
import Image from 'next/image';

type StandardTemplateProps = {
  pageData: {
    title: string;
    content: string;
    type: 'about' | 'terms' | 'default';
    updatedDate?: string;
    faq?: { question: string; answer: string }[];
  };
};

export default function StandardTemplate({ pageData }: StandardTemplateProps) {
  const pathname = usePathname();

  if (pageData.type === 'terms') {
    return (
      <div className="animate-in fade-in duration-300 max-w-4xl mx-auto px-4 py-12">
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: pathname },
        ]} />
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-[#1F51C6] font-semibold text-sm mb-4">
            <Info size={16} /> Last updated: {pageData.updatedDate || 'May 26, 2026'}
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B1B40] mb-6">{pageData.title}</h1>
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
            <h2 className="text-lg font-bold text-[#0B1B40] mt-6">1. Platform Scope</h2>
            <p>Chalet Express acts strictly as a directory aggregator and travel blog. We do not own, manage, or coordinate keys or check-ins for any advertised cottages. All booking transactions take place securely on third-party channels.</p>
            <h2 className="text-lg font-bold text-[#0B1B40] mt-6">2. Affiliate Partnership Disclosure</h2>
            <p>Certain links on our platform contain tracking codes. If you purchase or finalize a cottage stay after clicking our buttons (e.g., "Check Price" or "Check Availability"), we may receive a small marketing commission from the platform partners.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 font-medium text-sm">
              This transaction occurs at absolutely zero extra cost to you. Cottage rates are completely identical whether booked directly or via our links.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageData.type === 'about') {
    return (
      <div className="animate-in fade-in duration-300 max-w-5xl mx-auto px-4 py-12">
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: pathname },
        ]} />
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#1F51C6] font-bold text-xs uppercase bg-blue-50 px-3 py-1.5 rounded-full tracking-wider">Our Story</span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#0B1B40] mt-4 mb-3">{pageData.title || 'About Chalet Express'}</h1>
          <p className="text-slate-500 text-base">We are the premier directory for wild outdoor lovers looking for premium escapes in Canada.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1B40] mb-4">Our Objective</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              At <strong>Chalet Express</strong>, our goal is not to sell direct rentals. Instead, we aim to inspire travelers and curate the absolute finest holiday cottage options across Canada.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Through specialized affiliate partnerships with leading platforms like <strong>VRBO and Expedia</strong>, we combine native on-the-ground knowledge with global booking safety standards.
            </p>
            <ul className="space-y-3 font-medium text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle className="text-[#1F51C6]" size={18} /> Premium Curated Local Selections</li>
              <li className="flex items-center gap-2"><CheckCircle className="text-[#1F51C6]" size={18} /> Direct Outgoing Affiliate Booking</li>
              <li className="flex items-center gap-2"><CheckCircle className="text-[#1F51C6]" size={18} /> Zero extra costs on your final invoice</li>
            </ul>
          </div>
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-md">
            <Image src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600" alt="Cozy wooden cabin interior in a Canadian forest setting" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto px-4 py-12">
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: pageData.title, url: pathname },
      ]} />
      <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#0B1B40] mb-6">{pageData.title}</h1>
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
      </div>
      {pageData.faq && pageData.faq.length > 0 && (
        <div className="mt-8">
          <FAQPageSchema items={pageData.faq} />
          <FAQAccordion items={pageData.faq} />
        </div>
      )}
    </div>
  );
}
