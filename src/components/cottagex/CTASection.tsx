type CTASectionProps = {
  locale: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  imageAlt?: string;
  fullWidth?: boolean;
};

export default function CTASection({ locale, title, description, buttonText, buttonLink, image, imageAlt, fullWidth }: CTASectionProps) {
  return (
    <section className={`px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${fullWidth ? '' : 'max-w-7xl mx-auto'}`}>
      <div className="bg-[#191e3b] rounded-[2rem] overflow-hidden relative flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 p-8 sm:p-12 z-10 text-white">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {title?.split('\n').map((line, i) => (
              <span key={i}>{line}{i < title!.split('\n').length - 1 && <br />}</span>
            ))}
          </h2>
          {description && (
            <p className="text-white/60 mb-8 max-w-md text-sm sm:text-base leading-relaxed">{description}</p>
          )}
          <a
            href={buttonLink?.replace('{locale}', locale) || `/${locale}/contact`}
            className="inline-flex items-center gap-2 bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors shadow-md"
          >
            {buttonText || (locale === 'fr' ? 'Contacter notre équipe' : 'Contact Partnership Team')}
          </a>
        </div>
        {image && (
          <div className="relative w-full md:w-1/2 h-64 md:h-auto md:absolute md:right-0 md:inset-y-0 opacity-20 md:opacity-100">
            <img src={image} alt={imageAlt || title || ''} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
      </div>
    </section>
  );
}
