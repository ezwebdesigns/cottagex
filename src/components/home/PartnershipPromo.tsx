'use client';

import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PartnershipPromoProps = {
  locale: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
};

export default function PartnershipPromo({ locale, title = "Own a Beautiful Cabin?\nPartner with us seamlessly.", description = "Expand your booking volume by listing your Canadian property inside our premium recommended guides.", buttonText = "Contact Partnership Team", buttonLink = "/{locale}/contact", image = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1000" }: PartnershipPromoProps) {
  const router = useRouter();

  return (
    <section className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="bg-[#0B1B40] rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 p-8 md:p-12 z-10 text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">{title.split('\n').map((line, i) => <span key={i}>{line}{i < title.split('\n').length - 1 && <br />}</span>)}</h2>
          <p className="text-slate-300 mb-8 max-w-md text-sm leading-relaxed">
            {description}
          </p>
          <button
            onClick={() => router.push(buttonLink.replace('{locale}', locale))}
            className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-6 py-3 rounded-full font-bold transition-all inline-flex items-center gap-2 text-sm shadow-md"
          >
            {buttonText} <ChevronRight size={18} />
          </button>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-auto absolute right-0 inset-y-0 opacity-20 md:opacity-100 hidden md:block">
          <img src={image} alt="Hosting" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}
