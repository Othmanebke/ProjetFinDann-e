'use client';

import { Flame, Droplets, Apple, Coffee } from 'lucide-react';

export default function NutritionPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-8 font-montserrat">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-800">
            Nutrition
          </h1>
          <p className="text-neutral-400 mt-2 text-sm tracking-wide">Carburant et récupération</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">2,450 <span className="text-lg text-neutral-500">kcal</span></p>
          <p className="text-xs text-emerald-500 font-semibold tracking-widest uppercase mt-1">Objectif du jour</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Protéines', value: '140g', max: '160g', color: 'from-blue-500 to-blue-700', icon: Apple },
          { label: 'Glucides', value: '280g', max: '350g', color: 'from-emerald-400 to-emerald-600', icon: Flame },
          { label: 'Lipides', value: '65g', max: '80g', color: 'from-orange-400 to-orange-600', icon: Coffee },
          { label: 'Hydratation', value: '2.1L', max: '3L', color: 'from-cyan-400 to-cyan-600', icon: Droplets },
        ].map((macro, idx) => (
          <div key={idx} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
            <macro.icon className="absolute top-6 right-6 w-6 h-6 text-white/10" />
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">{macro.label}</h3>
            <p className="text-2xl font-bold mb-2">{macro.value} <span className="text-sm font-normal text-neutral-500">/ {macro.max}</span></p>
            <div className="w-full bg-neutral-900 rounded-full h-1">
              <div className={`bg-gradient-to-r ${macro.color} h-1 rounded-full w-[70%]`} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
          <Flame className="text-emerald-500 w-5 h-5" />
          Plan de la journée (Post-Entraînement)
        </h3>
        
        <div className="space-y-6">
          {[
            { time: '08:00', title: 'Pre-Workout Snack', desc: 'Banane, purée damandes, café noir', status: 'done' },
            { time: '10:30', title: 'Récupération', desc: 'Shaker de whey, avoine, myrtilles', status: 'current' },
            { time: '13:00', title: 'Déjeuner', desc: 'Poulet grillé, quinoa, brocolis vapeur', status: 'pending' },
            { time: '20:00', title: 'Dîner', desc: 'Saumon, patates douces, salade verte', status: 'pending' },
          ].map((meal, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${meal.status === 'done' ? 'bg-emerald-500' : meal.status === 'current' ? 'bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.8)]' : 'bg-neutral-800'}`} />
                {idx !== 3 && <div className="w-[1px] h-full bg-white/5 my-2" />}
              </div>
              <div className={`pb-6 ${meal.status === 'pending' ? 'opacity-50' : ''}`}>
                <p className="text-xs font-bold text-neutral-500 mb-1">{meal.time}</p>
                <h4 className="text-lg font-semibold">{meal.title}</h4>
                <p className="text-sm text-neutral-400 mt-1">{meal.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
