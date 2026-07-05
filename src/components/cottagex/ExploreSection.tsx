import { Waves, Trees, Compass, MapPin, Mountain, TreePine, Sunrise, Sailboat, Bath, Users, Gem, Dog, Heart, Home, Umbrella, Building2, MountainSnow, Footprints } from 'lucide-react';

type ExploreItem = { icon: string; title: string; description: string };

type ExploreSectionProps = {
  title?: string;
  description?: string;
  subtitle?: string;
  items?: ExploreItem[];
};

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves size={24} />, Trees: <Trees size={24} />, Compass: <Compass size={24} />,
  MapPin: <MapPin size={24} />, Mountain: <Mountain size={24} />, TreePine: <TreePine size={24} />,
  Sunrise: <Sunrise size={24} />, Sailboat: <Sailboat size={24} />, Bath: <Bath size={24} />,
  Users: <Users size={24} />, Gem: <Gem size={24} />, Dog: <Dog size={24} />,
  Heart: <Heart size={24} />, Home: <Home size={24} />, Umbrella: <Umbrella size={24} />,
  Building2: <Building2 size={24} />, MountainSnow: <MountainSnow size={24} />, Footprints: <Footprints size={24} />,
};

export default function ExploreSection({ title, description, subtitle, items = [] }: ExploreSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-3">{subtitle}</p>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {title}
          </h2>
          {description && (
            <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <div key={i} className="bg-slate-50 p-8 sm:p-10 rounded-[2rem] border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="p-3.5 bg-[#0f51ec]/10 text-[#0f51ec] rounded-2xl w-fit mb-5">
                {iconMap[item.icon] || <Compass size={24} />}
              </div>
              <h3 className="text-xl font-bold text-[#191e3b] mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}