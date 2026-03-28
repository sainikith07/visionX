import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import DocumentEnhancement from './pages/DocumentEnhancement';
import HomeStaging from './pages/HomeStaging';
import VideoEditing from './pages/VideoEditing';
import About from './pages/About';
import Auth from './pages/Auth';
import PasscodeModal from './components/PasscodeModal';
import { User, UserTier } from './types';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [user, setUser] = useState<User | null>(null);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setCurrentPath('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setUser(null);
    setCurrentPath('/');
  };

  const handleUpgrade = () => {
    console.log("handleUpgrade called", { user });
    if (user) {
      setIsPasscodeModalOpen(true);
    } else {
      console.log("No user found, navigating to signin");
      setCurrentPath('/signin');
    }
  };

  const handlePasscodeConfirm = (passcode: string) => {
    console.log("Passcode entered:", passcode);
    if (passcode === "6703") {
      const upgradedUser = { ...user!, tier: UserTier.PREMIUM };
      setUser(upgradedUser);
      
      // Update current session
      localStorage.setItem('current_user', JSON.stringify(upgradedUser));
      
      // Update persistent user record
      const storedUser = localStorage.getItem(`user_${user!.email}`);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        localStorage.setItem(`user_${user!.email}`, JSON.stringify({ ...userData, tier: UserTier.PREMIUM }));
      }
      
      setIsPasscodeModalOpen(false);
      alert("Success! VISION-X PRO features are now unlocked.");
    } else {
      alert("Invalid passcode. Please contact support to obtain access.");
    }
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Landing onNavigate={handleNavigate} user={user} onUpgrade={handleUpgrade} />;
      case '/docs':
        return <div className="max-w-7xl mx-auto px-6 py-20"><DocumentEnhancement userTier={user?.tier || UserTier.FREE} /></div>;
      case '/staging':
        return <HomeStaging userTier={user?.tier || UserTier.FREE} />;
      case '/video':
        return <VideoEditing userTier={user?.tier || UserTier.FREE} />;
      case '/about':
        return <About />;
      case '/signin':
        return <Auth type="SIGNIN" onAuthSuccess={handleAuthSuccess} onSwitch={() => setCurrentPath('/signup')} />;
      case '/signup':
        return <Auth type="SIGNUP" onAuthSuccess={handleAuthSuccess} onSwitch={() => setCurrentPath('/signin')} />;
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout 
      activePath={currentPath} 
      onNavigate={handleNavigate} 
      user={user} 
      onLogout={handleLogout}
      onUpgrade={handleUpgrade}
    >
      <div className="animate-fade-in">
        {renderPage()}
      </div>
      <PasscodeModal 
        isOpen={isPasscodeModalOpen} 
        onClose={() => setIsPasscodeModalOpen(false)} 
        onConfirm={handlePasscodeConfirm} 
      />
    </Layout>
  );
};

export default App;