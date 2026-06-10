'use client';

import { useRouter } from 'next/navigation';
import { initialDestinations } from '@/lib/mock-data';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

type TrendingDestinationsProps = {
  locale: string;
  title?: string;
  description?: string;
  items?: { name: string; properties: string; image: string; imageAlt?: string; link?: string }[];
};

export default function TrendingDestinations({ locale, title = "Trending Destinations", description = "Discover Canada's most sought-after wilderness corridors.", items }: TrendingDestinationsProps) {
  const router = useRouter();
  const destItems = items ?? initialDestinations.map(d => ({ name: d.name, properties: d.properties, image: d.image, imageAlt: '', link: '' }));

  return (
    <section className="px-4 md:px-8 py-16 bg-[#0B1B40]">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          <p className="text-blue-100/80 mt-2">{description}</p>
        </div>

        <div className="flex flex-row gap-2 md:gap-6 overflow-x-auto md:overflow-visible snap-x md:snap-none">
          {destItems.map((dest, i) => (
            <div
              key={i}
              onClick={() => { if (dest.link) router.push(dest.link); }}
              className="min-w-[calc(50%-0.25rem)] md:flex-1 md:min-w-0 shrink-0 snap-start h-[140px] md:h-[320px] rounded-3xl relative overflow-hidden group cursor-pointer"
            >
              <Image src={dest.image} alt={dest.imageAlt || dest.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 16vw" />
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
