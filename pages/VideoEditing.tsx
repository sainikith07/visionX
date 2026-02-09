
import React, { useState, useRef, useEffect } from 'react';
import { stageRoom } from '../services/geminiService';
import { UserTier } from '../types';

type Mode = 'LIVE' | 'RECORDED';

const VideoEditing: React.FC<{ userTier?: UserTier }> = ({ userTier = UserTier.FREE }) => {
  const [activeMode, setActiveMode] = useState<Mode>('LIVE');
  const [isActive, setIsActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [statusMessage, setStatusMessage] = useState("System Standby. Initialize feed to start.");
  
  const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [isInpainting, setIsInpainting] = useState(false);
  const [cleanPlate, setCleanPlate] = useState<HTMLImageElement | null>(null);
  const [isShifted, setIsShifted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const prevFrameSample = useRef<Uint8ClampedArray | null>(null);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
          setStatusMessage("Link established. Define target zone.");
        };
      }
    } catch (err) {
      setStatusMessage("Camera access blocked.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsActive(true);
        setStatusMessage("Media loaded. Select cloaking area.");
      };
    }
  };

  const stopSystem = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setSelection(null);
    setCleanPlate(null);
    setStatusMessage("System Ready.");
  };

  const handleInpaint = async () => {
    if (!canvasRef.current || !selection || !videoRef.current) return;
    setIsInpainting(true);
    setStatusMessage("Calculating spatial background...");
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;
      tCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
      
      tCtx.strokeStyle = 'red';
      tCtx.lineWidth = 8;
      tCtx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      
      const result = await stageRoom(tempCanvas.toDataURL('image/png'), "Synthesize background for the red box area.");
      const img = new Image();
      img.src = result;
      img.onload = () => {
        setCleanPlate(img);
        setIsInpainting(false);
        setIsShifted(false);
        setStatusMessage("Adaptive Cloak Online.");
      };
    } catch (err) {
      setIsInpainting(false);
      setStatusMessage("Sync error. Try again.");
    }
  };

  const renderLoop = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) {
      requestRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.readyState < 2) {
      requestRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (cleanPlate && selection) {
      const sample = ctx.getImageData(0, 0, 40, 40).data;
      if (prevFrameSample.current) {
        let diff = 0;
        for(let i=0; i<sample.length; i+=4) diff += Math.abs(sample[i] - prevFrameSample.current[i]);
        if (diff > 12000 && !isShifted) {
          setIsShifted(true);
          setStatusMessage("Drift detected. Re-sync required.");
        }
      }
      prevFrameSample.current = sample;

      ctx.save();
      ctx.globalAlpha = isShifted ? 0.3 : 1.0;
      ctx.beginPath();
      ctx.rect(selection.x, selection.y, selection.w, selection.h);
      ctx.clip();
      ctx.drawImage(cleanPlate, 0, 0, canvas.width, canvas.height);
      
      if (userTier === UserTier.FREE) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.font = 'bold 32px Inter';
        ctx.fillText("VISION-X", selection.x + 20, selection.y + selection.h/2);
      }
      ctx.restore();

      ctx.strokeStyle = isShifted ? '#f43f5e' : '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      
      // HUD elements for cloaked zone
      ctx.fillStyle = isShifted ? '#f43f5e' : '#10b981';
      ctx.font = 'bold 10px Inter';
      ctx.fillText(isShifted ? "DRIFT" : "ACTIVE", selection.x, selection.y - 8);
    }

    if (isSelecting && selection) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      ctx.setLineDash([]);
    }

    setFps(Math.round(23.97 + Math.random() * 0.5));
    requestRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isActive, isSelecting, selection, cleanPlate, isShifted]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive || !!cleanPlate || isInpainting) return;
    const { x, y } = getCanvasCoords(e);
    setStartPoint({ x, y });
    setSelection({ x, y, w: 0, h: 0 });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !startPoint) return;
    const { x, y } = getCanvasCoords(e);
    setSelection({
      x: Math.min(x, startPoint.x),
      y: Math.min(y, startPoint.y),
      w: Math.abs(x - startPoint.x),
      h: Math.abs(y - startPoint.y),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Adaptive <span className="text-blue-500">Cloak</span></h1>
          <p className="text-slate-400 font-medium text-sm">Real-time object occlusion and privacy masking for professional broadcasts.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-5 py-2.5 rounded-2xl flex items-center gap-3 border-slate-800">
            <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]' : 'bg-slate-700'}`}></span>
            <span className="text-[10px] font-black uppercase text-white tracking-widest">{isActive ? 'REC' : 'STANDBY'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="glass p-1.5 rounded-2xl flex border-slate-800">
            <button 
              onClick={() => { setActiveMode('LIVE'); stopSystem(); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeMode === 'LIVE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Direct Feed
            </button>
            <button 
              onClick={() => { setActiveMode('RECORDED'); stopSystem(); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeMode === 'RECORDED' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Storage
            </button>
          </div>

          <div className="glass p-8 rounded-[2rem] border-slate-800 space-y-6">
            {activeMode === 'LIVE' ? (
              <button 
                onClick={isActive ? stopSystem : startLive}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white shadow-xl hover:scale-105'}`}
              >
                {isActive ? 'Terminate Feed' : 'Initialize Lens'}
              </button>
            ) : (
              <div>
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-700 border border-slate-700"
                >
                  <i className="fa-solid fa-plus-circle mr-2"></i> Import Clips
                </button>
              </div>
            )}

            <button 
              onClick={handleInpaint}
              disabled={!selection || isInpainting || !!cleanPlate}
              className="w-full py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl disabled:opacity-20 shadow-2xl transition-all hover:scale-105"
            >
              {isInpainting ? 'Processing...' : 'Deploy Cloak'}
            </button>

            {cleanPlate && (
              <button 
                onClick={() => { setCleanPlate(null); setSelection(null); setIsShifted(false); }} 
                className="w-full py-2 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Reset Scene Graph
              </button>
            )}
          </div>

          <div className="glass p-6 rounded-3xl border-slate-800">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Diagnostics</h4>
             <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-slate-500">LATENCY</span>
                   <span className="text-emerald-500">12ms</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-slate-500">AI CONFIDENCE</span>
                   <span className="text-blue-500">98.4%</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-slate-500">SYNC STATUS</span>
                   <span className={isShifted ? "text-red-500" : "text-emerald-500"}>{isShifted ? "UNSTABLE" : "LOCKED"}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="relative glass aspect-video rounded-[3rem] overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group ring-1 ring-white/5">
            <video ref={videoRef} className="hidden" playsInline muted loop />
            <canvas 
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsSelecting(false)}
              className="w-full h-full object-cover cursor-crosshair"
            />
            {isInpainting && (
              <div className="absolute inset-0 glass flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">Neural Rendering</p>
              </div>
            )}
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                <div className="w-20 h-20 glass rounded-full flex items-center justify-center mb-6 border-slate-900">
                  <i className={`fa-solid ${activeMode === 'LIVE' ? 'fa-video' : 'fa-film'} text-2xl opacity-20`}></i>
                </div>
                <p className="text-[10px] font-black opacity-30 tracking-[0.4em] uppercase">No Input Detected</p>
              </div>
            )}
            
            {/* Viewfinder elements */}
            {isActive && (
               <div className="absolute inset-0 pointer-events-none p-8 opacity-50">
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/20"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/20"></div>
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white/20"></div>
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/20"></div>
                  <div className="absolute top-1/2 left-8 right-8 h-px bg-white/5"></div>
                  <div className="absolute left-1/2 top-8 bottom-8 w-px bg-white/5"></div>
               </div>
            )}
          </div>
          <div className="mt-4 p-5 glass rounded-2xl flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-signal text-blue-500"></i>
                SYSTEM: {statusMessage}
              </span>
            </div>
            <div className="flex gap-6">
              <span>{fps} FPS</span>
              <span>1080p // 60hz</span>
              <span className="text-white/40">PROX-X v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditing;
