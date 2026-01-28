
import React from 'react';
import { DEVELOPER_INFO, APP_NAME } from '../constants';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <section className="mb-20">
        <h1 className="text-5xl font-black text-white mb-8">About <span className="gradient-text">{APP_NAME}</span></h1>
        <div className="space-y-6 text-slate-400 leading-relaxed text-lg">
          <p>
            In today’s digital communication era, images and videos are frequently captured using mobile devices for documentation, record keeping, and virtual interaction. However, such visual content often contains unwanted elements such as shadows, fingers, background clutter, outdated furniture, or sensitive personal items.
          </p>
          <p>
            <span className="text-white font-bold">VISION-X</span> provides an intelligent and automated solution capable of detecting these unwanted objects and removing them intelligently without affecting the background, enhancing readability, privacy, and presentation quality.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="glass p-8 rounded-3xl border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">The Vision</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our vision is to democratize professional-grade image editing through artificial intelligence. We believe that everyone should be able to produce clean, high-quality visual assets without needing years of manual editing expertise in complex software.
          </p>
        </div>
        <div className="glass p-8 rounded-3xl border-blue-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Smart Document Cleaning</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Virtual Real Estate Staging</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Real-time Video Privacy</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> AI-Powered Inpainting</li>
          </ul>
        </div>
      </section>

      <section id="contact" className="glass p-12 rounded-[2rem] border-slate-700 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Get Connected</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Have questions or want to collaborate? Reach out to the developer team.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 text-left">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Developer</p>
            <p className="text-white font-bold">{DEVELOPER_INFO.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Institution</p>
            <p className="text-white font-bold">{DEVELOPER_INFO.college}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
            <p className="text-white font-bold">{DEVELOPER_INFO.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Phone</p>
            <p className="text-white font-bold">{DEVELOPER_INFO.phone}</p>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <a href={DEVELOPER_INFO.linkedin} className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-2xl text-blue-400 hover:scale-110 transition-all">
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a href={DEVELOPER_INFO.github} className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-2xl text-white hover:scale-110 transition-all">
            <i className="fa-brands fa-github"></i>
          </a>
          <a href={`mailto:${DEVELOPER_INFO.email}`} className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-2xl text-purple-400 hover:scale-110 transition-all">
            <i className="fa-solid fa-envelope"></i>
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
