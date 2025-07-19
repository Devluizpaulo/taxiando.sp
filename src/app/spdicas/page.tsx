import { Star } from 'lucide-react';
import Image from 'next/image';

const dicas = [
  {
    id: 1,
    title: 'Restaurante Bom Prato',
    description: 'Comida caseira, preço justo e ambiente limpo. Ótimo para motoristas e passageiros.',
    image: '/dicas/restaurante.jpg',
    rating: 4.7,
    type: 'motorista',
  },
  {
    id: 2,
    title: 'Café 24h Paulista',
    description: 'Aberto a noite toda, café forte e wi-fi grátis. Ponto de parada tradicional.',
    image: '/dicas/cafe.jpg',
    rating: 4.5,
    type: 'motorista',
  },
  {
    id: 3,
    title: 'Parque Ibirapuera',
    description: 'Ótimo para passeios, corridas e lazer dos passageiros. Muito procurado nos fins de semana.',
    image: '/dicas/ibirapuera.jpg',
    rating: 4.9,
    type: 'cliente',
  },
  {
    id: 4,
    title: 'Museu do Futebol',
    description: 'Atração turística para clientes e ótima região para corridas rápidas.',
    image: '/dicas/museu.jpg',
    rating: 4.8,
    type: 'cliente',
  },
];

export default function SpDicasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 py-12 px-2 md:px-0">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-md">Dicas de SP para Motoristas e Clientes</h1>
        <p className="text-center text-slate-500 mb-10 max-w-2xl mx-auto">Confira lugares, paradas, restaurantes, pontos turísticos e dicas úteis para motoristas e passageiros. Avalie, compartilhe e descubra novos destinos!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {dicas.map((dica) => (
            <div key={dica.id} className="relative group rounded-2xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-xl border-2 border-transparent hover:border-amber-400 transition-all duration-300 flex flex-col animate-fadeInUp">
              <div className="relative w-full h-40">
                <Image src={dica.image} alt={dica.title} fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dica.type === 'motorista' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{dica.type === 'motorista' ? 'Para Motorista' : 'Para Cliente'}</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star className="h-4 w-4 fill-amber-400" /> {dica.rating}
                  </span>
                </div>
                <h2 className="font-bold text-lg mb-1 text-slate-800 line-clamp-2">{dica.title}</h2>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">{dica.description}</p>
                <button className="mt-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow group-hover:scale-105">Ver Mais</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 