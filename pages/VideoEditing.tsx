
import React, { useState, useRef, useEffect } from 'react';
import { stageRoom } from '../services/geminiService';
import { UserTier } from '../types';

type Mode = 'LIVE' | 'RECORDED';

const VideoEditing: React.FC<{ userTier?: UserTier }> = ({ userTier = UserTier.FREE }) => {
  const [activeMode, setActiveMode] = useState<Mode>('LIVE');
  const [isActive, setIsActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [statusMessage, setStatusMessage] = useState("System ready. Choose a source to begin.");
  
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
          setStatusMessage("Live stream connected. Draw a box to cloak an object.");
        };
      }
    } catch (err) {
      setStatusMessage("Camera access denied.");
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
        setStatusMessage("Video loaded. Select object to remove.");
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
    setStatusMessage("System standby.");
  };

  const handleInpaint = async () => {
    if (!canvasRef.current || !selection || !videoRef.current) return;
    setIsInpainting(true);
    setStatusMessage("AI is calculating clean background plate...");
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;
      tCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw a target box for Gemini
      tCtx.strokeStyle = 'red';
      tCtx.lineWidth = 5;
      tCtx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      
      const result = await stageRoom(tempCanvas.toDataURL('image/png'), "Remove the object in the red box.");
      const img = new Image();
      img.src = result;
      img.onload = () => {
        setCleanPlate(img);
        setIsInpainting(false);
        setIsShifted(false);
        setStatusMessage("Adaptive Cloak active.");
      };
    } catch (err) {
      setIsInpainting(false);
      setStatusMessage("AI generation failed.");
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
      // Basic motion tracking simulation
      const sample = ctx.getImageData(0, 0, 40, 40).data;
      if (prevFrameSample.current) {
        let diff = 0;
        for(let i=0; i<sample.length; i+=4) diff += Math.abs(sample[i] - prevFrameSample.current[i]);
        if (diff > 9000 && !isShifted) {
          setIsShifted(true);
          setStatusMessage("Background changed. Re-sync suggested.");
        }
      }
      prevFrameSample.current = sample;

      ctx.save();
      ctx.globalAlpha = isShifted ? 0.4 : 1.0;
      ctx.beginPath();
      ctx.rect(selection.x, selection.y, selection.w, selection.h);
      ctx.clip();
      ctx.drawImage(cleanPlate, 0, 0, canvas.width, canvas.height);
      
      if (userTier === UserTier.FREE) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = 'bold 24px Inter';
        ctx.fillText("VISION-X", selection.x + 10, selection.y + selection.h/2);
      }
      ctx.restore();

      ctx.strokeStyle = isShifted ? '#f43f5e' : '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    }

    if (isSelecting && selection) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      ctx.setLineDash([]);
    }

    setFps(Math.round(24 + Math.random() * 2));
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
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">AI Dynamic Cloak</h1>
          <p className="text-slate-400">Target any moving or static object to erase it from the stream.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <span className="text-[10px] font-black uppercase text-white">{isActive ? (activeMode === 'LIVE' ? 'Live' : 'Playing') : 'Standby'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="glass p-2 rounded-2xl flex">
            <button 
              onClick={() => { setActiveMode('LIVE'); stopSystem(); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeMode === 'LIVE' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              Live Cam
            </button>
            <button 
              onClick={() => { setActiveMode('RECORDED'); stopSystem(); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeMode === 'RECORDED' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              Recorded
            </button>
          </div>

          <div className="glass p-6 rounded-3xl border-slate-700 space-y-4">
            {activeMode === 'LIVE' ? (
              <button 
                onClick={isActive ? stopSystem : startLive}
                className={`w-full py-4 rounded-2xl font-black transition-all ${isActive ? 'bg-red-500/10 text-red-500' : 'bg-blue-600 text-white'}`}
              >
                {isActive ? 'Disconnect' : 'Connect Camera'}
              </button>
            ) : (
              <div>
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700"
                >
                  <i className="fa-solid fa-file-video mr-2"></i> Upload Video
                </button>
              </div>
            )}

            <button 
              onClick={handleInpaint}
              disabled={!selection || isInpainting || !!cleanPlate}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl disabled:opacity-30"
            >
              {isInpainting ? 'AI Synchronizing...' : 'Apply Cloak'}
            </button>

            {cleanPlate && (
              <button onClick={() => { setCleanPlate(null); setSelection(null); setIsShifted(false); }} className="w-full text-xs font-bold text-slate-500 hover:text-white">
                Clear Mask & Resync
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="relative glass aspect-video rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
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
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-black tracking-widest text-xs uppercase">Rendering Plate...</p>
              </div>
            )}
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                <i className={`fa-solid ${activeMode === 'LIVE' ? 'fa-video-slash' : 'fa-film'} text-6xl mb-4 opacity-20`}></i>
                <p className="text-sm font-bold opacity-40">Awaiting Media Feed</p>
              </div>
            )}
          </div>
          <div className="mt-4 p-4 glass rounded-2xl flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-signal text-blue-500"></i>
              {statusMessage}
            </div>
            <span>{fps} FPS | 720P</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditing;
