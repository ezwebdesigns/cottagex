'use client';

import { Waves, Trees, Compass, MapPin, Mountain, TreePine, Sunrise } from 'lucide-react';

type ExploreItem = {
  icon: string;
  title: string;
  description: string;
};

type ExploreSectionProps = {
  title?: string;
  description?: string;
  subtitle?: string;
  items?: ExploreItem[];
};

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves size={24} />,
  Trees: <Trees size={24} />,
  Compass: <Compass size={24} />,
  MapPin: <MapPin size={24} />,
  Mountain: <Mountain size={24} />,
  TreePine: <TreePine size={24} />,
  Sunrise: <Sunrise size={24} />,
};

export default function ExploreSection({
  title = "Finding Your Perfect Lakeside Haven",
  description = "",
  subtitle = "",
  items = [],
}: ExploreSectionProps) {
  if (items.length === 0) return null;

  return (
    <>
      <section className="px-4 md:px-8 py-8 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center py-6">
          {description && (
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 font-light">
              {description}
            </p>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40] mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-base text-[#1F51C6] leading-relaxed max-w-2xl mx-auto font-semibold">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {items.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-start">
              <div className="p-3 bg-blue-50 text-[#1F51C6] rounded-2xl shrink-0">
                {iconMap[item.icon] || <Compass size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#0B1B40] mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
