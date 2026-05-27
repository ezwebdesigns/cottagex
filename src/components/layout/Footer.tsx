import { BrandFavicon } from '@/components/branding/Logo';
import Link from 'next/link';

type FooterProps = {
  locale: string;
};

export default function Footer({ locale }: FooterProps) {
  return (
    <footer className="bg-[#0B1B40] text-white pt-16 pb-8 px-4 md:px-8 mt-16 border-t border-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between mb-16 shadow-lg gap-8">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h3 className="text-2xl font-bold mb-2">Unlock Exclusive Cottage Deals</h3>
            <p className="text-blue-100/80 text-sm">Join our newsletter to receive premium seasonal recommendation lists first.</p>
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter email address"
              className="px-6 py-3 rounded-full text-gray-800 outline-none w-full sm:w-72 focus:ring-2 focus:ring-[#1F51C6]"
            />
            <button className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap">
              Join the Club
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl mb-6">
              <BrandFavicon className="w-8 h-8" />
              <span>Cottage<span className="text-[#1F51C6]">Escape</span></span>
            </Link>
            <p className="text-blue-100/70 text-sm mb-6 max-w-xs leading-relaxed">
              Your premier directory for comparing beautiful wilderness retreats in Canada. Powered transparently by affiliate connections with VRBO and Expedia Group.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-300">Discover</h4>
            <ul className="flex flex-col gap-3 text-blue-100/80 text-sm">
              <li><Link href={`/${locale}`} className="hover:text-white transition-colors font-semibold">All Cottages</Link></li>
              <li><Link href={`/${locale}/locations/ontario`} className="hover:text-white transition-colors font-semibold">Ontario Region</Link></li>
              <li><Link href={`/${locale}/locations/quebec`} className="hover:text-white transition-colors">Quebec Region</Link></li>
              <li><Link href={`/${locale}/locations/british-columbia`} className="hover:text-white transition-colors">Western Canada</Link></li>
              <li><Link href={`/${locale}`} className="hover:text-white transition-colors">Lakefront Cabins</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-300">About</h4>
            <ul className="flex flex-col gap-3 text-blue-100/80 text-sm">
              <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors font-medium">Our Story</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors font-medium">Contact Us</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors font-semibold">Affiliation Partnership</Link></li>
              <li><Link href={`/${locale}/admin`} className="text-red-300 hover:text-red-100 transition-colors font-semibold">Moderator Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-300">Support & Legal</h4>
            <ul className="flex flex-col gap-3 text-blue-100/80 text-sm">
              <li><Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors font-medium">Terms of Use</Link></li>
              <li><Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors font-medium">Affiliate Disclosure</Link></li>
              <li><Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-100/60">
          <p>© {new Date().getFullYear()} Cottage Escape. All rights reserved. Cottage Escape is an independent travel affiliate partner.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors font-medium">Privacy</Link>
            <Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors font-medium">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
