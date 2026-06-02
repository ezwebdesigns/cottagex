type Props = { source: string | null | undefined };

export default function SourceBadge({ source }: Props) {
  const s = (source || '').toLowerCase();
  const isVrbo = s.includes('vrbo');
  const isExpedia = s.includes('expedia');

  if (isVrbo) {
    return (
      <span className="inline-flex items-center justify-center px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-[#003D29]">
        <img src="/images/vrb.jpg" alt="VRBO" className="h-3.5 md:h-4 w-auto" />
      </span>
    );
  }

  if (isExpedia) {
    return (
      <span className="inline-flex items-center justify-center px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-[#00387E]">
        <img src="/images/exp.jpg" alt="Expedia" className="h-3.5 md:h-4 w-auto" />
      </span>
    );
  }

  return (
    <span className="bg-[#1F51C6] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
      {source || 'Featured'}
    </span>
  );
}
