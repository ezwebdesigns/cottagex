'use client';

import { ArrowRight } from 'lucide-react';

type CategoryBarProps = {
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
};

export default function CategoryBar({ ctaTitle, ctaDescription, ctaButtonText, ctaButtonLink }: CategoryBarProps) {
  return (
    <section className="bg-[#0f51ec] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {ctaTitle || "Find Your Perfect Canadian Escape"}
          </h2>
          <p className="text-blue-100 mt-2 max-w-xl">
            {ctaDescription || "Browse handpicked lake houses, mountain lodges, and wilderness cabins across Canada."}
          </p>
        </div>
        <a
          href={ctaButtonLink || '/cottage-country/ontario'}
          className="inline-flex items-center gap-2 bg-white text-[#0f51ec] px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors shrink-0"
        >
          {ctaButtonText || "Explore Cottages"}
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
