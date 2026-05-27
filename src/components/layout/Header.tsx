'use client';

import { useState } from 'react';
import { LayoutDashboard, X, Menu } from 'lucide-react';
import { BrandLogoFull } from '@/components/branding/Logo';
import Link from 'next/link';

type HeaderProps = {
  locale: string;
};

export default function Header({ locale }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Explore', href: `/${locale}` },
    { label: 'Ontario', href: `/${locale}/locations/ontario` },
    { label: 'Guides & Articles', href: `/${locale}/guides` },
    { label: 'About Us', href: `/${locale}/about` },
    { label: 'Contact', href: `/${locale}/contact` },
  ];

  return (
    <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <Link href={`/${locale}`} className="cursor-pointer">
        <BrandLogoFull />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:text-[#1F51C6] transition-colors py-2"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link
          href={`/${locale}/admin`}
          className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 transition-colors"
        >
          <LayoutDashboard size={14} /> Admin Panel
        </Link>
        <button className="text-sm font-medium hover:text-[#1F51C6] transition-colors">Log In</button>
        <button className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md shadow-blue-500/10">
          Sign Up
        </button>
      </div>

      <button
        className="md:hidden text-gray-600 p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-white shadow-xl z-40 p-4 flex flex-col gap-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2.5 border-b border-gray-100 text-left font-medium text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/admin`}
            className="py-2.5 border-b border-gray-100 text-left font-medium text-red-600 flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard size={16} /> Admin Panel
          </Link>
          <div className="flex flex-col gap-3 mt-4">
            <button className="border border-[#1F51C6] text-[#1F51C6] px-4 py-2.5 rounded-full font-medium w-full">Log In</button>
            <button className="bg-[#1F51C6] text-white px-4 py-2.5 rounded-full font-medium w-full">Sign Up</button>
          </div>
        </div>
      )}
    </nav>
  );
}
