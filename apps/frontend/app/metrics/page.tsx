'use client';

import { Activity, Heart, Zap, Crosshair } from 'lucide-react';

export default function MetricsPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-8 font-montserrat">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600">
          Performance
        </h1>
        <p className="text-neutral-400 mt-2 text-sm tracking-wide">Analyses biométriques et progression</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'VO2 Max', value: '52', unit: 'ml/kg/min', trend: '+1.2', icon: Activity, color: 'text-indigo-400', link: '/routes' },
          { label: 'Allure Moy', value: '4:45', unit: '/km', trend: '-0:15', icon: Zap, color: 'text-yellow-400', link: '/nutrition' },
          { label: 'FC Repos', value: '48', unit: 'bpm', trend: '-2', icon: Heart, color: 'text-rose-400', link: '/ai' },
          { label: 'Charge Entr.', value: '1840', unit: 'pts', trend: '+150', icon: Crosshair, color: 'text-blue-400', link: '/explorer' },
        ].map((stat, idx) => (
          <a key={idx} href={stat.link}>
            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between h-40 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</h3>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold flex items-baseline gap-2">
                  {stat.value} <span className="text-sm text-neutral-500">{stat.unit}</span>
                </p>
                <p className="text-xs text-emerald-500 mt-2 font-semibold bg-emerald-500/10 w-fit px-2 py-1 rounded">{stat.trend} ce mois</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl h-80 flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Évolution Allure vs FC</h3>
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-between p-4 px-8 opacity-30">
               {[20, 40, 30, 60, 50, 80, 70, 90, 85].map((h, i) => (
                 <div key={i} className="w-4 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }} />
               ))}
            </div>
            <p className="text-neutral-600 text-sm font-medium z-10">[Composant Graphique]</p>
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl h-80 flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Temps par zone cardiaque</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {[
              { zone: 'Z5 (Maximal)', time: '12 min', pct: 5, color: 'bg-rose-500' },
              { zone: 'Z4 (Seuil)', time: '45 min', pct: 25, color: 'bg-orange-500' },
              { zone: 'Z3 (Aérobie)', time: '1h 20', pct: 40, color: 'bg-yellow-500' },
              { zone: 'Z2 (Endurance)', time: '2h 15', pct: 30, color: 'bg-emerald-500' },
            ].map((z, idx) => (
               <div key={idx} className="flex items-center gap-4">
                 <span className="w-24 text-xs font-semibold text-neutral-400">{z.zone}</span>
                 <div className="flex-1 bg-neutral-900 h-2 rounded-full overflow-hidden">
                   <div className={`${z.color} h-full rounded-full`} style={{ width: `${z.pct}%` }} />
                 </div>
                 <span className="w-16 text-right text-sm font-medium">{z.time}</span>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
