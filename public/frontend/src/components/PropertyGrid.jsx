// PropertyGrid - paste from Base44
// Paste your Base44 code here.
import React from 'react';
import PropertyCard from './PropertyCard';

export default function PropertyGrid({ title, subtitle, chalets, favorites, onToggleFavorite, onNavigate, showViewAll }) {
  const favoriteIds = new Set(favorites.map(f => f.id));

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <div>
          {title && (
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
              {title}
            </h2>
          )}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {showViewAll && onNavigate && (
          <button
            onClick={() => onNavigate('guides')}
            className="hidden sm:block text-sm font-semibold text-[#0f51ec] hover:underline"
          >
            {showViewAll}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {chalets.map((chalet) => (
          <PropertyCard
            key={chalet.id}
            chalet={chalet}
            isFavorite={favoriteIds.has(chalet.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}