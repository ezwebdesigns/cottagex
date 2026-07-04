// Destination page
// Paste your Base44 code here.
import React, { useState } from 'react';
import { ChevronDown, Waves, Trees, Star, Snowflake, Mountain, Leaf, Home as HomeIcon, MapPin } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { destinations, chalets } from '@/lib/data';
import PropertyCard from '@/components/PropertyCard';

const iconMap = {
  waves: Waves, trees: Trees, star: Star, snowflake: Snowflake,
  mountain: Mountain, leaf: Leaf, home: HomeIcon
};

export default function Destination({ destinationId, onNavigate, favorites, toggleFavorite }) {
  const { t, lang } = useLang();
  const [openFaq, setOpenFaq] = useState(0);

  const dest = destinations[destinationId] || destinations.ontario;
  const name = lang === 'fr' ? dest.nameFr : dest.name;
  const tagline = lang === 'fr' ? dest.taglineFr : dest.tagline;
  const intro = lang === 'fr' ? dest.introFr : dest.intro;
  const provinceChalets = chalets.filter((c) => c.province === destinationId);
  const favoriteIds = new Set(favorites.map((f) => f.id));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-64 sm:h-96 overflow-hidden">
        <img src={dest.heroImage} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/90 via-[#191e3b]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-white">
            <div className="flex items-center gap-2 text-[#77e1fb] text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" />
              {t.nav.destinations}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{name}</h1>
            <p className="text-base sm:text-lg text-white/80">{tagline}</p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-3">{t.destination.overview}</h2>
          <p className="text-base sm:text-lg text-[#191e3b] leading-relaxed" style={{ lineHeight: 1.8 }}>{intro}</p>
        </div>
      </section>

      {/* Features (Why Visit) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-6" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{t.destination.features}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {dest.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Star;
              const fTitle = lang === 'fr' ? feature.titleFr : feature.title;
              const fDesc = lang === 'fr' ? (feature.descFr || feature.desc) : feature.desc;
              return (
                <div key={i} className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#0f51ec]/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#0f51ec]" />
                  </div>
                  <h3 className="font-bold text-[#191e3b] text-sm mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{fTitle}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{fDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore Chalets — right after Why Visit */}
      {provinceChalets.length > 0 && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{t.destination.exploreChalets}</h2>
          <p className="text-sm text-slate-500 mb-6">{name}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {provinceChalets.map((chalet) => (
              <PropertyCard key={chalet.id} chalet={chalet} isFavorite={favoriteIds.has(chalet.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {dest.galleryImages.map((img, i) => (
            <div key={i} className={`rounded-[2rem] overflow-hidden ${i === 0 ? 'col-span-2 h-48 sm:h-64' : 'h-48 sm:h-64'}`}>
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-6" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{t.destination.faq}</h2>
          <div className="space-y-2">
            {dest.faq.map((item, i) => {
              const q = lang === 'fr' ? item.qFr : item.q;
              const a = lang === 'fr' ? item.aFr : item.a;
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} className="flex items-center justify-between w-full px-5 py-4 text-left min-h-[48px]">
                    <span className="font-semibold text-sm text-[#191e3b] pr-3">{q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#0f51ec] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}