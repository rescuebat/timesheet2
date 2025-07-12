// Stopwatch timer display with aurora animation
// Renders the circular timer with animated background effects

import React, { useRef, useEffect } from 'react';
import { formatTime } from '@/utils/timeUtils';

interface StopwatchDisplayProps {
  isRunning: boolean;
  elapsedTime: number;
  displayTime: number;
}

const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  isRunning,
  elapsedTime,
  displayTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);
  const auroraTimeRef = useRef<number>(0);
  const dropRef = useRef<any>(null);

  // Aurora Borealis animation effect
  useEffect(() => {
    if (!canvasRef.current || !fluidCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const fluidCanvas = fluidCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const fluidCtx = fluidCanvas.getContext('2d');
    
    if (!ctx || !fluidCtx) return;
    
    const size = 260;
    canvas.width = size;
    canvas.height = size;
    fluidCanvas.width = size;
    fluidCanvas.height = size;
    
    let animationFrameId: number;
    
    const auroraColors = [
      'rgba(101, 227, 242, 0.65)',
      'rgba(66, 220, 244, 0.65)',
      'rgba(117, 255, 209, 0.60)',
      'rgba(178, 150, 255, 0.65)',
      'rgba(255, 223, 107, 0.60)',
      'rgba(76, 255, 196, 0.65)',
      'rgba(100, 230, 255, 0.65)',
      'rgba(255, 150, 230, 0.60)',
    ];
    
    const drawAurora = (timestamp: number) => {
      if (!auroraTimeRef.current) auroraTimeRef.current = timestamp;
      const delta = timestamp - auroraTimeRef.current;
      auroraTimeRef.current = timestamp;
      
      ctx.clearRect(0, 0, size, size);
      fluidCtx.clearRect(0, 0, size, size);
      
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
      ctx.clip();
      
      const tintOpacity = isRunning ? 0.3 : 0.1;
      ctx.fillStyle = `rgba(235, 245, 255, ${tintOpacity})`;
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        
        const offset = i * 0.5;
        const waveHeight = 35 + i * 12; 
        const speed = 0.0003;
        
        ctx.moveTo(0, size/2);
        
        for (let x = 0; x <= size; x += 2) {
          const noise = Math.sin(x * 0.03 + timestamp * 0.0001) * 8;
          const y = size/2 + 
                    Math.sin(x * 0.015 + timestamp * speed + offset) * waveHeight + 
                    Math.cos(x * 0.025 + timestamp * (speed * 1.5) + offset) * (waveHeight * 0.7) +
                    noise;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, size/2, size, size/2);
        gradient.addColorStop(0, auroraColors[i % auroraColors.length]);
        gradient.addColorStop(0.5, auroraColors[(i + 4) % auroraColors.length]);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3 + (i * 0.05);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      
      if (isRunning) {
        const center = size / 2;
        const radius = size / 2 - 10;
        const progress = (displayTime % 60) / 60;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * progress);
        
        fluidCtx.beginPath();
        fluidCtx.arc(center, center, radius, startAngle, endAngle, false);
        fluidCtx.lineWidth = 6;
        
        const gradient = fluidCtx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, 'rgba(66, 133, 244, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 181, 246, 1)');
        
        fluidCtx.strokeStyle = gradient;
        fluidCtx.lineCap = 'round';
        fluidCtx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(drawAurora);
    };
    
    animationFrameId = requestAnimationFrame(drawAurora);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, displayTime]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full shadow-lg border border-gray-100 bg-white">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <canvas ref={fluidCanvasRef} className="absolute inset-0 z-10" />
      
      {(isRunning || elapsedTime > 0) && (
        <div className="relative flex flex-col items-center justify-center z-20 w-full h-full">
          <div className="text-center w-full z-30">
            <div 
              className="text-5xl font-medium text-gray-800 tracking-tighter font-mono px-4"
              style={{ 
                fontWeight: 400,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              {formatTime(displayTime)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopwatchDisplay;