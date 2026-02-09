
import React, { useState, useRef } from 'react';
import { enhanceDocument } from '../services/geminiService';
import { UserTier } from '../types';

const DocumentEnhancement: React.FC<{ userTier?: UserTier }> = ({ userTier = UserTier.FREE }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
  };

  const processImage = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    try {
      // Logic to fetch base64 from blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const result = await enhanceDocument(reader.result as string);
        setProcessedUrl(result);
        setIsProcessing(false);
      };
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">AI Document Master</h1>
        <p className="text-slate-400 font-medium">Professional shadow removal and background reconstruction.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl border-slate-700">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Quality Standard</h3>
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                <img src="https://images.unsplash.com/photo-1568667256549-094345857637?w=500&q=80" className="w-full h-40 object-cover grayscale brightness-50 contrast-75" alt="Low quality" />
                <div className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded text-[8px] font-black text-white">RAW SCAN</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <img src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=500&q=80" className="w-full h-40 object-cover brightness-110 contrast-125" alt="High quality" />
                <div className="absolute top-2 left-2 bg-blue-600 px-2 py-0.5 rounded text-[8px] font-black text-white">VISION-X PRO</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">Our model uses edge-detection to separate shadows from ink, restoring the document's original background color.</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8 rounded-3xl border border-yellow-500/20">
            <h4 className="text-yellow-500 font-black text-sm mb-2 uppercase tracking-widest">Go Professional</h4>
            <p className="text-slate-400 text-xs mb-6">Upgrade to remove watermarks and unlock high-resolution export for printing.</p>
            <button className="w-full py-3 bg-yellow-500 text-black font-black rounded-xl text-xs hover:scale-105 transition-all">Upgrade Now</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass min-h-[500px] rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 z-50 glass flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white font-black tracking-widest uppercase animate-pulse">Filtering Artifacts...</p>
              </div>
            )}

            {!previewUrl ? (
              <div className="text-center">
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center text-slate-700 text-4xl mx-auto mb-8">
                  <i className="fa-solid fa-file-invoice"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Refine Your Scan</h3>
                <p className="text-slate-500 mb-8 max-w-sm">Upload a photo of any document with shadows or fingers.</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">
                  Select Document
                </button>
              </div>
            ) : (
              <div className="w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Raw Capture</span>
                    <img src={previewUrl} className="w-full rounded-2xl border border-slate-800 shadow-2xl" alt="Preview" />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Refined</span>
                    <div className="relative">
                      {processedUrl ? (
                        <>
                          <img src={processedUrl} className="w-full rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/10" alt="Processed" />
                          {userTier === UserTier.FREE && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                              <div className="rotate-[-20deg] border-4 border-white/50 px-6 py-2 text-4xl font-black text-white/50">VISION-X</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="aspect-[3/4] glass rounded-2xl flex items-center justify-center text-slate-800 text-5xl">
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  {!processedUrl ? (
                    <button onClick={processImage} className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Enhance Document</button>
                  ) : (
                    <a href={processedUrl} download="enhanced_doc.png" className="px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Download Result</a>
                  )}
                  <button onClick={() => setPreviewUrl(null)} className="px-10 py-4 glass text-white font-bold rounded-2xl border-slate-700">Reset</button>
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
