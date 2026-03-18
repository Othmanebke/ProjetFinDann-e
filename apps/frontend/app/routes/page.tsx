'use client';

import { Map, Navigation, Mountain, Clock, TrendingUp } from 'lucide-react';

export default function RoutesPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-8 font-montserrat">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-600">
          Parcours
        </h1>
        <p className="text-neutral-400 mt-2 text-sm tracking-wide">Planification et historique de vos itinéraires</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] flex items-center justify-center group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center mb-4">
              <Navigation className="text-orange-500 w-8 h-8" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-orange-400">CARTE INTERACTIVE</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Dernier Parcours</h3>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">12.4 <span className="text-sm text-neutral-500 font-normal">km</span></p>
                <p className="text-orange-500 text-sm font-medium">Les crêtes sauvages</p>
              </div>
              <Mountain className="text-neutral-600 w-8 h-8" />
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1.5 mb-2">
              <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-1.5 rounded-full w-[75%]" />
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Dénivelé: +450m</span>
              <span>Allure: 5:30/km</span>
            </div>
          </div>

          <div className="flex-1 p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Suggestions</h3>
            <div className="space-y-4">
              <a href="/nutrition">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <Map className="text-neutral-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Boucle Forestière 1</p>
                    <p className="text-xs text-neutral-500">8.5 km • Valloné</p>
                  </div>
                </div>
              </a>
              <a href="/metrics">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <Map className="text-neutral-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Boucle Forestière 2</p>
                    <p className="text-xs text-neutral-500">8.5 km • Valloné</p>
                  </div>
                </div>
              </a>
              <a href="/ai">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <Map className="text-neutral-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Boucle Forestière 3</p>
                    <p className="text-xs text-neutral-500">8.5 km • Valloné</p>
                  </div>
                </div>
              </a>
              <a href="/explorer">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <Map className="text-neutral-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Explorer</p>
                    <p className="text-xs text-neutral-500">Découvrir</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
