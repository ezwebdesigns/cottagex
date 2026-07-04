'use client';

import { Umbrella, Wind, Building2, Trees, Waves, Sailboat, Droplets, MountainSnow, Landmark, Tent, Snowflake, Mountain, Sun, Warehouse, Gem } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

const iconMap: Record<string, React.ElementType> = {
  beach: Umbrella,
  windmills: Wind,
  modern: Building2,
  countryside: Trees,
  pools: Waves,
  islands: Sailboat,
  lake: Droplets,
  skiing: MountainSnow,
  castles: Landmark,
  camping: Tent,
  arctic: Snowflake,
  cave: Mountain,
  desert: Sun,
  barn: Warehouse,
  lux: Gem,
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
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 group-hover:bg-[#0f51ec]/10 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-[#0f51ec] transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-slate-500 group-hover:text-[#191e3b] transition-colors text-center">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
