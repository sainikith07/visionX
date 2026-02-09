
import React, { useState } from 'react';
import { NAV_ITEMS, APP_NAME, DEVELOPER_INFO } from '../constants';
import LegalModal from './LegalModal';

interface LayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
  user?: any;
  onLogout?: () => void;
  onUpgrade?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePath, onNavigate, user, onLogout, onUpgrade }) => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-[60] glass border-b border-slate-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
              V
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              VISION<span className="text-blue-500">X</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-white ${
                  activePath === item.path ? 'text-blue-500' : 'text-slate-400'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-5">
                {user.tier === 'FREE' && (
                  <button 
                    onClick={onUpgrade}
                    className="hidden sm:block px-5 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black rounded-full hover:from-amber-500 hover:to-orange-500 hover:text-black transition-all uppercase tracking-widest shadow-xl shadow-amber-900/5"
                  >
                    GO PRO
                  </button>
                )}
                <div className="flex items-center gap-3 glass pl-2 pr-4 py-1.5 rounded-full border-slate-700/50 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] font-black text-white leading-none mb-0.5">{user.name.split(' ')[0]}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{user.tier}</p>
                  </div>
                  <button onClick={onLogout} className="ml-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors">
                    <i className="fa-solid fa-right-from-bracket"></i>
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('/signin')}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-full transition-all glow-hover uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20"
              >
                Sign In
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-slate-400 text-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 glass border-b border-slate-800 p-6 animate-fade-in flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => { onNavigate(item.path); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-black uppercase tracking-widest py-3 ${
                  activePath === item.path ? 'text-blue-500' : 'text-slate-400'
                }`}
              >
                {item.name}
              </button>
            ))}
            {user && user.tier === 'FREE' && (
               <button onClick={onUpgrade} className="mt-4 w-full py-4 bg-amber-500 text-black font-black rounded-xl text-xs uppercase tracking-widest">
                  Upgrade to Pro
               </button>
            )}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer Section */}
      <footer className="glass mt-20 border-t border-slate-800/50 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black mb-6 text-white tracking-tighter">VISION<span className="text-blue-500">X</span></h3>
            <p className="text-slate-400 max-w-sm mb-10 leading-relaxed font-medium">
              A high-precision AI platform designed to empower professionals with next-gen image and video refinement tools.
            </p>
            <div className="flex gap-6">
              {[
                { icon: 'fa-linkedin', url: DEVELOPER_INFO.linkedin, color: 'hover:text-blue-400' },
                { icon: 'fa-github', url: DEVELOPER_INFO.github, color: 'hover:text-white' },
                { icon: 'fa-envelope', url: `mailto:${DEVELOPER_INFO.email}`, color: 'hover:text-purple-400' }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`w-12 h-12 glass rounded-xl flex items-center justify-center text-xl text-slate-500 transition-all hover:scale-110 ${social.color}`}
                >
                  <i className={`fa-brands ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Navigation</h4>
            <ul className="space-y-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
              {NAV_ITEMS.map(item => (
                <li key={item.path}>
                  <button onClick={() => onNavigate(item.path)} className="hover:text-blue-400 transition-colors">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Engineering</h4>
            <div className="text-xs text-slate-400 space-y-6 font-medium">
              <p className="flex items-start gap-4">
                <i className="fa-solid fa-university text-blue-500 mt-1"></i>
                <span>{DEVELOPER_INFO.college}</span>
              </p>
              <p className="flex items-start gap-4">
                <i className="fa-solid fa-terminal text-blue-500 mt-1"></i>
                <span>Hybrid VLM Architecture</span>
              </p>
              <p className="flex items-start gap-4">
                <i className="fa-solid fa-location-dot text-blue-500 mt-1"></i>
                <span>Hyderabad, TS, India</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-800/30 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} VISION-X AI. DEVELOPED BY {DEVELOPER_INFO.name}.
          </p>
          <div className="flex gap-10 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <button onClick={() => setIsLegalOpen(true)} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setIsLegalOpen(true)} className="hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => setIsLegalOpen(true)} className="hover:text-white transition-colors">GDPR</button>
          </div>
        </div>
      </footer>

      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
};

export default Layout;
