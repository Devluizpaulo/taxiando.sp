import { Car } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50", className)}>
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <Image 
          src="/logo.png" 
          alt="Táxiando SP Logo" 
          width={180} 
          height={170} 
          className="h-24 w-auto rounded-xl shadow-lg" 
        />
        
        {/* Carro em movimento */}
        <div className="relative">
          {/* Estrada */}
          <div className="w-32 h-1 bg-gray-400 rounded-full mb-2"></div>
          
          {/* Carro animado */}
          <div className="relative animate-bounce">
            <Car className="h-16 w-16 text-blue-600 drop-shadow-lg" />
            
            {/* Roda dianteira */}
            <div className="absolute -bottom-1 -right-1">
              <div className="h-6 w-6 rounded-full border-3 border-gray-400 bg-white shadow-md animate-spin">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-4 bg-gray-500 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-90">
                  <div className="h-0.5 w-4 bg-gray-500 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-gray-600"></div>
                </div>
              </div>
            </div>
            
            {/* Roda traseira */}
            <div className="absolute -bottom-1 -left-1">
              <div className="h-6 w-6 rounded-full border-3 border-gray-400 bg-white shadow-md animate-spin">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-4 bg-gray-500 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-90">
                  <div className="h-0.5 w-4 bg-gray-500 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-gray-600"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Linhas da estrada */}
          <div className="flex justify-center gap-4 mt-2">
            <div className="w-2 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
        
        {/* Texto de carregamento */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Carregando Dashboard
          </h2>
          <p className="text-gray-600">
            Preparando suas métricas...
          </p>
        </div>
        
        {/* Indicadores de progresso */}
        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
