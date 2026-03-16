'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

const STAGES = [
  { 
    threshold: 0,  
    label: "Forêt Oubliée", 
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1600" 
  },
  { 
    threshold: 20, 
    label: "Désert Brûlant", 
    bg: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=1600" 
  },
  { 
    threshold: 40, 
    label: "Haute Montagne", 
    bg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600" 
  },
  { 
    threshold: 60, 
    label: "Lacs Paisibles", 
    bg: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1600" 
  },
  { 
    threshold: 80, 
    label: "Côte Sauvage", 
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600" 
  }
];

export default function LoadingScreenDemo() {
  const [progress, setProgress] = useState(0);

  // Simulation du chargement progressif
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0; // Reboucle pour la démo
        return prev + 0.3; // Vitesse de chargement
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Déterminer l'étape actuelle
  const currentStageIndex = STAGES.findLastIndex((stage) => progress >= stage.threshold);
  const currentStage = STAGES[currentStageIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-montserrat">
      
      {/* Configuration d'une petite animation CSS en ligne pour le coureur */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sprint {
          0%, 100% { transform: translateY(0px) rotate(5deg) scale(1.1); }
          50% { transform: translateY(-6px) rotate(-5deg) scale(1.1); }
        }
        .runner-anim {
          animation: sprint 0.4s ease-in-out infinite;
        }
      `}} />

      {/* ── ARRIÈRE-PLANS (CROSSFADE) ── */}
      {STAGES.map((stage, idx) => (
        <div 
          key={stage.label}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ 
            opacity: currentStageIndex === idx ? 1 : 0,
            zIndex: currentStageIndex === idx ? 10 : 0
          }}
        >
          <img 
            src={stage.bg} 
            alt={stage.label} 
            className="w-full h-full object-cover"
          />
          {/* Overlay sombre pour bien voir la barre */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      ))}

      {/* ── CONTENU DU CHARGEMENT ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-32 px-6">
        
        {/* En-tête : Logo et info */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="text-white text-3xl font-black tracking-tighter mb-4">élan</div>
          <div className="flex items-center gap-2 text-[#EA580C] bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
            <MapPin size={16} />
            <span className="font-bold text-sm tracking-wide">
              {currentStage?.label}
            </span>
          </div>
        </div>

        {/* Barre de progression container */}
        <div className="w-full max-w-2xl relative">
          
          {/* Le petit bonhomme qui court ! */}
          <div 
            className="absolute bottom-4 -translate-x-1/2 transition-all duration-75 ease-linear pointer-events-none runner-anim"
            style={{ left: \`\${progress}%\` }}
          >
            {/* Custom SVG d'un coureur */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }}>
              {/* Tête */}
              <circle cx="12" cy="4" r="2" fill="white" />
              {/* Corps */}
              <path d="M12 6 L 11 12" />
              {/* Jambe Arrière */}
              <path d="M11 12 L 8 16 L 5 15" stroke="#EA580C" />
              {/* Jambe Avant */}
              <path d="M11 12 L 15 15 L 16 20" />
              {/* Bras Arrière */}
              <path d="M12 7 L 8 9 L 6 7" stroke="#EA580C" />
              {/* Bras Avant */}
              <path d="M12 7 L 16 8 L 18 5" />
            </svg>

            {/* Petite trainée de poussière derrière lui */}
            <div className="absolute bottom-0 right-4 w-6 h-1 bg-white/30 blur-[2px] rounded-full animate-pulse" />
          </div>

          {/* La piste / fond de la barre */}
          <div className="h-3 w-full bg-white/20 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-white/10">
            {/* L'avancement (Orange) */}
            <div 
              className="h-full bg-gradient-to-r from-[#EA580C] to-[#F59E0B] transition-all duration-75 ease-linear rounded-full relative"
              style={{ width: \`\${progress}%\` }}
            >
              {/* Effet brillant sur la barre */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          {/* Textes de pourcentage */}
          <div className="mt-4 flex justify-between items-center text-xs font-bold text-white/70">
            <span>Départ</span>
            <span className="text-white text-lg tabular-nums shadow-sm">{Math.round(progress)}%</span>
            <span>Arrivée</span>
          </div>

        </div>

      </div>

    </div>
  );
}
