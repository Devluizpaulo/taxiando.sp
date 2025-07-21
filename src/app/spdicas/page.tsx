import { Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import { getTips } from '@/app/actions/supabase-city-guide-actions';
import { type CityTip } from '@/lib/types';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default async function SpDicasPage() {
  let tips: CityTip[] = [];
  
  try {
    tips = await getTips();
  } catch (error) {
    console.error("Error fetching tips:", error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-gradient-to-br from-slate-50 via-white to-zinc-50 py-12 px-2 md:px-0">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-md">
          Guia da Cidade - Dicas para Motoristas e Clientes
        </h1>
        <p className="text-center text-slate-500 mb-10 max-w-2xl mx-auto">
          Confira lugares, paradas, restaurantes, pontos turísticos e dicas úteis para motoristas e passageiros. 
          Avalie, compartilhe e descubra novos destinos em São Paulo!
        </p>
        
        {tips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {tips.map((tip) => (
              <div key={tip.id} className="relative group rounded-2xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-xl border-2 border-transparent hover:border-amber-400 transition-all duration-300 flex flex-col animate-fadeInUp">
                <div className="relative w-full h-40">
                  {tip.imageUrls && tip.imageUrls.length > 0 ? (
                    <Image 
                      src={tip.imageUrls[0]} 
                      alt={tip.title} 
                      fill 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      tip.target === 'driver' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tip.target === 'driver' ? 'Para Motorista' : 'Para Cliente'}
                    </span>
                    {tip.priceRange && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        {tip.priceRange}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-lg mb-1 text-slate-800 line-clamp-2">{tip.title}</h2>
                  <p className="text-slate-600 text-sm mb-2 line-clamp-2">{tip.description}</p>
                  <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {tip.location}
                  </p>
                  <div className="mt-auto">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {tip.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma dica disponível</h3>
            <p className="text-slate-500">Em breve teremos dicas incríveis sobre São Paulo!</p>
          </div>
        )}
      </div>
      </main>
      <PublicFooter />
    </div>
  );
} 