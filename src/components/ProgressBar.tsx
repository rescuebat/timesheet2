import React, { useEffect, useRef, useState } from 'react';

interface ProgressBarProps {
  currentHours: number;
  targetHours?: number;
  color?: string;
  enabled?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentHours,
  targetHours = 8,
  color = '#10b981',
  enabled = false
}) => {
  const progressPercentage = Math.min(currentHours / 3600 / targetHours * 100, 100);
  const hours = (currentHours / 3600).toFixed(1);
  
  const windRef = useRef<HTMLDivElement>(null);
  const [waves, setWaves] = useState<number[]>([]);
  const [boats, setBoats] = useState<{ id: number; top: number; speed: number; type: string; }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate wind effect particles
  useEffect(() => {
    if (!enabled || !windRef.current) return;
    
    const createWindParticles = () => {
      windRef.current!.innerHTML = '';
      
      const particleCount = 24;
      const baseSize = 2;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full pointer-events-none';
        
        const left = Math.random() * progressPercentage;
        const top = Math.random() * 80 + 10;
        const size = Math.random() * baseSize + baseSize;
        const delay = Math.random() * 4;
        const duration = Math.random() * 8 + 6;
        const opacity = Math.random() * 0.3 + 0.05;
        const blur = Math.random() * 3 + 1;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        particle.style.opacity = `${opacity}`;
        particle.style.filter = `blur(${blur}px)`;
        particle.style.background = `rgba(255, 255, 255, ${opacity})`;
        particle.style.animation = `windFloat ${duration}s ease-in-out ${delay}s infinite`;
        
        windRef.current!.appendChild(particle);
      }
    };
    
    createWindParticles();
  }, [enabled, progressPercentage]);

  // Add subtle waves approximately once per minute
  useEffect(() => {
    if (!enabled) return;
    
    const waveInterval = setInterval(() => {
      setWaves(prev => [...prev, Date.now()]);
      setTimeout(() => {
        setWaves(prev => prev.slice(1));
      }, 3000);
    }, 60000 + Math.random() * 15000);
    
    return () => clearInterval(waveInterval);
  }, [enabled]);

  // Add mini boats every 15 minutes
  useEffect(() => {
    if (!enabled) return;
    
    const boatInterval = setInterval(() => {
      const boatTypes = ['sailboat', 'motorboat', 'canoe', 'fish', 'whale', 'shark', 'mermaid', 'turtle', 'buoy', 'jellyfish'];
      const randomType = boatTypes[Math.floor(Math.random() * boatTypes.length)];
      
      setBoats(prev => [...prev, { 
        id: Date.now(), 
        top: Math.random() * 20 + 40,
        speed: 20 + (Math.random() * 8 - 4),
        type: randomType
      }]);
    }, 900000);
    
    return () => clearInterval(boatInterval);
  }, [enabled]);

  // Remove boats after they complete their journey
  useEffect(() => {
    if (!enabled) return;
    
    const cleanup = setInterval(() => {
      setBoats(prev => prev.filter(boat => Date.now() - boat.id <= (boat.speed + 6) * 1000));
    }, 1000);
    
    return () => clearInterval(cleanup);
  }, [enabled]);

  // Calculate muted color for background
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const rgb = hexToRgb(color);
  const mutedColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
  
  // Calculate text color based on background luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance > 0.5 ? 'text-gray-900' : 'text-white';

