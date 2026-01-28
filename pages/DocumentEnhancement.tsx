
import React, { useState, useRef } from 'react';
import { enhanceDocument } from '../services/geminiService';
import { UserTier } from '../types';

interface DocumentEnhancementProps {
  userTier?: UserTier;
}

const DocumentEnhancement: React.FC<DocumentEnhancementProps> = ({ userTier = UserTier.FREE }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessedUrl(null);
      setStatusMessage("Source file locked.");
    }
  };

  const processImage = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    setStatusMessage("Analyzing optical artifacts...");
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file!);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await enhanceDocument(base64);
        setProcessedUrl(result);
        setStatusMessage("Refinement complete.");
        setIsProcessing(false);
      };
    } catch (err) {
      setStatusMessage("Processing error.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Document Refinement</h1>
        <p className="text-slate-400">AI-powered removal of shadows, fingers, and background clutter from scanned docs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-6 rounded-3xl border-slate-700">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Pro Refinement Demo</h3>
            <div className="space-y-4">
              <div className="relative group">
                <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&q=80" className="rounded-2xl border border-slate-800 grayscale sepia brightness-50" alt="Bad Scan" />
                <span className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] text-white font-bold">RAW INPUT</span>
              </div>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=500&q=80" className="rounded-2xl border border-blue-500/30 contrast-125 brightness-110 grayscale" alt="Clean Scan" />
                <span className="absolute top-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-[10px] text-white font-bold">VISION-X OUTPUT</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Our AI detects specific shadow geometries and reconstructs the background white-balance for perfect readability.</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-3xl border border-blue-500/30">
             <h4 className="text-white font-black mb-2">Unlock Pro Export</h4>
             <ul className="text-xs text-slate-400 space-y-2 mb-6">
               <li><i className="fa-solid fa-check text-blue-500 mr-2"></i> No Watermarks</li>
               <li><i className="fa-solid fa-check text-blue-500 mr-2"></i> 600 DPI High-Res</li>
               <li><i className="fa-solid fa-check text-blue-500 mr-2"></i> Batch Uploads</li>
             </ul>
             <button className="w-full py-3 bg-white text-black font-black rounded-xl text-xs hover:scale-105 transition-all">Go Premium</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 min-h-[500px] flex flex-col items-center justify-center relative">
            {isProcessing && (
              <div className="absolute inset-0 z-50 glass rounded-[2.5rem] flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                 <p className="text-white font-black animate-pulse uppercase tracking-widest">{statusMessage}</p>
              </div>
            )}

            {!previewUrl ? (
              <div className="text-center">
                <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-8 text-slate-500 text-3xl">
                   <i className="fa-solid fa-file-arrow-up"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Upload Document</h3>
                <p className="text-slate-500 mb-8">Click or drag images to begin AI enhancement.</p>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Select Image</button>
              </div>
            ) : (
              <div className="w-full space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Image</span>
                       <img src={previewUrl} className="rounded-2xl border border-slate-800 shadow-2xl" alt="Preview" />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Enhanced Result</span>
                       {processedUrl ? (
                         <div className="relative">
                            <img src={processedUrl} className="rounded-2xl border border-blue-500/50 shadow-2xl" alt="Result" />
                            {userTier === UserTier.FREE && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                 <div className="rotate-[-15deg] border-4 border-white/50 px-6 py-2 text-4xl font-black text-white/50">VISION-X</div>
                              </div>
                            )}
                         </div>
                       ) : (
                         <div className="aspect-[4/3] glass rounded-2xl flex items-center justify-center text-slate-800 text-4xl">
                            <i className="fa-solid fa-wand-sparkles animate-pulse"></i>
                         </div>
                       )}
                    </div>
                 </div>
                 <div className="flex gap-4 justify-center">
                    {!processedUrl ? (
                      <button onClick={processImage} className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl glow-hover">Enhance Document</button>
                    ) : (
                      <a href={processedUrl} download="enhanced.png" className="px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg">Download File</a>
                    )}
                    <button onClick={() => setPreviewUrl(null)} className="px-10 py-4 glass text-white font-bold rounded-2xl">New Project</button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEnhancement;
