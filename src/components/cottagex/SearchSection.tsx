type SearchSectionProps = {
  locale: string;
  title?: string;
  description?: string;
};

const provinces = [
  { id: 'ontario', name: 'Ontario', nameFr: 'Ontario', tagline: 'Land of a Thousand Lakes', taglineFr: 'Le pays des mille lacs' },
  { id: 'quebec', name: 'Quebec', nameFr: 'Québec', tagline: 'European Charm, Wild Nature', taglineFr: 'Charme européen, nature sauvage' },
  { id: 'britishColumbia', name: 'British Columbia', nameFr: 'Colombie-Britannique', tagline: 'Where Mountains Meet the Sea', taglineFr: 'Où les montagnes rencontrent la mer' },
  { id: 'alberta', name: 'Alberta', nameFr: 'Alberta', tagline: 'Rocky Mountain Majesty', taglineFr: 'La majesté des Rocheuses' },
];

export default function SearchSection({ locale, title, description }: SearchSectionProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {title}
          </h2>
          {description && (
            <p className="text-slate-500 mt-2 text-sm sm:text-base">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {provinces.map((prov) => {
            const name = locale === 'fr' ? prov.nameFr : prov.name;
            const tagline = locale === 'fr' ? prov.taglineFr : prov.tagline;
            return (
              <a
                key={prov.id}
                href={`/${locale}/cottage-country/${prov.id}`}
                className="group bg-white rounded-[2rem] p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="text-lg sm:text-xl font-bold text-[#191e3b] border-b border-slate-50 pb-3 mb-3">{name}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{tagline}</p>
                <span className="inline-block mt-4 text-xs font-semibold text-[#0f51ec] group-hover:underline">
                  {locale === 'fr' ? 'Voir les chalets' : 'View chalets'} &rarr;
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
