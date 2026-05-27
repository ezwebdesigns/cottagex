'use client';

import { useState } from 'react';
import { MapPin, Star, Heart, ExternalLink } from 'lucide-react';
import { initialProperties } from '@/lib/mock-data';

export default function PropertyGallery() {
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [properties] = useState(initialProperties);

  const filters = ['Tout', 'Bord de l\'eau', 'Isolé', 'Luxe', 'Animaux acceptés', 'Spa'];

  return (
    <section className="px-4 md:px-8 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40]">Browse Recommended Cottages</h2>
            <p className="text-gray-500 mt-2">Handpicked cabins tailored to your favorite wilderness scenery.</p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-[#1F51C6] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'Tout' ? 'All' : filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {properties
            .filter(p => activeFilter === 'Tout' || p.tag === activeFilter)
            .map((prop) => (
              <div key={prop.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group flex flex-col justify-between">
                <div className="relative h-36 md:h-56 overflow-hidden bg-slate-100">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/95 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-[#1F51C6]">
                    {prop.tag}
                  </div>
                  <button className="absolute top-2 md:top-4 right-2 md:right-4 p-1.5 md:p-2 bg-white/50 hover:bg-white backdrop-blur-sm rounded-full text-slate-600 transition-colors">
                    <Heart size={14} className={prop.isLiked ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                </div>

                <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1 md:mb-2 gap-0.5 md:gap-2">
                      <h3 className="font-bold text-[#0B1B40] text-sm md:text-lg leading-tight line-clamp-1">{prop.title}</h3>
                      <div className="flex items-center gap-0.5 text-xs font-medium bg-slate-50 px-1.5 py-0.5 rounded-lg w-fit">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[11px] md:text-sm">{prop.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-500 text-xs md:text-sm mb-2 md:mb-4">
                      <MapPin size={12} className="mr-1 text-[#1F51C6]" />
                      <span className="line-clamp-1">{prop.location}</span>
                    </div>
                    <p className="hidden md:block text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">{prop.description}</p>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 md:pt-3 border-t border-slate-100 gap-2">
                    <div>
                      <span className="text-sm md:text-xl font-bold text-[#1F51C6]">${prop.price}</span>
                      <span className="text-[10px] md:text-sm text-slate-500">/night</span>
                    </div>
                    <a
                      href="https://www.vrbo.com/search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1 w-full md:w-auto"
                    >
                      Check <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
