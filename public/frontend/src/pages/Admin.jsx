// Admin page
// Paste your Base44 code here.
import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import Overview from '@/components/admin/Overview';
import Cottages from '@/components/admin/Cottages';
import Articles from '@/components/admin/Articles';
import Destinations from '@/components/admin/Destinations';
import Pages from '@/components/admin/Pages';
import Homepage from '@/components/admin/Homepage';
import Messages from '@/components/admin/Messages';
import Settings from '@/components/admin/Settings';

const sectionMeta = {
  overview: { title: 'Dashboard', subtitle: 'Welcome back — here\'s what\'s happening' },
  cottages: { title: 'Cottages', subtitle: 'Manage your chalet listings' },
  articles: { title: 'Articles', subtitle: 'Manage your travel guides and blog posts' },
  destinations: { title: 'Destinations', subtitle: 'Manage province and destination pages' },
  pages: { title: 'Pages', subtitle: 'Manage static pages' },
  homepage: { title: 'Homepage', subtitle: 'Customize your homepage content' },
  messages: { title: 'Messages', subtitle: 'Inbox and contact form submissions' },
  settings: { title: 'Settings', subtitle: 'Navigation, footer, logo & favicon' }
};

export default function Admin({ onBackToSite }) {
  const [section, setSection] = useState('overview');
  const meta = sectionMeta[section];

  const renderSection = () => {
    switch (section) {
      case 'cottages': return <Cottages />;
      case 'articles': return <Articles />;
      case 'destinations': return <Destinations />;
      case 'pages': return <Pages />;
      case 'homepage': return <Homepage />;
      case 'messages': return <Messages />;
      case 'settings': return <Settings />;
      default: return <Overview onNavigate={setSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar activeSection={section} onNavigate={setSection} onBackToSite={onBackToSite} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}