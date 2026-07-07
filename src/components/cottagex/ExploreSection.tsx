import { Waves, Trees, Compass, MapPin, Mountain, TreePine, Sunrise, Sailboat, Bath, Users, Gem, Dog, Heart, Home, Umbrella, Building2, MountainSnow, Footprints } from 'lucide-react';

type ExploreItem = { icon: string; title: string; description: string };

type ExploreSectionProps = {
  title?: string;
  description?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
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

export default function ExploreSection({ title, description, subtitle, image, imageAlt, items = [] }: ExploreSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-[#191e3b]">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wider text-[#77e1fb] mt-4 mb-3">{subtitle}</p>
          )}
          {description && (
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8">{description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div key={i} className="bg-white p-3 sm:p-4 rounded-2xl border border-white/10 hover:border-[#77e1fb]/30 transition-colors">
                <div className="p-2 bg-[#0f51ec]/10 text-[#0f51ec] rounded-xl w-fit mb-2">
                  {iconMap[item.icon] || <Compass size={18} />}
                </div>
                <h3 className="font-bold text-[#191e3b] mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          {image && (
            <img
              src={image}
              alt={imageAlt || title || ''}
              className="w-full h-full min-h-[300px] lg:min-h-[500px] object-cover rounded-[2rem]"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </section>
  );
}