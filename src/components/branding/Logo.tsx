import React from 'react';

export const BrandFavicon = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 30 140 L 100 70 L 170 140" stroke="#1F51C6" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
    <path d="M 45 140 L 100 85 L 155 140" stroke="#1F51C6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    <path d="M 60 140 L 100 100 L 140 140" stroke="#1F51C6" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="1"/>
    <path d="M 100 102 L 103 111 L 111 110 L 108 115 L 115 117 L 109 120 L 111 125 L 103 124 L 102 133 L 98 133 L 97 124 L 89 125 L 91 120 L 85 117 L 92 115 L 89 111 L 97 112 Z" fill="#1F51C6" />
  </svg>
);

export const BrandLogoFull = ({ className = "h-12" }) => (
  <div className={`flex items-center ${className}`}>
    <BrandFavicon className="w-12 h-12 mr-3" />
    <div className="h-10 w-[2px] bg-slate-300 mr-4 hidden sm:block"></div>
    <div className="flex flex-col justify-center select-none">
      <span className="text-3xl font-extrabold text-[#1F51C6] leading-none tracking-tight font-serif">Cottage</span>
      <span className="text-xs font-bold text-slate-500 tracking-[0.25em] uppercase leading-none mt-1">RENTALS</span>
    </div>
  </div>
);
