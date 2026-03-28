
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passcode: string) => void;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(passcode);
    setPasscode('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass p-8 rounded-[2rem] border-slate-700 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 text-2xl mx-auto mb-4">
                <i className="fa-solid fa-key"></i>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Pro Access</h3>
              <p className="text-slate-400 text-sm">Enter your Pro Access Passcode to unlock Premium features.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Passcode</label>
                <input 
                  type="password" 
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-800"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all shadow-xl shadow-amber-900/20 uppercase tracking-widest text-xs"
                >
                  Unlock Pro
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasscodeModal;
