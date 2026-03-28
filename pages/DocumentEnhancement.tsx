import React, { useState, useRef, useEffect } from 'react';
import { enhanceDocument } from '../services/geminiService';
import { applyWatermark } from '../services/imageUtils';
import { UserTier } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentEnhancement: React.FC<{ userTier?: UserTier }> = ({ userTier = UserTier.FREE }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (processedUrl) {
      applyWatermark(processedUrl, userTier).then(setDownloadUrl);
    } else {
      setDownloadUrl(null);
    }
  }, [processedUrl, userTier]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setError(null);
  };

  const processImage = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const result = await enhanceDocument(reader.result as string);
          setProcessedUrl(result);
        } catch (err: any) {
          setError(err.message || "Failed to process document.");
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      setError("Failed to load image for processing.");
      setIsProcessing(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setProcessedUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-16 animate-fade-in pb-20">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Archival Tool</span>
             {userTier === UserTier.PREMIUM && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Pro Mode</span>}
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">Document Master</h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
            Eliminate shadows, ink bleeds, and obstructions from camera scans. 
            The professional choice for OCR preprocessing and digital restoration.
          </p>
        </motion.div>
        {!previewUrl && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs"
          >
            Upload Document
          </motion.button>
        )}
      </section>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Steps Section */}
      {!previewUrl && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
          {[
            { step: "01", title: "Upload", desc: "Select a scanned or photographed document" },
            { step: "02", title: "Analyze", desc: "AI detects shadows, fingers, and noise" },
            { step: "03", title: "Enhance", desc: "Cleaning visual disturbances" },
            { step: "04", title: "Result", desc: "Preview and download output" }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-3"
            >
              <span className="text-3xl font-black text-blue-500/20">{s.step}</span>
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">{s.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </section>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 font-bold flex items-center gap-4"
        >
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
          <div>
            <p className="text-sm">Processing Error</p>
            <p className="text-xs opacity-70">{error}</p>
          </div>
        </motion.div>
      )}

      {!previewUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div 
            whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
            onClick={() => fileInputRef.current?.click()}
            className="lg:col-span-2 group glass h-[500px] rounded-[3.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 cursor-pointer transition-all bg-slate-900/20"
          >
            <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center text-slate-700 text-4xl mb-8 group-hover:scale-110 group-hover:text-blue-500 transition-all border border-white/5 shadow-2xl">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Drop Document Here</h3>
            <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">Supports PNG, JPG, or high-res mobile camera snapshots.</p>
          </motion.div>
          
          <div className="glass rounded-[3.5rem] p-10 border-white/5 flex flex-col justify-center">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Restoration Sample</h4>
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 group mb-6">
               <img 
                 src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=400" 
                 className="w-full h-full object-cover grayscale opacity-50" 
                 alt="Example"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-4 py-2 glass rounded-full text-[9px] font-black text-white uppercase tracking-widest">Before / After</span>
               </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Our AI removes complex shadows and restores text legibility in seconds.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Original Input</span>
              <div className="flex gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">Change</button>
                <button onClick={removeImage} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">Remove</button>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-5 rounded-[3rem] border-white/5 bg-slate-900/40"
            >
              <img src={previewUrl} className="w-full rounded-[2rem] shadow-2xl" alt="Preview" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Refined Result</span>
              {processedUrl && (
                <div className="flex gap-4">
                  <a href={downloadUrl || processedUrl} download="VISIONX_RESTORED.png" className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-download"></i> Download
                  </a>
                </div>
              )}
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-5 rounded-[3rem] border-blue-500/20 bg-blue-500/5 relative min-h-[500px] flex items-center justify-center"
            >
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 glass rounded-[3rem] flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Neural Reconstruction...</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {processedUrl ? (
                <div className="relative group">
                  <img src={processedUrl} className="w-full rounded-[2rem] shadow-2xl" alt="Processed" />
                  {userTier === UserTier.FREE && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
                       <span className="text-5xl font-black text-white/10 rotate-[-45deg] select-none tracking-[0.5em] whitespace-nowrap mb-10">VISION_X OUTPUT</span>
                       <div className="absolute bottom-10 flex items-center gap-2 opacity-20">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">V</div>
                          <span className="text-sm font-black text-white tracking-tighter">VISION-X</span>
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-12">
                   {!isProcessing && (
                     <>
                        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 text-3xl mx-auto mb-8 border border-blue-500/20">
                           <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        <button 
                          onClick={processImage}
                          className="px-12 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest"
                        >
                          Execute Refinement
                        </button>
                        <p className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">VLM Inference Engine v2</p>
                     </>
                   )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEnhancement;
