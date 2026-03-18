'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Vérification sécurité...");

  useEffect(() => {
    // 2.5 secondes max (2500ms) pour que ce soit beaucoup plus rapide
    const duration = 2500;
    const intervalTime = 25; 
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Textes d'état fluides (ajustés à la vitesse du nouveau loader)
  useEffect(() => {
    if (progress >= 100) setPhase("Accès autorisé.");
    else if (progress > 80) setPhase("Rendu de l'interface...");
    else if (progress > 50) setPhase("Synchronisation...");
    else if (progress > 20) setPhase("Chargement modulaire...");
  }, [progress]);

  const isDone = progress >= 100;

  return (
    <div className="relative flex items-center justify-center w-screen h-screen bg-[#030303] text-white overflow-hidden">
      
      {/* Lueur de fond dynamique (teinte orange sportive) */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full blur-[120px] transition-all duration-1000 ease-out ${
          isDone ? 'bg-orange-600/20 scale-150' : 'bg-orange-900/10 scale-100 animate-pulse'
        }`} 
      />
      
      <div className={`relative z-10 flex flex-col items-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isDone ? 'scale-110' : 'scale-100'}`}>
        
        {/* Anneau de progression ultra-fin */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-12">
          
          <svg 
            className={`absolute inset-0 w-full h-full -rotate-90 transition-all duration-500 ${isDone ? 'opacity-0 scale-110 blur-xl' : 'opacity-100 scale-100'}`} 
            viewBox="0 0 100 100"
          >
            {/* Voie vide */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="#131313" strokeWidth="0.5" />
            
            {/* Ligne lumineuse orange/ambre qui se remplit super vite */}
            <circle 
              cx="50" cy="50" r="48" fill="none" 
              stroke="url(#gradient)" strokeWidth="1.5" 
              strokeDasharray="301.59" 
              strokeDashoffset={301.59 - (301.59 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-75 ease-linear"
              style={{ filter: "drop-shadow(0px 0px 6px rgba(234,88,12,0.8))" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EA580C" /> 
                <stop offset="100%" stopColor="#F59E0B" /> 
              </linearGradient>
            </defs>
          </svg>
          
          {/* Logo Central + Icône du Runner */}
          <div className="absolute flex flex-col items-center justify-center">
            
            {/* Icône du runner minimaliste stylisée intégrée au milieu */}
            <div className={`relative mb-3 flex items-center justify-center transition-all duration-500 transform ${isDone ? 'opacity-0 -translate-y-8 scale-50' : 'opacity-100 translate-y-0'}`}>
               {/* Effet "vent" / lignes de vitesse à l'arrière */}
               <div className="absolute -left-8 w-10 h-[1px] bg-gradient-to-l from-orange-500 to-transparent opacity-60 animate-[ping_0.8s_linear_infinite]" />
               <div className="absolute -left-5 top-2 w-6 h-[1px] bg-gradient-to-l from-orange-400 to-transparent opacity-40 animate-[ping_0.5s_linear_infinite_0.1s]" />
               <div className="absolute -left-5 bottom-2 w-6 h-[1px] bg-gradient-to-l from-orange-400 to-transparent opacity-40 animate-[ping_0.6s_linear_infinite_0.3s]" />
               
               <svg 
                 width="48" height="48" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
                 className="text-orange-500 drop-shadow-[0_0_8px_rgba(234,88,12,0.9)] animate-[bounce_0.6s_infinite]"
               >
                <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M12 6.5l-1 5.5-3-2.5" />
                <path d="m11 12 3 4-2.5 4" />
                <path d="m14 16 4 2" />
                <path d="M8 18l-3-4.5" />
              </svg>
            </div>

            <h1 className={`text-5xl font-black tracking-tighter transition-all duration-1000 ${isDone ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]' : 'text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-700'}`}>
              élan
            </h1>
            
            {/* Pourcentage au centre bas */}
            <div className={`absolute top-full mt-2 transition-all duration-300 ${isDone ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <span className="text-xl font-light tabular-nums text-orange-500/80">
                {Math.round(progress)}
                <span className="text-xs opacity-50 ml-1">%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pilule UI (textes de phase) */}
        <div className={`relative flex items-center justify-center h-10 px-6 rounded-full border border-orange-500/20 bg-orange-500/[0.02] backdrop-blur-xl transition-all duration-500 delay-100 ${isDone ? 'opacity-0 translate-y-12 blur-sm' : 'opacity-100 translate-y-0'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[ping_1s_linear_infinite] mr-3" />
          <span className="text-xs font-semibold text-orange-200/80 uppercase tracking-widest min-w-[200px] text-center">
            {phase}
          </span>
        </div>

        {/* Message final d'accès - Remonte à la fin */}
        <div className={`absolute text-base font-bold tracking-[0.4em] text-white drop-shadow-[0_0_10px_rgba(234,88,12,0.8)] transition-all duration-700 delay-300 ${isDone ? 'opacity-100 translate-y-14 scale-110' : 'opacity-0 translate-y-24 scale-90 pointer-events-none'}`}>
          ACCÈS AUTORISÉ
        </div>
      </div>

      {/* Cadre UI (Coins high-tech) */}
      <div className="absolute top-8 left-8 w-8 h-[1px] bg-neutral-800" />
      <div className="absolute top-8 left-8 w-[1px] h-8 bg-neutral-800" />
      
      <div className="absolute top-8 right-8 w-8 h-[1px] bg-neutral-800" />
      <div className="absolute top-8 right-8 w-[1px] h-8 bg-neutral-800" />

      <div className="absolute bottom-8 left-8 w-8 h-[1px] bg-neutral-800" />
      <div className="absolute bottom-8 left-8 w-[1px] h-8 bg-neutral-800" />

      <div className="absolute bottom-8 right-8 w-8 h-[1px] bg-neutral-800" />
      <div className="absolute bottom-8 right-8 w-[1px] h-8 bg-neutral-800" />

    </div>
  );
}