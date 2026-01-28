
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
            V
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            VISION<span className="text-blue-500">X</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`text-xs font-black uppercase tracking-widest transition-colors hover:text-blue-400 ${
                activePath === item.path ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {user.tier === 'FREE' && (
                <button 
                  onClick={onUpgrade}
                  className="hidden sm:block px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] font-black rounded-full hover:bg-yellow-500 hover:text-black transition-all"
                >
                  UPGRADE PRO
                </button>
              )}
              <div className="flex items-center gap-3 glass px-3 py-1.5 rounded-full border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <button onClick={onLogout} className="text-xs font-bold text-slate-400 hover:text-red-400">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('/signin')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-full transition-all glow-hover uppercase tracking-widest"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass mt-20 border-t border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-6">VISION<span className="text-blue-500">X</span></h3>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Leading the next generation of professional AI image refinement. Built for creators by <span className="text-white font-bold">{DEVELOPER_INFO.name}</span>.
            </p>
            <div className="flex gap-6">
              <a href={DEVELOPER_INFO.linkedin} target="_blank" rel="noreferrer" className="text-2xl text-slate-500 hover:text-blue-400 transition-colors">
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a href={DEVELOPER_INFO.github} target="_blank" rel="noreferrer" className="text-2xl text-slate-500 hover:text-white transition-colors">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href={`mailto:${DEVELOPER_INFO.email}`} className="text-2xl text-slate-500 hover:text-purple-400 transition-colors">
                <i className="fa-solid fa-envelope"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4 text-xs text-slate-400 font-bold">
              {NAV_ITEMS.map(item => (
                <li key={item.path}><button onClick={() => onNavigate(item.path)} className="hover:text-blue-400 transition-colors">{item.name}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Contact</h4>
            <div className="text-xs text-slate-400 space-y-4">
              <p className="flex items-center gap-3"><i className="fa-solid fa-university text-blue-500"></i> {DEVELOPER_INFO.college}</p>
              <p className="flex items-center gap-3"><i className="fa-solid fa-envelope text-blue-500"></i> {DEVELOPER_INFO.email}</p>
              <p className="flex items-center gap-3"><i className="fa-solid fa-location-dot text-blue-500"></i> Hyderabad, India</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} VISION-X AI. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <button onClick={() => setIsLegalOpen(true)} className="hover:text-white">Privacy</button>
            <button onClick={() => setIsLegalOpen(true)} className="hover:text-white">Terms</button>
            <button onClick={() => setIsLegalOpen(true)} className="hover:text-white">Security</button>
          </div>
        </div>
      </footer>

      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
};

export default Layout;
