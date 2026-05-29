'use client';

import { useState, useMemo } from 'react';
import { X, Menu } from 'lucide-react';
import { BrandLogoFull } from '@/components/branding/Logo';
import Link from 'next/link';

type HeaderProps = {
  locale: string;
  menuItems?: { label: string; href: string }[];
  logo?: string;
};

const defaultNavItems = (locale: string) => [
  { label: 'Explore', href: `/${locale}` },
  { label: 'Ontario', href: `/${locale}/locations/ontario` },
  { label: 'Guides & Articles', href: `/${locale}/guides` },
  { label: 'About Us', href: `/${locale}/about` },
  { label: 'Contact', href: `/${locale}/contact` },
];

export default function Header({ locale, menuItems, logo }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return menuItems.map(item => ({
        ...item,
        href: item.href.replace(/\{locale\}/g, locale),
      }));
    }
    return defaultNavItems(locale);
  }, [menuItems, locale]);

  return (
    <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <Link href={`/${locale}`} className="cursor-pointer">
        {logo ? (
          <img src={logo} alt="Logo" className="h-12 w-auto" />
        ) : (
          <BrandLogoFull />
        )}
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
        </div>
      )}
    </nav>
  );
}
