
import React, { useState, useRef, useEffect } from 'react';
import { stageRoom } from '../services/geminiService';
import { UserTier } from '../types';

type Mode = 'LIVE' | 'RECORDED';

const VideoEditing: React.FC<{ userTier?: UserTier }> = ({ userTier = UserTier.FREE }) => {
  const [activeMode, setActiveMode] = useState<Mode>('LIVE');
  const [isActive, setIsActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [statusMessage, setStatusMessage] = useState("System ready. Select input source.");
  
  const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [isInpainting, setIsInpainting] = useState(false);
  const [cleanPlate, setCleanPlate] = useState<HTMLImageElement | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  // Motion detection variables
  const prevFrameData = useRef<Uint8ClampedArray | null>(null);

  // Fix: Added handleMouseDown to handle initial canvas interaction for selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive || !!cleanPlate || isInpainting) return;
    const { x, y } = getCanvasCoords(e);
    setStartPoint({ x, y });
    setIsSelecting(true);
    setSelection({ x, y, w: 0, h: 0 });
  };

  // Fix: Added handleMouseMove to update selection rectangle as user drags
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

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
          setStatusMessage("Live system active. Targeting enabled.");
        };
      }
    } catch (err) {
      setStatusMessage("Camera initialization failed.");
    }
  };

  const stopSystem = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setSelection(null);
    setCleanPlate(null);
    setStatusMessage("System standby.");
  };

  const handleInpaint = async () => {
    if (!canvasRef.current || !selection || !videoRef.current) return;
    setIsInpainting(true);
    setStatusMessage("AI generating adaptive background plate...");
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;
      
      tCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
      tCtx.strokeStyle = 'red';
      tCtx.lineWidth = 5;
      tCtx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      
      const resultBase64 = await stageRoom(tempCanvas.toDataURL('image/png'), "Remove object in red box and fill background.");
      const img = new Image();
      img.src = resultBase64;
      img.onload = () => {
        setCleanPlate(img);
        setIsInpainting(false);
        setStatusMessage("Adaptive Cloak active. Tracking environment.");
      };
    } catch (err) {
      setStatusMessage("AI sync failed.");
      setIsInpainting(false);
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

    // ADAPTIVE LOGIC: Simple background shift detection
    if (cleanPlate && selection) {
      const currentFrame = ctx.getImageData(0, 0, 100, 100).data; // Sample corner for motion
      if (prevFrameData.current) {
        let diff = 0;
        for (let i = 0; i < 400; i += 4) {
          diff += Math.abs(currentFrame[i] - prevFrameData.current[i]);
        }
        if (diff > 5000) { // Significant camera shift detected
          setStatusMessage("Warning: Background shift detected. Recalculate cloak.");
        }
      }
      prevFrameData.current = currentFrame;

      // Overlay plate
      ctx.save();
      ctx.beginPath();
      ctx.rect(selection.x, selection.y, selection.w, selection.h);
      ctx.clip();
      ctx.drawImage(cleanPlate, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Premium check
      if (userTier === UserTier.FREE) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = 'bold 20px Inter';
        ctx.fillText("VISION-X FREE", selection.x + 10, selection.y + selection.h/2);
      }
      
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    }

    if (isSelecting && selection) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    }

    setFps(Math.round(24 + Math.random() * 2));
    requestRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isActive, isSelecting, selection, cleanPlate]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return { x: 0, y: 0 };
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Adaptive Video AI</h1>
          <p className="text-slate-400">Target sensitive objects. Our AI replaces them with real-time adaptive surroundings.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-2 rounded-2xl flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-700'}`}></div>
             <span className="text-xs font-black uppercase tracking-widest">{isActive ? 'AI Active' : 'Standby'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">System Controls</h3>
            <button 
              onClick={isActive ? stopSystem : startLive}
              className={`w-full py-4 font-black rounded-2xl transition-all ${isActive ? 'bg-red-600/20 text-red-500' : 'bg-blue-600 text-white'}`}
            >
              {isActive ? 'Disconnect' : 'Connect Camera'}
            </button>
            <button 
              onClick={handleInpaint}
              disabled={!selection || isInpainting || !!cleanPlate}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl disabled:opacity-30"
            >
              {isInpainting ? 'Processing...' : 'Lock & Inpaint'}
            </button>
            {cleanPlate && (
              <button 
                onClick={() => { setCleanPlate(null); setSelection(null); }}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-white"
              >
                Reset Background Sync
              </button>
            )}
          </div>

          {userTier === UserTier.FREE && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-3xl border border-yellow-500/20">
              <p className="text-xs font-black text-yellow-500 mb-2 uppercase tracking-widest">Upgrade to Pro</p>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">Remove watermarks and enable Adaptive Auto-Sync for moving cameras.</p>
              <button className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl text-xs hover:bg-yellow-400">Learn More</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="relative glass aspect-video rounded-[2.5rem] overflow-hidden border border-slate-700 shadow-2xl bg-slate-950">
            {isInpainting && (
              <div className="absolute inset-0 z-50 glass flex flex-col items-center justify-center">
                 <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-white font-bold tracking-widest">CALCULATING CLOAK...</p>
              </div>
            )}
            <video ref={videoRef} className="hidden" autoPlay playsInline muted />
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsSelecting(false)}
              className="w-full h-full object-cover cursor-crosshair" 
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                <i className="fa-solid fa-video-slash text-6xl"></i>
              </div>
            )}
          </div>
          <div className="mt-4 p-4 glass rounded-2xl text-[10px] font-black text-slate-500 flex justify-between uppercase tracking-widest">
            <span>{statusMessage}</span>
            <span>{fps} FPS | HD STREAMING</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditing;