const renderBoat = (type: string) => {
    const boatSVGs = {
      sailboat: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M6 26L28 26C28 26 26 22 24 22L8 22C6 22 6 26 6 26Z" fill="#8B4513"/>
          <path d="M8 22L24 22L24 20L8 20Z" fill="#D2691E"/>
          <path d="M16 20L16 8L10 16L16 20Z" fill="#FF6B6B"/>
          <path d="M16 20L16 6L22 14L16 20Z" fill="#4ECDC4"/>
          <path d="M16 6L16 4" stroke="#654321" strokeWidth="1"/>
          <circle cx="7" cy="24" r="1" fill="#FFD700"/>
          <circle cx="25" cy="24" r="1" fill="#FFD700"/>
        </svg>
      ),
      motorboat: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 18 24;2 18 24;0 18 24;-2 18 24;0 18 24" keyTimes="0;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/>
            <path d="M4 22 Q6 24, 8 24 L28 24 Q30 24, 32 22 L28 20 Q26 18, 24 20 L12 20 Q10 18, 8 20 Z" fill="url(#motorboatGradient)"/>
            <rect x="14" y="18" width="8" height="4" fill="#FFFFFF"/>
            <circle cx="16" cy="20" r="1" fill="#87CEEB"/>
            <circle cx="20" cy="20" r="1" fill="#87CEEB"/>
            <polygon points="22,18 24,16 26,18" fill="#FF0000"/>
          </g>
          <defs>
            <linearGradient id="motorboatGradient" x1="4" y1="24" x2="32" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2563EB"/>
              <stop offset="0.4" stopColor="#2563EB"/>
              <stop offset="0.5" stopColor="#FFFFFF"/>
              <stop offset="0.6" stopColor="#3B82F6"/>
              <stop offset="1" stopColor="#3B82F6"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      canoe: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M4 22C4 22 6 18 10 18L26 18C30 18 32 22 32 22C32 24 30 26 26 26L10 26C6 26 4 24 4 22Z" fill="url(#canoeGradient)"/>
          <path d="M8 20L28 20C28 20 28 22 28 22L8 22C8 22 8 20 8 20Z" fill="#D2691E"/>
          <path d="M14 16L16 10L18 16Z" fill="#CD853F"/>
          <path d="M18 16L20 10L22 16Z" fill="#CD853F"/>
          <path d="M15 10L21 10" stroke="#8B4513" strokeWidth="1"/>
          <defs>
            <linearGradient id="canoeGradient" x1="4" y1="22" x2="32" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B4513"/>
              <stop offset="1" stopColor="#A0522D"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      fish: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <ellipse cx="18" cy="18" rx="12" ry="6" fill="url(#fishGradient)"/>
            <path d="M14 16 L10 14 L10 18 Z" fill="#FF6B35"/>
            <path d="M22 16 L26 14 L26 18 Z" fill="#FF6B35"/>
            <path d="M18 12 L20 10 L22 12 Z" fill="#FF6B35"/>
            <circle cx="14" cy="16" r="1.5" fill="#FFFFFF"/>
            <circle cx="14" cy="16" r="0.5" fill="#000000"/>
            <g transform="translate(30,18)">
              <animateTransform attributeName="transform" type="rotate" values="0;15;0;-15;0" keyTimes="0;0.25;0.5;0.75;1" dur="2s" repeatCount="indefinite" additive="sum"/>
              <polygon points="0,0 4,-2 4,2" fill="#FF6B35"/>
            </g>
          </g>
          <defs>
            <linearGradient id="fishGradient" x1="6" y1="18" x2="30" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF4500"/>
              <stop offset="0.4" stopColor="#FF6B35"/>
              <stop offset="0.5" stopColor="#FFFFFF"/>
              <stop offset="0.6" stopColor="#FF8C42"/>
              <stop offset="1" stopColor="#FF8C42"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      whale: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <path d="M32 20C32 24 28 28 24 28L16 28C12 28 8 24 8 20C8 16 12 12 16 12L24 12C28 12 32 16 32 20Z" fill="url(#whaleGradient)" />
            <path d="M10 18C10 18 12 16 14 16C16 16 18 18 18 18" fill="#4A90E2"/>
            <circle cx="26" cy="18" r="1" fill="#FFFFFF"/>
            <path d="M14 10L16 16L12 16Z" fill="#4A90E2"/>
            <path d="M32 20L34 18L34 22Z" fill="#87CEEB"/>
            <circle cx="18" cy="14" r="2" fill="#87CEEB"/>
            <circle cx="24" cy="14" r="1" fill="#87CEEB">
              <animate attributeName="cy" from="14" to="10" dur="1s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="25" cy="14" r="1" fill="#87CEEB">
              <animate attributeName="cy" from="14" to="10" dur="1s" begin="0.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.5s" repeatCount="indefinite"/>
            </circle>
          </g>
          <defs>
            <linearGradient id="whaleGradient" x1="8" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A90E2"/>
              <stop offset="1" stopColor="#87CEEB"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      shark: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M32 18C32 22 28 26 24 26L12 26C8 26 4 22 4 18C4 14 8 10 12 10L24 10C28 10 32 14 32 18Z" fill="url(#sharkGradient)" />
          <path d="M18 10L20 6L22 10" fill="#708090"/>
          <path d="M24 18L28 16L28 20Z" fill="#708090"/>
          <circle cx="14" cy="20" r="0.5" fill="#FFFFFF"/>
          <path d="M12 18L8 16L8 20Z" fill="#708090"/>
          <defs>
            <linearGradient id="sharkGradient" x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#708090"/>
              <stop offset="1" stopColor="#B0C4DE"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      mermaid: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,1;0,0;0,-1;0,0" dur="3s" repeatCount="indefinite"/>
            <path d="M22 22C22 24 20 26 18 26C16 26 14 24 14 22C14 20 16 18 18 18C20 18 22 20 22 22Z" fill="#20B2AA"/>
            <path d="M24 26C24 28 22 30 20 30L16 30C14 30 12 28 12 26C12 24 14 22 18 22C22 22 24 24 24 26Z" fill="url(#mermaidGradient)" />
            <path d="M18 24L14 28L18 26L22 28Z" fill="#20B2AA"/>
            <path d="M16 20L18 16L20 20" fill="#FFB6C1"/>
            <circle cx="17" cy="18" r="0.5" fill="#FFFFFF"/>
            <circle cx="19" cy="18" r="0.5" fill="#FFFFFF"/>
            <path d="M16 14C16 14 18 12 20 14" stroke="#FFB6C1" strokeWidth="1"/>
          </g>
          <defs>
            <linearGradient id="mermaidGradient" x1="12" y1="26" x2="24" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#48D1CC"/>
              <stop offset="1" stopColor="#20B2AA"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      turtle: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <ellipse cx="18" cy="20" rx="12" ry="8" fill="url(#turtleGradient)"/>
            <path d="M10 20L8 22L10 24" fill="#228B22"/>
            <path d="M26 20L28 22L26 24" fill="#228B22"/>
            <circle cx="18" cy="14" r="3" fill="#228B22"/>
            <circle cx="17" cy="13" r="0.5" fill="#FFFFFF"/>
            <circle cx="19" cy="13" r="0.5" fill="#FFFFFF"/>
            <path d="M14 18L16 16L18 18L20 16L22 18" stroke="#006400" strokeWidth="1"/>
            <path d="M12 20L14 22L16 20" stroke="#006400" strokeWidth="1"/>
            <path d="M20 20L22 22L24 20" stroke="#006400" strokeWidth="1"/>
          </g>
          <defs>
            <linearGradient id="turtleGradient" x1="6" y1="20" x2="30" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#228B22"/>
              <stop offset="1" stopColor="#32CD32"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      buoy: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0;0,2;0,0" dur="3s" repeatCount="indefinite"/>
            <ellipse cx="18" cy="22" rx="4" ry="6" fill="url(#buoyGradient)"/>
            <ellipse cx="18" cy="18" rx="4" ry="2" fill="#FFFFFF"/>
            <ellipse cx="18" cy="26" rx="4" ry="2" fill="#FFFFFF"/>
            <path d="M16 14L18 10L20 14" stroke="#FF0000" strokeWidth="1"/>
            <circle cx="18" cy="28" r="2" fill="#4169E1"/>
            <path d="M18 30L18 34" stroke="#4169E1" strokeWidth="1"/>
          </g>
          <defs>
            <linearGradient id="buoyGradient" x1="14" y1="22" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF0000"/>
              <stop offset="1" stopColor="#FF4500"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      jellyfish: (
        <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
          <g>
            <ellipse cx="18" cy="16" rx="8" ry="6" fill="url(#jellyfishGradient)" opacity="0.8">
              <animate attributeName="ry" values="6;7;6;5;6" dur="2s" repeatCount="indefinite"/>
            </ellipse>
            <path d="M12 22C12 22 14 26 14 30" stroke="#FF69B4" strokeWidth="1.5" opacity="0.8"/>
            <path d="M16 22C16 22 16 28 18 32" stroke="#FF69B4" strokeWidth="1.5" opacity="0.8"/>
            <path d="M20 22C20 22 20 28 18 32" stroke="#FF69B4" strokeWidth="1.5" opacity="0.8"/>
            <path d="M24 22C24 22 22 26 22 30" stroke="#FF69B4" strokeWidth="1.5" opacity="0.8"/>
            <circle cx="16" cy="14" r="1" fill="#FFFFFF" opacity="0.6"/>
            <circle cx="20" cy="14" r="1" fill="#FFFFFF" opacity="0.6"/>
          </g>
          <defs>
            <linearGradient id="jellyfishGradient" x1="10" y1="16" x2="26" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF69B4"/>
              <stop offset="1" stopColor="#FFB6C1"/>
            </linearGradient>
          </defs>
        </svg>
      )
    };
    
    return boatSVGs[type] || boatSVGs.sailboat;
  };

  if (!enabled) {
    return (
      <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Time Today</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{hours} hrs</div>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 dark:border-gray-700">
              <div className="text-2xl font-bold text-white">{Math.round(parseFloat(hours))}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div 
      ref={containerRef}
      className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in relative backdrop-blur-sm h-44"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" />
      
      <div 
        className="absolute inset-y-0 left-0 overflow-hidden transition-all duration-1000 ease-out"
        style={{ 
          width: `${progressPercentage}%`,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-80"
          style={{ 
            background: `linear-gradient(135deg, ${mutedColor} 0%, ${color} 100%)`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,40 C20,20 40,60 60,30 C80,60 100,20 100,40 L100,100 L0,100 Z" fill="${encodeURIComponent(mutedColor)}"/></svg>')`,
            backgroundSize: '200% 100%',
            animation: 'waveMove 15s ease-in-out infinite alternate'
          }} 
        />
        
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,60 C15,40 35,70 50,50 C65,70 85,40 100,60 L100,100 L0,100 Z" fill="${encodeURIComponent(mutedColor)}"/></svg>')`,
            backgroundSize: '150% 100%',
            animation: 'waveMove 20s ease-in-out infinite alternate'
          }} 
        />
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,50 C10,30 30,70 50,50 C70,70 90,30 100,50 L100,100 L0,100 Z" fill="${encodeURIComponent(mutedColor)}"/></svg>')`,
            backgroundSize: '250% 100%',
            animation: 'waveMove 18s ease-in-out infinite alternate-reverse'
          }} 
        />
        
        <div ref={windRef} className="absolute inset-0" />
        
        <div 
          className="absolute top-0 left-0 w-full h-20 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)`,
            opacity: 0.15,
            mixBlendMode: 'overlay'
          }}
        />
        
        {boats.map(boat => (
          <div 
            key={boat.id}
            className="absolute pointer-events-none"
            style={{
              top: `${boat.top}%`,
              left: '0%',
              animation: `${boat.type === 'fish' || boat.type === 'jellyfish' ? 'fishSwim' : 'boatFloat'} ${boat.speed}s linear forwards, ${boat.type === 'buoy' ? 'buoyBob' : boat.type === 'jellyfish' ? 'jellyfishFloat' : 'boatBob'} 3s ease-in-out infinite`,
              zIndex: 15,
              width: '35px',
              height: '35px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {renderBoat(boat.type)}
          </div>
        ))}
      </div>
      
      <div 
        className="absolute top-0 bottom-0 transition-all duration-1000 ease-out"
        style={{ 
          left: `${progressPercentage}%`,
          width: '2px',
          marginLeft: '-1px',
          zIndex: 10,
          background: `linear-gradient(to bottom, transparent, ${color} 20%, ${color} 80%, transparent)`,
          boxShadow: `0 0 12px ${mutedColor}`
        }}
      />
      
      <div 
        className="absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-out"
        style={{ 
          width: `${progressPercentage}%`,
          background: `linear-gradient(90deg, transparent, ${color})`,
          zIndex: 5
        }}
      />
      
      <div className="absolute top-4 left-4 z-20">
        <button 
          className="bg-gray-900/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800/50 shadow-md hover:bg-gray-800/90 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={parseFloat(hours) < 5}
          onClick={() => {
            if (parseFloat(hours) >= 5 && boats.length < 10) {
              const boatTypes = ['sailboat', 'motorboat', 'canoe', 'fish', 'whale', 'shark', 'mermaid', 'turtle', 'buoy', 'jellyfish'];
              const randomType = boatTypes[Math.floor(Math.random() * boatTypes.length)];
              setBoats(prev => [...prev, { 
                id: Date.now(), 
                top: Math.random() * 20 + 40,
                speed: 20 + (Math.random() * 8 - 4),
                type: randomType
              }]);
            }
          }}
        >
          <div className="text-3xl font-bold text-white tracking-tight">{hours} hrs</div>
        </button>
      </div>
      
      {waves.map((id) => (
        <div 
          key={id}
          className="absolute bottom-0 left-0 w-full h-12 pointer-events-none"
          style={{
            animation: `waveRipple 3s ease-out`,
            background: `radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)`,
            zIndex: 15
          }}
        />
      ))}
      
      <style>{`
        @keyframes waveMove {
          0% { background-position-x: 200%; }
          100% { background-position-x: 0%; }
        }
        
        @keyframes windFloat {
          0%, 100% { 
            transform: translate(0, 0);
            opacity: 0.05;
          }
          50% { 
            transform: translate(${Math.random() > 0.5 ? '-' : ''}${Math.random() * 20 + 5}px, -${Math.random() * 15 + 5}px);
            opacity: 0.3;
          }
        }
        
        @keyframes waveRipple {
          0% {
            opacity: 0.4;
            transform: translateY(0) scale(1, 0.4);
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(1.5, 1);
          }
        }
        
        @keyframes boatFloat {
          0% { 
            left: -5%;
            opacity: 0;
          }
          5% { 
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }
        
        @keyframes fishSwim {
          0% { 
            left: -5%;
            opacity: 0;
            transform: translateY(0) rotate(0deg);
          }
          5% { 
            opacity: 1;
          }
          25% { 
            transform: translateY(-5px) rotate(-3deg);
          }
          50% { 
            transform: translateY(0) rotate(0deg);
          }
          75% { 
            transform: translateY(5px) rotate(3deg);
          }
          95% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes buoyBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(-2deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-3px) rotate(2deg); }
        }
        
        @keyframes boatBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(-2deg); }
          50% { transform: translateY(0px) rotate(0deg); }
          75% { transform: translateY(-3px) rotate(2deg); }
        }
        
        @keyframes jellyfishFloat {
          0%, 100% { 
            transform: translateY(0) scale(1);
          }
          50% { 
            transform: translateY(-4px) scale(1.05);
          }
        }
        
        @keyframes whaleFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg);
          }
          50% { 
            transform: translateY(-5px) rotate(-1deg);
          }
        }
        
        @keyframes turtleFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg);
          }
          25% { 
            transform: translateY(-2px) rotate(-1deg);
          }
          50% { 
            transform: translateY(0) rotate(0deg);
          }
          75% { 
            transform: translateY(-3px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;