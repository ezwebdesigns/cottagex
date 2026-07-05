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
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[#0f51ec] font-semibold mt-2 text-sm sm:text-base">{subtitle}</p>
        )}
        {description && (
          <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <div key={i} className="bg-[#191e3b] p-6 sm:p-8 rounded-[2rem] flex gap-4 items-start">
            <div className="p-3 bg-white text-[#0f51ec] rounded-2xl shrink-0">
              {iconMap[item.icon] || <Compass size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
