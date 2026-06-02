type Props = { rating: number; size?: number };

export default function StarRating({ rating, size = 11 }: Props) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 > 0;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const key = `star-${rating.toString().replace('.', '-')}`;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`${key}-f${i}`} width={size} height={size} viewBox="0 0 24 24" fill="#ffcb00" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      {hasHalf && (
        <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`${key}-half`}>
              <stop offset="50%" stopColor="#ffcb00" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#${key}-half)`} stroke="#ffcb00" strokeWidth={1} strokeLinejoin="miter"/>
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`${key}-e${i}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ffcb00" strokeWidth={1} strokeLinejoin="miter" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}
