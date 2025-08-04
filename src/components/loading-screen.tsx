import { Car } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden", className)}>
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping opacity-30" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-25" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Logo com efeito de brilho */}
        <div className="relative">
          <Image 
            src="/logo.png" 
            alt="Táxiando SP Logo" 
            width={180} 
            height={170} 
            className="h-24 w-auto rounded-xl shadow-lg animate-pulse" 
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        </div>
        
        {/* Carro em movimento com animação mais elaborada */}
        <div className="relative">
          {/* Estrada animada com efeito de movimento */}
          <div className="w-48 h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full mb-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Carro principal com efeitos */}
          <div className="relative z-10 animate-bounce">
            <div className="relative">
              <Car className="h-16 w-16 text-blue-600 drop-shadow-lg filter blur-[0.5px]" />
              
              {/* Efeito de brilho no carro */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
              
              {/* Rodas girando com efeito de movimento */}
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600 animate-spin shadow-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600 animate-spin shadow-lg"></div>
              
              {/* Efeito de movimento */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          {/* Partículas de movimento mais elaboradas */}
          <div className="absolute -bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping shadow-lg"></div>
          <div className="absolute -bottom-4 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping shadow-lg" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-4 left-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping shadow-lg" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-4 left-16 w-1 h-1 bg-yellow-400 rounded-full animate-ping shadow-lg" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        {/* Texto de carregamento com efeitos */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800 animate-pulse bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Carregando Dashboard
          </h2>
          <p className="text-gray-600 text-sm animate-pulse">
            Preparando suas métricas...
          </p>
        </div>
        
        {/* Indicador de progresso animado com efeitos */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce shadow-lg"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Barra de progresso com animação mais sofisticada */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        
        {/* Efeito de ondas */}
        <div className="flex items-center gap-1">
          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-6 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-8 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-6 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
