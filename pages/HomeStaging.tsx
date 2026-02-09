
import React, { useState, useRef, useEffect } from 'react';
import { stageRoom } from '../services/geminiService';
import { UserTier } from '../types';

interface HomeStagingProps {
  userTier?: UserTier;
}

const HomeStaging: React.FC<HomeStagingProps> = ({ userTier = UserTier.FREE }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Upload a photo to begin staging.");
  const [instructions, setInstructions] = useState("");
  const [brushSize, setBrushSize] = useState(40);
  const [isBrushing, setIsBrushing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

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
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // Vibrant Red for AI detection
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
      setStatusMessage("Brush over objects to remove.");
    }
  };

  const processImage = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setStatusMessage("AI is analyzing architectural context...");
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const prompt = `Remove every single item highlighted with red. Cleanly inpaint the area with matching floor and wall textures. ${instructions}`;
      const result = await stageRoom(dataUrl, prompt);
      
      setProcessedUrl(result);
      setStatusMessage("Staging complete. View the transformation.");
      setIsProcessing(false);
    } catch (err) {
      setStatusMessage("Processing error. Try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Virtual Stager <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-400 font-medium">Clear out furniture and clutter with architectural precision.</p>
        </div>
        {previewUrl && !processedUrl && (
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-6 border-slate-700">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brush Density</span>
              <input 
                type="range" min="10" max="120" value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32 accent-blue-600 h-1 rounded-lg"
              />
            </div>
            <button onClick={() => setPreviewUrl(null)} className="text-xs font-black text-red-400 hover:text-red-300 uppercase tracking-widest">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-6 rounded-3xl border-slate-800">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Control Panel</h3>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Example: 'Leave the ceiling lights, but remove the sofa and rug...'"
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {processedUrl && (
            <div className="glass p-6 rounded-3xl border-blue-500/20 bg-blue-500/5">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Comparison Tools</h4>
              <button 
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl transition-all border border-white/10 mb-3"
              >
                HOLD TO VIEW ORIGINAL
              </button>
              <a href={processedUrl} download="staged_room.png" className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all">
                <i className="fa-solid fa-download"></i> EXPORT HD
              </a>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="relative glass border-2 border-dashed border-slate-800 rounded-[3rem] p-4 flex flex-col items-center justify-center overflow-hidden min-h-[600px] shadow-2xl">
            {isProcessing && (
              <div className="absolute inset-0 z-50 glass flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white font-black animate-pulse uppercase tracking-[0.2em]">{statusMessage}</p>
              </div>
            )}

            {!previewUrl ? (
              <div className="text-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center text-slate-700 text-4xl mx-auto mb-8 group-hover:scale-110 transition-transform group-hover:text-blue-500 border-slate-800">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Import Media</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">Select a professional photo of the interior you wish to refine.</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
                  Open File Explorer
                </button>
              </div>
            ) : (
              <div className="w-full h-full">
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
                  {showOriginal ? (
                    <img src={previewUrl} className="w-full h-auto" alt="Original" />
                  ) : processedUrl ? (
                    <div className="relative">
                      <img src={processedUrl} className="w-full h-auto animate-fade-in" alt="Staged" />
                      {userTier === UserTier.FREE && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-[10px] font-black text-white/40 tracking-widest border border-white/5">
                          VISION-X PREVIEW
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
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={processImage}
                      className="px-16 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
                    >
                      Inpaint Selection
                    </button>
                  </div>
                )}
                
                {processedUrl && (
                   <div className="mt-8 flex justify-center gap-4">
                      <button onClick={() => { setPreviewUrl(null); setProcessedUrl(null); }} className="px-10 py-4 glass text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                        New Project
                      </button>
                   </div>
                )}
              </div>
            )}
          </div>
          <div className="px-6 py-4 glass rounded-2xl text-[10px] font-black text-slate-500 flex items-center justify-between uppercase tracking-[0.2em]">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-shield-halved text-emerald-500"></i>
              {statusMessage}
            </div>
            {previewUrl && <span>Canvas Status: {processedUrl ? 'RENDERED' : 'EDITING'}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeStaging;
