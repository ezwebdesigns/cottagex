import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type LocaleLayoutProps = {
  children: React.ReactNode;
  locale: string;
  menuItems?: { label: string; href: string }[];
  logo?: string;
};

export default function LocaleLayout({ children, locale, menuItems, logo }: LocaleLayoutProps) {
  return (
    <div className="text-gray-800 bg-[#f8fafc] min-h-screen flex flex-col justify-between">
      <div>
        <Header locale={locale} menuItems={menuItems} logo={logo} />
        {children}
      </div>
      <Footer locale={locale} />
    </div>
  );
}
