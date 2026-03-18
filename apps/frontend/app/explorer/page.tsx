'use client';

import { Compass, Users, Trophy, MapPin } from 'lucide-react';

export default function ExplorerPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-8 font-montserrat">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center gap-3">
          <Compass className="w-10 h-10 text-cyan-500" />
          Explorer
        </h1>
        <p className="text-neutral-400 mt-2 text-sm tracking-wide">Découvrez de nouveaux lieux, défis et athlètes</p>
      </header>

      {/* Tabs / Filters (Fake) */}
      <div className="flex gap-4 mb-8">
        {['Tendances', 'Communauté', 'Défis locaux', 'Événements'].map((tab, i) => (
          <button key={i} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-neutral-500 border border-white/5 hover:bg-white/5'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="group rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden cursor-pointer hover:border-white/20 transition-all">
          <div className="h-48 bg-neutral-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-bold text-white uppercase">Challenge</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">100km de Septembre</h3>
            <p className="text-sm text-neutral-400 mb-4 line-clamp-2">Courez 100 kilomètres ce mois-ci pour débloquer le badge spécial et tenter de gagner de l'équipement.</p>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
               <Users className="w-4 h-4" />
               <span>12,450 participants</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden cursor-pointer hover:border-white/20 transition-all">
          <div className="h-48 bg-neutral-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
              <MapPin className="w-3 h-3 text-cyan-500" />
              <span className="text-xs font-bold text-white uppercase">Spot Populaire</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Refuge du Lac Blanc</h3>
            <p className="text-sm text-neutral-400 mb-4 line-clamp-2">L'un des trails les plus populaires de la région. Vue imprenable sur le massif du Mont-Blanc.</p>
            <div className="flex justify-between items-center text-xs">
               <span className="text-neutral-500">14.2 km • +1200m</span>
               <span className="text-emerald-500 font-bold">Très fréquenté</span>
            </div>
          </div>
        </div>

        {/* Card 3 (Community post) */}
        <div className="group rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden p-6 cursor-pointer hover:border-white/20 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500" />
              <div>
                <p className="text-sm font-bold">Sarah Jenkins</p>
                <p className="text-xs text-neutral-500">Aujourd'hui à 07:14</p>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Morning Run 🌅</h3>
            <p className="text-sm text-neutral-400 mb-4">Bonnes sensations ce matin malgré le froid. La préparation pour le marathon avance bien !</p>
          </div>
          
          <div className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-white/5">
             <div>
               <p className="text-xs text-neutral-500 uppercase font-bold">Distance</p>
               <p className="text-lg font-semibold">12.0 <span className="text-xs font-normal">km</span></p>
             </div>
             <div>
               <p className="text-xs text-neutral-500 uppercase font-bold">Allure</p>
               <p className="text-lg font-semibold">5:15 <span className="text-xs font-normal">/km</span></p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}