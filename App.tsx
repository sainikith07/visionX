
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import About from './pages/About';
import DocumentEnhancement from './pages/DocumentEnhancement';
import HomeStaging from './pages/HomeStaging';
import VideoEditing from './pages/VideoEditing';
import Auth from './pages/Auth';
import { User, UserTier } from './types';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    setUser(null);
    navigate('/');
  };

  const upgradeToPremium = () => {
    if (!user) return navigate('/signin');
    const upgradedUser = { ...user, tier: UserTier.PREMIUM };
    setUser(upgradedUser);
    localStorage.setItem('current_user', JSON.stringify(upgradedUser));
    alert("VISION-X PRO ACTIVATED");
  };

  const renderPage = () => {
    const userTier = user?.tier || UserTier.FREE;

    switch (currentPath) {
      case '/': return <Landing onNavigate={navigate} />;
      case '/docs': return <DocumentEnhancement userTier={userTier} />;
      case '/staging': return <HomeStaging userTier={userTier} />;
      case '/video': return <VideoEditing userTier={userTier} />;
      case '/about': return <About />;
      case '/signin': return (
        <Auth 
          type="SIGNIN" 
          onAuthSuccess={(u) => { setUser(u); navigate('/'); }} 
          onSwitch={() => navigate('/signup')} 
        />
      );
      case '/signup': return (
        <Auth 
          type="SIGNUP" 
          onAuthSuccess={(u) => { setUser(u); navigate('/'); }} 
          onSwitch={() => navigate('/signin')} 
        />
      );
      default: return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="bg-[#0b0f1a] selection:bg-blue-500/30 selection:text-blue-200">
      <Layout 
        activePath={currentPath} 
        onNavigate={navigate}
        user={user}
        onLogout={logout}
        onUpgrade={upgradeToPremium}
      >
        <div className="animate-in fade-in duration-700">
          {renderPage()}
        </div>
      </Layout>
    </div>
  );
};

export default App;
