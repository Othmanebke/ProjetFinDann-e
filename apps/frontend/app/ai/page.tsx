'use client';

import { BrainCircuit, MessageSquare, Target, Sparkles } from 'lucide-react';

export default function AiCoachPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-8 font-montserrat flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-orange-500 flex items-center gap-3">
          <BrainCircuit className="w-10 h-10 text-orange-500" />
          Coach IA
        </h1>
        <p className="text-neutral-400 mt-2 text-sm tracking-wide">Votre assistant personnel d'entraînement cognitif</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl">
            <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Analyse du Jour
            </h3>
            <p className="text-3xl font-bold mb-2">92<span className="text-lg text-neutral-500">/100</span></p>
            <p className="text-sm font-medium text-emerald-400 mb-4">Excellente récupération</p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Vos données de sommeil et votre VFC indiquent que vous êtes prêt pour un effort intense aujourd'hui. Je vous recommande la séance de fractionné prévue initiale, mais avec 2 répétitions supplémentaires.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="/routes" className="text-xs font-bold text-orange-500 hover:underline">Parcours</a>
              <a href="/nutrition" className="text-xs font-bold text-emerald-500 hover:underline">Nutrition</a>
              <a href="/metrics" className="text-xs font-bold text-indigo-500 hover:underline">Performance</a>
              <a href="/explorer" className="text-xs font-bold text-cyan-500 hover:underline">Explorer</a>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
             <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Objectifs Dynamiques</h3>
             <ul className="space-y-4">
               {['Maintenir cadence > 170 ppm', 'Hydratation +500ml avant run', 'Étirements chaîne post.'].map((obj, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm">
                   <Target className="w-4 h-4 text-orange-500 mt-0.5" />
                   <span className="text-neutral-300">{obj}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl flex flex-col overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex-1 p-6 overflow-y-auto space-y-6 z-10">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center flex-shrink-0">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm text-sm text-neutral-200 leading-relaxed">
                Bonjour ! Vu vos courbatures aux mollets signalées hier, voulez-vous que j'adapte le dénivelé de la sortie de ce soir ?
              </div>
            </div>

            <div className="flex gap-4 max-w-[80%] ml-auto justify-end">
              <div className="bg-orange-600/20 border border-orange-500/20 p-4 rounded-2xl rounded-tr-sm text-sm text-neutral-200 leading-relaxed">
                Oui, je préfère rester sur du plat aujourd'hui.
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-neutral-400">ME</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center flex-shrink-0">
                 <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm text-sm text-neutral-200 leading-relaxed">
                C'est noté. J'ai mis à jour votre itinéraire pour la 'Boucle du Canal' (8.5km, +20m D). Concentrez-vous sur le relâchement. Bon run ! 🏃‍♂️🔥
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/5 bg-[#030303]/50 z-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Demandez un conseil, une adaptation, une recette..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                disabled
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <MessageSquare className="w-4 h-4 text-neutral-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
