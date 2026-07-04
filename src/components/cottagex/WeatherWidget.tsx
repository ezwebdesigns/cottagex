'use client';

import { Sun, Cloud, CloudRain, Snowflake, Wind, Droplets, Thermometer } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

const conditionIcons: Record<string, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  partlyCloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
};

export default function WeatherWidget() {
  const { t, lang } = useTranslations();
  const location = 'Muskoka';
  const locationFr = 'Muskoka';
  const weather = { temp: 18, condition: 'partlyCloudy' as const, feelsLike: 16, humidity: 62, wind: 12 };

  const ConditionIcon = conditionIcons[weather.condition] || Sun;
  const conditionLabel = (t.weather as Record<string, string>)[weather.condition] || 'Partly Cloudy';
  const locationName = lang === 'fr' ? locationFr : location;

  return (
    <div className="mb-6 p-4 rounded-3xl bg-gradient-to-br from-[#191e3b] to-[#0f51ec] text-white overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#77e1fb]/20 blur-2xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#77e1fb] mb-2">{t.sidebar.weather}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{locationName}</p>
            <p className="text-3xl font-bold mt-0.5">{weather.temp}°C</p>
            <p className="text-xs text-white/70 mt-0.5">{conditionLabel}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            <ConditionIcon className="w-7 h-7 text-[#77e1fb]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
          <div className="flex flex-col items-center gap-0.5">
            <Thermometer className="w-3.5 h-3.5 text-[#77e1fb]" />
            <span className="text-[10px] text-white/60">{t.weather.feelsLike}</span>
            <span className="text-xs font-semibold">{weather.feelsLike}°</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Droplets className="w-3.5 h-3.5 text-[#77e1fb]" />
            <span className="text-[10px] text-white/60">{t.weather.humidity}</span>
            <span className="text-xs font-semibold">{weather.humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Wind className="w-3.5 h-3.5 text-[#77e1fb]" />
            <span className="text-[10px] text-white/60">{t.weather.wind}</span>
            <span className="text-xs font-semibold">{weather.wind} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
