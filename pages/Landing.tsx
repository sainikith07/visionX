import React, { useState } from 'react';
import { APP_NAME, APP_SUBTITLE, USAGE_STEPS, PRO_FEATURES, DEVELOPER_INFO } from '../constants';
import { motion } from 'framer-motion';
import { User, UserTier } from '../types';

interface LandingProps {
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  onUpgrade?: () => void;
  user?: User | null;
}

const Landing: React.FC<LandingProps> = ({ onNavigate, onUpgrade, user }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate sending email
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFeedback('');
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-white/5 mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            <span className="text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase">V2.4 Enterprise Release</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tighter text-white"
          >
            VISIONARY AI <br />
            <span className="gradient-text drop-shadow-[0_10px_10px_rgba(168,85,247,0.2)]">SIMPLIFIED.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-light"
          >
            {APP_SUBTITLE} <br className="hidden md:block" />
            Designed for engineers, architects, and creators.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={() => onNavigate('/docs')}
              className="group relative px-12 py-5 bg-white text-black font-black rounded-[2rem] transition-all hover:scale-105 active:scale-95 text-xl overflow-hidden"
            >
              <span className="relative z-10">Launch Tools</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-black">Get Started</span>
            </button>
            <button 
              onClick={() => onNavigate('/video')}
              className="px-12 py-5 glass border-slate-700 text-white font-bold rounded-[2rem] transition-all hover:bg-slate-800/80 text-xl flex items-center gap-3"
            >
              <i className="fa-solid fa-play text-blue-500"></i> Live Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it Works / Steps Section */}
      <section className="py-24 px-6 glass border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">The Workflow</h2>
            <h3 className="text-4xl font-black text-white">Four Steps to Perfection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {USAGE_STEPS.map((step, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div className="text-8xl font-black text-white/5 absolute -top-10 -left-4 select-none">{step.step}</div>
                <div className="relative">
                  <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRO Features Showcase */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <h2 className="text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
                Unlock the <span className="text-amber-500">Pro</span> Experience
              </h2>
              <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                Remove usage limits and watermarks while gaining access to our highest resolution models.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {PRO_FEATURES.map((feature, idx) => (
                  <div key={idx} className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-xl">
                      <i className={`fa-solid ${feature.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{feature.title}</h4>
                      <p className="text-slate-500 text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user?.tier !== UserTier.PREMIUM && (
                <button 
                  onClick={() => user ? onUpgrade?.() : onNavigate('/signup')}
                  className="mt-12 px-10 py-4 bg-amber-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-900/20 uppercase tracking-widest text-xs"
                >
                  Go Premium Now
                </button>
              )}
              {user?.tier === UserTier.PREMIUM && (
                <div className="mt-12 inline-flex items-center gap-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black rounded-2xl uppercase tracking-widest text-xs">
                  <i className="fa-solid fa-crown"></i>
                  Pro Active
                </div>
              )}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full"
            >
              <div className="glass rounded-[3rem] p-4 border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-12">
                  <p className="text-white font-bold">Unwatermarked 4K Output (Pro Tier Only)</p>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000" 
                  className="w-full rounded-[2.5rem] grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Pro Preview"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-32 px-6 glass border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">WE VALUE YOUR FEEDBACK</h2>
          <p className="text-slate-400 mb-12">Help us improve VISION-X by sharing your thoughts and suggestions.</p>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div className="relative">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                placeholder="Share your experience or report an issue..."
                className="w-full h-40 bg-slate-950 border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:border-blue-500 transition-all resize-none font-medium placeholder:text-slate-700 shadow-inner"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || submitted}
              className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                submitted 
                ? 'bg-emerald-500 text-white' 
                : 'bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20'
              }`}
            >
              {isSubmitting ? 'Sending...' : submitted ? 'Feedback Received!' : 'Submit Feedback'}
            </button>
            {submitted && (
              <p className="text-emerald-500 text-xs font-bold animate-fade-in">
                Thank you! Your feedback has been sent to {DEVELOPER_INFO.email}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-t border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12">Trusted by teams at</h2>
           <div className="flex flex-wrap justify-center gap-16 opacity-20 grayscale">
              <i className="fa-brands fa-google text-5xl"></i>
              <i className="fa-brands fa-microsoft text-5xl"></i>
              <i className="fa-brands fa-amazon text-5xl"></i>
              <i className="fa-brands fa-apple text-5xl"></i>
              <i className="fa-brands fa-dropbox text-5xl"></i>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
