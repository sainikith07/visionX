
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
  const [statusMessage, setStatusMessage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [brushSize, setBrushSize] = useState(30);
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
        // Match canvas to image aspect ratio but keep responsive width
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const scale = containerWidth / img.width;
        canvas.width = containerWidth;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // Red Mask
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
      setStatusMessage("Image loaded. Brush over objects to remove them.");
    }
  };

  const processImage = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setStatusMessage("AI is analyzing selected regions...");
    
    try {
      // Export current canvas state (Original + Mask) as base64
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setTimeout(() => setStatusMessage("Inpainting floor and wall textures..."), 2000);
      
      const prompt = `Specifically remove the objects highlighted by the user (indicated by red brush marks) and inpaint the area with matching background textures. ${instructions}`;
      const result = await stageRoom(dataUrl, prompt);
      
      setProcessedUrl(result);
      setStatusMessage("Object successfully removed and inpainted!");
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setStatusMessage("Error during inpainting. Please try again.");
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
    setStatusMessage("Canvas reset. Brush tool active.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-4">Precision Inpainting Stager</h1>
          <p className="text-slate-400">Brush over specific objects to remove and inpaint them with AI.</p>
        </div>
        {previewUrl && !processedUrl && (
          <div className="glass p-4 rounded-2xl flex items-center gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Brush Size</span>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32 accent-blue-500"
              />
            </div>
            <button 
              onClick={resetCanvas}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Clear Mask
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-8 rounded-3xl border-blue-500/20">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <i className="fa-solid fa-paintbrush text-blue-500"></i> How to use
            </h3>
            <div className="space-y-6">
              {[
                { title: "Upload", desc: "Select a high-resolution room photo." },
                { title: "Select Object", desc: "Brush over the specific item (sofa, chair, lamp) you want to remove." },
                { title: "Inpaint", desc: "Our AI replaces the object with contextually aware textures." }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg glass border border-slate-700 flex items-center justify-center font-black text-blue-400 shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{step.title}</h4>
                    <p className="text-slate-500 text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4">Special Instructions</h3>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. 'Ensure the wood flooring matches exactly after removal...'"
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`relative glass border-2 border-dashed rounded-[2.5rem] p-4 flex flex-col items-center justify-center transition-all ${isProcessing ? 'border-purple-500/50' : 'border-slate-700'}`}
          >
            {isProcessing && (
              <div className="absolute inset-0 z-50 glass rounded-[2.5rem] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
                <p className="text-white font-bold animate-pulse">{statusMessage}</p>
              </div>
            )}

            {!previewUrl ? (
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-600 text-4xl">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Drop Interior Photo</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload a room photo to start specific object removal.</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl glow-hover transition-all">
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-8 group">
                  {processedUrl ? (
                    <img src={processedUrl} className="w-full h-auto animate-fade-in" alt="Staged" />
                  ) : (
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-auto cursor-crosshair active:scale-[0.99] transition-transform"
                    />
                  )}
                  
                  {processedUrl && userTier === UserTier.FREE && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 select-none">
                      <div className="rotate-12 text-6xl font-black text-white/40">VISION-X PREVIEW</div>
                    </div>
                  )}
                  
                  {!processedUrl && (
                    <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-black text-white tracking-widest uppercase">
                      Masking Tool Active
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  {!processedUrl ? (
                    <button 
                      onClick={processImage}
                      className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl glow-hover"
                    >
                      Inpaint Selection
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <a href={processedUrl} download="staged_room.png" className="px-10 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg">
                        Download Result
                      </a>
                      <button onClick={() => { setPreviewUrl(null); setProcessedUrl(null); setFile(null); }} className="px-10 py-4 glass text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                        New Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 p-4 glass rounded-2xl text-sm text-slate-400">
            <i className={`fa-solid fa-wand-magic-sparkles ${isProcessing ? 'animate-pulse text-purple-500' : 'text-blue-500'}`}></i>
            <span>{statusMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeStaging;
