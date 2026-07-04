// Destinations - paste from Base44
// Paste your Base44 code here.
import React from 'react';
import { Pencil, MapPin } from 'lucide-react';

const dests = [
  { id: 'ontario', name: 'Ontario', tagline: 'Land of a Thousand Lakes', cottages: 3, image: 'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=400&q=80' },
  { id: 'quebec', name: 'Quebec', tagline: 'European Charm, Wild Nature', cottages: 2, image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=400&q=80' },
  { id: 'britishColumbia', name: 'British Columbia', tagline: 'Where Mountains Meet the Sea', cottages: 1, image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=400&q=80' },
  { id: 'alberta', name: 'Alberta', tagline: 'Rocky Mountain Majesty', cottages: 2, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=400&q=80' }
];

export default function Destinations() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dests.map((d) => (
          <div key={d.id} className="flex rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
              <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#77e1fb] text-xs font-medium mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {d.cottages} cottages
                </div>
                <h3 className="font-bold text-[#191e3b] text-base mb-0.5" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{d.name}</h3>
                <p className="text-xs text-slate-400">{d.tagline}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f51ec] text-white text-xs font-semibold hover:bg-[#0d44c9] transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-[#191e3b] hover:bg-slate-50 transition-colors">
                  View Page
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}