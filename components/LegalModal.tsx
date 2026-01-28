
import React, { useState } from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'TERMS' | 'PRIVACY'>('TERMS');
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  if (!isOpen) return null;

  const terms = [
    { title: "1. Acceptance of Terms", content: "By accessing VISION-X, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use our services." },
    { title: "2. User Conduct", content: "Users are responsible for the content they upload. VISION-X does not claim ownership of user data but requires access to process requested AI functions." },
    { title: "3. Subscription Tiers", content: "Free users are subject to usage limits and watermarks. Premium users receive priority processing and high-quality outputs as per their plan." }
  ];

  const privacyTimeline = [
    { date: "Oct 2023", title: "Policy Launch", desc: "Initial privacy framework established to protect user image uploads." },
    { date: "Jan 2024", title: "End-to-End Encryption", desc: "Implemented secure transit for all documents being processed by Gemini AI." },
    { date: "Current", title: "Transparency Update", desc: "Detailed disclosure on how local storage is used for user session persistence." }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative glass w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[2rem] flex flex-col shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('TERMS')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'TERMS' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => setActiveTab('PRIVACY')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'PRIVACY' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Privacy Policy
            </button>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'TERMS' ? (
            <div className="space-y-4">
              <p className="text-slate-500 text-sm mb-6">Please read our service agreement carefully.</p>
              {terms.map((item, idx) => (
                <div key={idx} className="glass rounded-xl border-slate-800 overflow-hidden">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-bold text-white">{item.title}</span>
                    <i className={`fa-solid fa-chevron-down transition-transform ${openAccordion === idx ? 'rotate-180' : ''}`}></i>
                  </button>
                  {openAccordion === idx && (
                    <div className="p-4 pt-0 text-slate-400 text-sm leading-relaxed animate-fade-in">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 mb-8">
                <h3 className="text-lg font-bold text-white mb-2">Data Protection Commitment</h3>
                <p className="text-slate-400 text-sm">We process uploaded images solely for enhancement. We do not sell user data.</p>
              </div>

              <div className="relative pl-8 space-y-12">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800"></div>
                {privacyTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-10 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div className="glass p-5 rounded-2xl border-slate-800">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.date}</span>
                      <h4 className="text-white font-bold mt-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800 text-center flex justify-center gap-4">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-900/20"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
