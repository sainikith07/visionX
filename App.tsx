
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

  // Persistence logic
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
    // Update permanent record
    localStorage.setItem(`user_${user.email}`, JSON.stringify({ ...upgradedUser, password: '***' }));
    alert("Welcome to VISION-X PREMIUM!");
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
    <Layout 
      activePath={currentPath} 
      onNavigate={navigate}
      user={user}
      onLogout={logout}
      onUpgrade={upgradeToPremium}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
