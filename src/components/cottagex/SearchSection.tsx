type SearchColumnLink = { text: string; url: string };
type SearchColumn = { title: string; links: SearchColumnLink[] };

type SearchSectionProps = {
  locale: string;
  title?: string;
  description?: string;
  columns?: SearchColumn[];
};

export default function SearchSection({ locale, title, description, columns }: SearchSectionProps) {
  if (!title && !description && (!columns || columns.length === 0)) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-50">
      <div className="text-center mb-10">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>
            {title}
          </h2>
        )}
        {description && (
          <p className="text-slate-500 mt-2 text-sm sm:text-base">{description}</p>
        )}
      </div>

      {columns && columns.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {columns.map((col, ci) => (
            <div key={ci} className="bg-white rounded-[2rem] p-5 sm:p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-[#191e3b] border-b border-slate-50 pb-3 mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {(col.links || []).map((link, li) => (
                  <li key={li}>
                    <a href={link.url} className="text-sm text-[#0f51ec] hover:underline">{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
