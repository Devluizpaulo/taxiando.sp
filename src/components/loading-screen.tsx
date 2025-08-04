import { Car } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Componente SVG da roda/radar em verde oliva
const OliveRadarWheel = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="animate-spin">
    {/* Círculo externo principal */}
    <circle cx="60" cy="60" r="50" fill="none" stroke="#6b7280" strokeWidth="8"/>
    
    {/* Círculo interno sólido */}
    <circle cx="60" cy="60" r="15" fill="#6b7280"/>
    
    {/* Sinal de mais branco no centro */}
    <line x1="60" y1="50" x2="60" y2="70" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <line x1="50" y1="60" x2="70" y2="60" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Linhas radiais internas (dentro do círculo) */}
    <line x1="60" y1="25" x2="60" y2="45" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    <line x1="75" y1="60" x2="95" y2="60" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    <line x1="60" y1="75" x2="60" y2="95" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    <line x1="25" y1="60" x2="45" y2="60" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    
    {/* Linhas radiais externas (cruzando o círculo) */}
    <line x1="60" y1="10" x2="60" y2="30" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    <line x1="90" y1="60" x2="110" y2="60" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    <line x1="60" y1="90" x2="60" y2="110" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    <line x1="10" y1="60" x2="30" y2="60" stroke="#6b7280" strokeWidth="6" strokeLinecap="round"/>
    
    {/* Linhas diagonais externas para dar mais dinamismo */}
    <line x1="85" y1="35" x2="105" y2="25" stroke="#6b7280" strokeWidth="4" strokeLinecap="round"/>
    <line x1="85" y1="85" x2="105" y2="95" stroke="#6b7280" strokeWidth="4" strokeLinecap="round"/>
    <line x1="35" y1="85" x2="25" y2="105" stroke="#6b7280" strokeWidth="4" strokeLinecap="round"/>
    <line x1="35" y1="35" x2="25" y2="15" stroke="#6b7280" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// Componente dos elementos HUD
const HUDDisplay = () => (
  <div className="flex flex-col gap-4 ml-8">
    {/* Linha superior */}
    <div className="flex items-center gap-2">
      <div className="w-16 h-0.5 bg-black"></div>
      <div className="w-2 h-2 bg-black"></div>
      <div className="w-1 h-1 bg-black"></div>
    </div>
    
    {/* Linha inferior com barras */}
    <div className="flex items-center gap-1">
      <div className="w-4 h-2 bg-black transform skew-x-12"></div>
      <div className="w-4 h-2 bg-black transform skew-x-12"></div>
      <div className="w-4 h-2 bg-black transform skew-x-12"></div>
      <div className="w-8 h-0.5 bg-black"></div>
      <div className="flex gap-1">
        <div className="w-0.5 h-3 bg-black"></div>
        <div className="w-0.5 h-5 bg-black"></div>
        <div className="w-0.5 h-2 bg-black"></div>
        <div className="w-0.5 h-4 bg-black"></div>
        <div className="w-0.5 h-1 bg-black"></div>
      </div>
      <div className="w-1 h-1 bg-black rounded-full"></div>
    </div>
  </div>
);

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
        
        {/* Display com roda/radar verde oliva */}
        <div className="relative">
          {/* Estrada animada com efeito de movimento */}
          <div className="w-64 h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full mb-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Container do display */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Bounding box roxa */}
            <div className="relative border-2 border-purple-500 rounded-lg p-4 bg-white/10 backdrop-blur-sm">
              {/* Roda/radar verde oliva */}
              <div className="flex items-center">
                <OliveRadarWheel />
                <HUDDisplay />
              </div>
              
              {/* Pontos de controle da bounding box */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border border-purple-500 rounded-full bg-white"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 border border-purple-500 rounded-full bg-white"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border border-purple-500 rounded-full bg-white"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border border-purple-500 rounded-full bg-white"></div>
              
              {/* Pontos médios */}
              <div className="absolute top-1/2 -left-1 w-2 h-2 bg-black rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-black rounded-full transform -translate-y-1/2"></div>
              <div className="absolute -top-1 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2"></div>
              <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2"></div>
            </div>
          </div>
          
          {/* Ícone de refresh abaixo */}
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-purple-500 rounded-full flex items-center justify-center animate-spin">
              <div className="w-3 h-3 border-t-2 border-purple-500 rounded-full"></div>
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
