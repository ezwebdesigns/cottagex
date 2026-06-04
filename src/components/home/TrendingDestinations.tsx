'use client';

import { useRouter } from 'next/navigation';
import { initialDestinations } from '@/lib/mock-data';
import { MapPin } from 'lucide-react';

type TrendingDestinationsProps = {
  locale: string;
  title?: string;
  description?: string;
  items?: { name: string; properties: string; image: string; link?: string }[];
};

export default function TrendingDestinations({ locale, title = "Trending Destinations", description = "Discover Canada's most sought-after wilderness corridors.", items }: TrendingDestinationsProps) {
  const router = useRouter();
  const destItems = items ?? initialDestinations.map(d => ({ name: d.name, properties: d.properties, image: d.image, link: '' }));

  return (
    <section className="px-4 md:px-8 py-16 bg-[#0B1B40]">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          <p className="text-blue-100/80 mt-2">{description}</p>
        </div>

        <div className="flex flex-row gap-2 md:gap-6">
          {destItems.map((dest, i) => (
            <div
              key={i}
              onClick={() => { if (dest.link) router.push(dest.link); }}
              className="flex-1 min-w-0 h-[140px] md:h-[320px] rounded-3xl relative overflow-hidden group cursor-pointer"
            >
              <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B40]/95 via-[#0B1B40]/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={16} className="text-[#93B4FF] shrink-0" />
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                </div>
                <p className="text-sm text-blue-100/90 mt-1">{dest.properties}</p>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
}
