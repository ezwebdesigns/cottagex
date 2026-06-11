export default function ComingSoon({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0B1B40] to-[#1a3a6b] text-white px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          {isFr ? 'Chalet Express' : 'Chalet Express'}
        </h1>
        <div className="w-16 h-1 bg-[#ffcb00] mx-auto mb-8 rounded-full" />
        <p className="text-xl md:text-2xl text-blue-100/80 mb-4 leading-relaxed">
          {isFr
            ? 'Nous revenons bientôt avec une expérience améliorée.'
            : 'Coming back soon with an enhanced experience.'}
        </p>
        <p className="text-base text-blue-200/60 mb-12">
          {isFr
            ? 'Notre site est actuellement en maintenance. Les réservations reprendront le 1er juillet.'
            : 'Our site is currently under maintenance. Bookings will resume on July 1st.'}
        </p>
        <div className="flex items-center justify-center gap-3 text-blue-200/40 text-sm">
          <span>© {new Date().getFullYear()} Chalet Express</span>
          <span className="w-1 h-1 rounded-full bg-blue-200/20" />
          <span>Canada</span>
        </div>
      </div>
    </div>
  );
}
