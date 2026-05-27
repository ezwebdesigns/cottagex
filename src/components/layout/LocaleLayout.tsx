import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type LocaleLayoutProps = {
  children: React.ReactNode;
  locale: string;
};

export default function LocaleLayout({ children, locale }: LocaleLayoutProps) {
  return (
    <div className="text-gray-800 bg-[#f8fafc] min-h-screen flex flex-col justify-between">
      <div>
        <Header locale={locale} />
        {children}
      </div>
      <Footer locale={locale} />
    </div>
  );
}
