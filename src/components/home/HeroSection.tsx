import { Sparkles } from 'lucide-react';
import { VrboSearchWidget } from '@/components/branding/VrboWidget';

export default function HeroSection() {
  return (
    <div className="px-4 md:px-8 py-6">
      <div
        className="relative min-h-[500px] md:min-h-[580px] rounded-[2rem] overflow-hidden flex flex-col justify-center items-center text-center px-4 py-12"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(11, 27, 64, 0.45), rgba(11, 27, 64, 0.85)), url('https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="mb-4 flex items-center justify-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
          <Sparkles className="text-[#93B4FF] mr-2" size={16} />
          <span className="text-white text-xs font-bold tracking-wider uppercase">Official VRBO Affiliate Search</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-4 tracking-tight">
          Find Your Perfect Canadian Escape
        </h1>
        <p className="text-blue-100/90 text-base md:text-lg mb-8 max-w-2xl font-light">
          Instantly query and secure verified premium lake houses and mountain lodges.
        </p>

        <VrboSearchWidget />
      </div>
    </div>
  );
}
