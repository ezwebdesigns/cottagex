// Home page
// Paste your Base44 code here.
import React from 'react';
import Hero from '@/components/Hero';
import CategoryBar from '@/components/CategoryBar';
import PropertyGrid from '@/components/PropertyGrid';
import { useLang } from '@/lib/LanguageContext';
import { chalets, destinations, allProvinces } from '@/lib/data';

export default function Home({ onNavigate, favorites, toggleFavorite }) {
  const { t, lang } = useLang();

  return (
    <div>
      <Hero />
      <CategoryBar />

      <PropertyGrid
        title={t.properties.title}
        subtitle={t.properties.subtitle}
        chalets={chalets}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        showViewAll={t.properties.viewAll}
        onNavigate={onNavigate}
      />

      {/* Destinations Preview */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {t.nav.destinations}
        </h2>
        <p className="text-sm text-slate-500 mb-6">{t.properties.subtitle}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {allProvinces.map((provId) => {
            const dest = destinations[provId];
            const name = lang === 'fr' ? dest.nameFr : dest.name;
            const tagline = lang === 'fr' ? dest.taglineFr : dest.tagline;
            return (
              <button
                key={provId}
                onClick={() => onNavigate('destination', provId)}
                className="group relative h-48 sm:h-56 rounded-[2rem] overflow-hidden text-left"
              >
                <img
                  src={dest.heroImage}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/90 via-[#191e3b]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-base sm:text-lg" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{name}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}