'use client';

import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { initialDestinations } from '@/lib/mock-data';

type TrendingDestinationsProps = {
  locale: string;
};

export default function TrendingDestinations({ locale }: TrendingDestinationsProps) {
  const router = useRouter();

  return (
    <section className="px-4 md:px-8 py-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40]">Trending Destinations</h2>
          <p className="text-gray-500 mt-2">Discover Canada's most sought-after wilderness corridors.</p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/locations/ontario`)}
          className="hidden md:flex items-center text-[#1F51C6] font-semibold hover:underline"
        >
          Explore Ontario <ChevronRight size={18} className="ml-1" />
        </button>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x [&::-webkit-scrollbar]:hidden">
        {initialDestinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => { if (dest.name.includes('ON')) router.push(`/${locale}/locations/ontario`); }}
            className="min-w-[240px] md:min-w-[280px] h-[320px] rounded-3xl relative overflow-hidden group cursor-pointer snap-start flex-shrink-0"
          >
            <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B40]/95 via-[#0B1B40]/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-xl font-bold">{dest.name}</h3>
              <p className="text-sm text-blue-100/90 mt-1">{dest.properties}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
