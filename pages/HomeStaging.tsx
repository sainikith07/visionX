
import React, { useState, useRef, useEffect } from 'react';
import { stageRoom } from '../services/geminiService';
import { UserTier } from '../types';

interface HomeStagingProps {
  userTier?: UserTier;
}

const HomeStaging: React.FC<HomeStagingProps> = ({ userTier = UserTier.FREE }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Upload a photo to begin staging.");
  const [instructions, setInstructions] = useState("");
  const [brushSize, setBrushSize] = useState(40);
  const [isBrushing, setIsBrushing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize Canvas for Masking
  useEffect(() => {
    if (previewUrl && canvasRef.current) {
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
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)'; // Solid red for better AI detection
          ctx.lineWidth = brushSize;
          contextRef.current = ctx;
        }
      };
    }
  }, [previewUrl]);

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
    contextRef.current.lineWidth = brushSize;
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
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessedUrl(null);
      setStatusMessage("Brush over ALL objects you want to remove.");
    }
  };

  const processImage = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setStatusMessage("AI is erasing all selected objects...");
    
    try {
      // Create a copy of the canvas with solid red marks for AI processing
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasRef.current.width;
      exportCanvas.height = canvasRef.current.height;
      const eCtx = exportCanvas.getContext('2d');
      if (eCtx) {
        eCtx.drawImage(canvasRef.current, 0, 0);
      }
      
      const dataUrl = exportCanvas.toDataURL('image/png');
      const prompt = `Remove every single item highlighted with red. Fill the voids with high-quality interior textures matching the existing room. ${instructions}`;
      const result = await stageRoom(dataUrl, prompt);
      
      setProcessedUrl(result);
      setStatusMessage("Selection removed successfully!");
      setIsProcessing(false);
    } catch (err) {
      setStatusMessage("Inpainting failed. Try a smaller selection.");
      setIsProcessing(false);
    }
  };

  const resetCanvas = () => {
    setProcessedUrl(null);
    if (previewUrl && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
      };
    }
    setStatusMessage("Mask cleared. Select objects.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Interior Inpainting</h1>
          <p className="text-slate-400">Brush over multiple objects to remove them in one professional sweep.</p>
        </div>
        {previewUrl && !processedUrl && (
          <div className="glass p-4 rounded-2xl flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brush Scale</span>
              <input 
                type="range" 
                min="10" 
                max="150" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32 accent-blue-600"
              />
            </div>
            <button onClick={resetCanvas} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest">
              Reset Mask
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-3xl border-blue-500/20">
            <h3 className="text-lg font-bold text-white mb-6">Instructions</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black">1</div>
                <p className="text-xs text-slate-400">Upload a clear photo of the interior.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black">2</div>
                <p className="text-xs text-slate-400">Brush over <b>multiple</b> objects (lamps, rugs, clutter).</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black">3</div>
                <p className="text-xs text-slate-400">Click Inpaint to see a clean, empty room.</p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">AI Guidance</h3>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. 'Match the marble floor precisely...'"
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative glass border-2 border-dashed border-slate-800 rounded-[3rem] p-4 flex flex-col items-center justify-center overflow-hidden min-h-[500px]">
            {isProcessing && (
              <div className="absolute inset-0 z-50 glass flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                <p className="text-white font-black animate-pulse uppercase tracking-widest">{statusMessage}</p>
              </div>
            )}

            {!previewUrl ? (
              <div className="text-center py-24">
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center text-slate-700 text-4xl mx-auto mb-8">
                  <i className="fa-solid fa-house-chimney-user"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Room Stager</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload an image to start removing furniture and clutter.</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">
                  Browse Media
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-8 group bg-slate-950">
                  {processedUrl ? (
                    <div className="relative">
                      <img src={processedUrl} className="w-full h-auto animate-fade-in" alt="Staged" />
                      {userTier === UserTier.FREE && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                           <div className="rotate-[-15deg] text-6xl font-black text-white">VISION-X PREVIEW</div>
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

                <div className="flex gap-4 justify-center">
                  {!processedUrl ? (
                    <button 
                      onClick={processImage}
                      className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl glow-hover transition-all"
                    >
                      Process Selection
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <a href={processedUrl} download="staged_interior.png" className="px-10 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg">
                        Save Output
                      </a>
                      <button onClick={() => { setPreviewUrl(null); setProcessedUrl(null); }} className="px-10 py-4 glass text-white font-bold rounded-2xl">
                        Reset Canvas
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 glass rounded-2xl text-[10px] font-black text-slate-500 flex items-center gap-3 uppercase tracking-[0.2em]">
            <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i>
            {statusMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeStaging;
