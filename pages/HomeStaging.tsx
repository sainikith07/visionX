import React, { useState, useRef, useEffect } from 'react';
import { stageRoom } from '../services/geminiService';
import { applyWatermark } from '../services/imageUtils';
import { UserTier } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeStagingProps {
  userTier?: UserTier;
}

const HomeStaging: React.FC<HomeStagingProps> = ({ userTier = UserTier.FREE }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready for input.");
  const [instructions, setInstructions] = useState("");
  const [brushSize, setBrushSize] = useState(40);
  const [isBrushing, setIsBrushing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (processedUrl) {
      applyWatermark(processedUrl, userTier).then(setDownloadUrl);
    } else {
      setDownloadUrl(null);
    }
  }, [processedUrl, userTier]);

  useEffect(() => {
    if (previewUrl && canvasRef.current && !processedUrl) {
      const canvas = canvasRef.current;
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const scale = containerWidth / img.width;
        canvas.width = containerWidth;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Pro Blue Mask
          ctx.lineWidth = brushSize;
          contextRef.current = ctx;
        }
      };
    }
  }, [previewUrl, processedUrl, brushSize]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    if (!contextRef.current || processedUrl) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsBrushing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isBrushing || !contextRef.current || processedUrl) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsBrushing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessedUrl(null);
      setStatusMessage("Brush over items to remove them from the scene.");
    }
  };

  const processImage = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setStatusMessage("Analyzing architectural textures...");
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const prompt = `Professional Architectural Staging: Remove all objects marked with the blue high-contrast brush. Reconstruct the underlying flooring, wall textures, and lighting naturally. Maintain structural integrity of the room. ${instructions}`;
      const result = await stageRoom(dataUrl, prompt);
      
      setProcessedUrl(result);
      setStatusMessage("Scene reconstructed successfully.");
      setIsProcessing(false);
    } catch (err) {
      setStatusMessage("AI Engine timed out. Please try again.");
      setIsProcessing(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setProcessedUrl(null);
    setStatusMessage("Ready for input.");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-fade-in space-y-16">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Spatial AI</span>
             {userTier === UserTier.PREMIUM && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Studio Mode</span>}
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">Virtual Staging <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
            Reimagine interior spaces by removing furniture and clutter with context-aware inpainting.
          </p>
        </motion.div>
        {previewUrl && !processedUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass px-8 py-5 rounded-[2rem] flex items-center gap-10 border-white/5 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brush Diameter</span>
              <input 
                type="range" min="10" max="150" value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-40 accent-blue-600 h-1 rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">
                Change
              </button>
              <button onClick={removeImage} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* Steps Section */}
      {!previewUrl && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
          {[
            { step: "01", title: "Upload", desc: "Select a room photo with furniture" },
            { step: "02", title: "Brush", desc: "Highlight objects you want to remove" },
            { step: "03", title: "Inpaint", desc: "AI reconstructs the space naturally" },
            { step: "04", title: "Export", desc: "Download the clean, staged photo" }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border-white/5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">AI Command Box</h3>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. 'Keep the windows but remove all the brown furniture...'"
              className="w-full h-40 bg-slate-950 border border-white/5 rounded-2xl p-5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all resize-none font-medium placeholder:text-slate-700 shadow-inner"
            />
          </div>

          {processedUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5 space-y-4"
            >
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Quality Control</h4>
              <button 
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-2xl transition-all border border-white/10 tracking-[0.2em]"
              >
                HOLD TO COMPARE
              </button>
              <a href={downloadUrl || processedUrl} download="STAGED_SPACE.png" className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl hover:bg-blue-700 transition-all tracking-[0.2em] shadow-xl shadow-blue-900/20">
                <i className="fa-solid fa-download"></i> EXPORT HIGH-RES
              </a>
            </motion.div>
          )}
          
          <div className="p-6 glass rounded-[2.5rem] border-white/5 text-[9px] text-slate-500 font-bold leading-relaxed">
             <i className="fa-solid fa-circle-info text-blue-500 mr-2 mb-2"></i>
             PRO TIP: For best results, use a brush size slightly larger than the object you wish to remove.
          </div>

          {/* Sample Image */}
          {!previewUrl && (
            <div className="glass p-6 rounded-[2.5rem] border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Staging Sample</h4>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover grayscale opacity-50"
                  alt="Sample"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-3 py-1 glass rounded-full text-[8px] font-black text-white uppercase tracking-widest">Before / After</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative glass border-2 border-dashed border-white/5 rounded-[4rem] p-6 flex flex-col items-center justify-center overflow-hidden min-h-[650px] shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 glass flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8 shadow-2xl"></div>
                  <p className="text-white font-black animate-pulse uppercase tracking-[0.3em] text-sm">{statusMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!previewUrl ? (
              <div className="text-center group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 glass rounded-[2rem] flex items-center justify-center text-slate-800 text-5xl mx-auto mb-10 group-hover:scale-110 transition-all group-hover:text-blue-500 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] border-white/5">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Add Room Photo</h3>
                <p className="text-slate-500 mb-10 max-w-sm mx-auto text-base font-medium leading-relaxed">Upload an interior snapshot to begin the professional staging process.</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button className="px-12 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-all text-xs uppercase tracking-[0.2em]">
                  Select from Device
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-black shadow-2xl flex-grow">
                  {showOriginal ? (
                    <img src={previewUrl} className="w-full h-auto" alt="Original" />
                  ) : processedUrl ? (
                    <div className="relative group h-full">
                      <img src={processedUrl} className="w-full h-auto animate-fade-in" alt="Staged" />
                      {userTier === UserTier.FREE && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
                           <span className="text-6xl font-black text-white/10 rotate-[-30deg] tracking-[0.5em] whitespace-nowrap mb-10">VISION_X OUTPUT</span>
                           <div className="absolute bottom-10 flex items-center gap-2 opacity-20">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">V</div>
                              <span className="text-sm font-black text-white tracking-tighter">VISION-X</span>
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-auto cursor-crosshair"
                    />
                  )}
                </div>

                {!processedUrl && (
                  <div className="mt-10 flex justify-center">
                    <button 
                      onClick={processImage}
                      className="px-20 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] text-sm"
                    >
                      Inpaint Selection
                    </button>
                  </div>
                )}
                
                {processedUrl && (
                   <div className="mt-10 flex justify-center gap-6">
                      <button onClick={() => { setPreviewUrl(null); setProcessedUrl(null); }} className="px-12 py-5 glass text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all border border-white/5">
                        New Project
                      </button>
                   </div>
                )}
              </div>
            )}
          </div>
          <div className="px-10 py-6 glass rounded-[2rem] text-[10px] font-black text-slate-500 flex items-center justify-between uppercase tracking-[0.3em] border-white/5">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 {statusMessage}
              </span>
            </div>
            {previewUrl && <span>Spatial Resolution: {processedUrl ? '4K ENHANCED' : 'LIVE'}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeStaging;
