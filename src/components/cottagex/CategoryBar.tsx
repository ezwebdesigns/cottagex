'use client';

import { Sailboat, Bath, Users, Gem, Dog, Mountain, Heart, Home, Trees, TreePine, Umbrella, Building2, MountainSnow, Waves, Footprints } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

const iconMap: Record<string, React.ElementType> = {
  'lakefront': Sailboat,
  'hot-tub': Bath,
  'family': Users,
  'luxury': Gem,
  'pet-friendly': Dog,
  'mountain': Mountain,
  'romantic': Heart,
  'log-cabin': Home,
  'countryside': Trees,
  'secluded': TreePine,
  'beach': Umbrella,
  'resort': Building2,
  'skiing': MountainSnow,
  'pools': Waves,
  'hiking': Footprints,
};

export default function CategoryBar() {
  const { t } = useTranslations();

  return (
    <section className="border-y border-slate-100 bg-white py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto lg:justify-between [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {(t.categories as { id: string; label: string }[]).map((cat) => {
          const Icon = iconMap[cat.id] || Mountain;
          return (
            <button
              key={cat.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group min-w-[56px] sm:min-w-[64px]"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0f51ec] group-hover:bg-[#0f51ec]/10 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-white group-hover:text-[#0f51ec] transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-[#191e3b] group-hover:text-[#0f51ec] transition-colors text-center">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
