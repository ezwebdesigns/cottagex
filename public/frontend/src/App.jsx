// Main App component with routing - paste from Base44
// Paste your Base44 code here.
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Guides from '@/pages/Guides';
import ArticleDetail from '@/pages/ArticleDetail';
import Destination from '@/pages/Destination';
import Terms from '@/pages/Terms';
import Admin from '@/pages/Admin';

function AppContent() {
  const [page, setPage] = useState({ name: 'home', param: null });
  const [favorites, setFavorites] = useState([]);

  const navigate = (name, param = null) => {
    setPage({ name, param });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (chalet) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === chalet.id);
      if (exists) return prev.filter((f) => f.id !== chalet.id);
      return [...prev, chalet];
    });
  };

  // Admin mode — separate layout
  if (page.name === 'admin') {
    return <Admin onBackToSite={() => navigate('home')} />;
  }

  const renderPage = () => {
    switch (page.name) {
      case 'guides':
        return <Guides onNavigate={navigate} />;
      case 'article':
        return <ArticleDetail articleId={page.param} onNavigate={navigate} />;
      case 'destination':
        return <Destination destinationId={page.param} onNavigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} />;
      case 'terms':
        return <Terms />;
      default:
        return <Home onNavigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar onNavigate={navigate} favorites={favorites} currentPage={page.name} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onNavigate={navigate} />
        <main className="flex-1">{renderPage()}</main>
        <Footer onNavigate={navigate} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}