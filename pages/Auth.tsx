
import React, { useState } from 'react';
import { User, UserTier } from '../types';

interface AuthProps {
  type: 'SIGNIN' | 'SIGNUP';
  onAuthSuccess: (user: User) => void;
  onSwitch: () => void;
}

const Auth: React.FC<AuthProps> = ({ type, onAuthSuccess, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (type === 'SIGNUP') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || 'User',
        email: email,
        tier: UserTier.FREE
      };
      localStorage.setItem(`user_${email}`, JSON.stringify({ ...newUser, password }));
      localStorage.setItem('current_user', JSON.stringify(newUser));
      onAuthSuccess(newUser);
    } else {
      const stored = localStorage.getItem(`user_${email}`);
      if (stored) {
        const userData = JSON.parse(stored);
        if (userData.password === password) {
          const { password: _, ...userWithoutPass } = userData;
          localStorage.setItem('current_user', JSON.stringify(userWithoutPass));
          onAuthSuccess(userWithoutPass);
        } else {
          setError("Invalid credentials.");
        }
      } else {
        setError("User not found. Please sign up.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="glass p-10 rounded-[2.5rem] shadow-2xl border-slate-700 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl">
            V
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {type === 'SIGNIN' ? 'Welcome Back' : 'Join VISION-X'}
          </h2>
          <p className="text-slate-500 text-sm">
            {type === 'SIGNIN' ? 'Access your AI workspace' : 'Start your professional journey'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'SIGNUP' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sai Nikith"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nikith@ace.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all shadow-xl glow-hover text-lg mt-4"
          >
            {type === 'SIGNIN' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {type === 'SIGNIN' ? "New to VISION-X?" : "Already a member?"}
            {' '}
            <button 
              onClick={onSwitch}
              className="text-blue-400 font-bold hover:underline"
            >
              {type === 'SIGNIN' ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
