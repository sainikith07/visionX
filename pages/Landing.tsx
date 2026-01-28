
import React from 'react';
import { APP_NAME, APP_SUBTITLE } from '../constants';

interface LandingProps {
  onNavigate: (path: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10"></div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-white/5 mb-10 animate-bounce-slow">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            <span className="text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase">Enterprise Vision Solution</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[1] tracking-tighter text-white">
            Visionary AI <br />
            <span className="gradient-text drop-shadow-[0_10px_10px_rgba(168,85,247,0.2)]">Refinement.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-light">
            {APP_SUBTITLE} <br className="hidden md:block" />
            <span className="font-medium text-slate-300">Professional toolsets for modern documentation and space staging.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => onNavigate('/docs')}
              className="group relative px-12 py-5 bg-white text-black font-black rounded-[2rem] transition-all hover:scale-105 active:scale-95 text-xl overflow-hidden"
            >
              <span className="relative z-10">Start Creating</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-black">Get Started</span>
            </button>
            <button 
              onClick={() => onNavigate('/video')}
              className="px-12 py-5 glass border-slate-700 text-white font-bold rounded-[2rem] transition-all hover:bg-slate-800/80 text-xl flex items-center gap-3"
            >
              <i className="fa-solid fa-play text-blue-500"></i> Try Live Demo
            </button>
          </div>

          <div className="mt-20 flex items-center justify-center gap-10 opacity-30 grayscale">
            <i className="fa-brands fa-google text-4xl"></i>
            <i className="fa-brands fa-microsoft text-4xl"></i>
            <i className="fa-brands fa-amazon text-4xl"></i>
            <i className="fa-brands fa-apple text-4xl"></i>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Document Cleaner",
              desc: "Remove shadows, fingers, and artifacts from physical document photos.",
              icon: "fa-file-shield",
              color: "text-purple-400",
              path: "/docs",
              accent: "from-purple-500/20"
            },
            {
              title: "Virtual Staging",
              desc: "Effortlessly remove furniture to visualize the potential of any property.",
              icon: "fa-couch",
              color: "text-blue-400",
              path: "/staging",
              accent: "from-blue-500/20"
            },
            {
              title: "Privacy Shield",
              desc: "Real-time background masking for privacy in video interactions.",
              icon: "fa-shield-halved",
              color: "text-emerald-400",
              path: "/video",
              accent: "from-emerald-500/20"
            }
          ].map((feat, i) => (
            <div 
              key={i} 
              className={`relative glass p-10 rounded-[3rem] group hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden bg-gradient-to-br ${feat.accent} to-transparent`}
              onClick={() => onNavigate(feat.path)}
            >
              <div className={`w-16 h-16 rounded-[1.5rem] glass flex items-center justify-center text-3xl ${feat.color} mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-black/20`}>
                <i className={`fa-solid ${feat.icon}`}></i>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed mb-8">
                {feat.desc}
              </p>
              <div className="flex items-center gap-3 text-sm font-black text-blue-500 group-hover:gap-6 transition-all">
                Launch Application <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto glass rounded-[3rem] p-16 text-center border-slate-700/50">
           <h2 className="text-4xl font-black text-white mb-6">Ready to upgrade your workflow?</h2>
           <p className="text-slate-400 mb-10 text-lg">Join thousands of professionals using VISION-X to perfect their visual assets daily.</p>
           <button 
             onClick={() => onNavigate('/signup')}
             className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all glow-hover"
           >
             Create Free Account
           </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
