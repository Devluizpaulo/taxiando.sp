import { Car, Zap } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden", className)}>
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/50 backdrop-blur-lg shadow-2xl border border-white/30">
        <div className="relative w-64 h-48 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* O homem e a roda em um container para animação de 'push' */}
            <div className="animate-push-pull">
              <Image 
                src="https://storage.googleapis.com/project-spark-b8529.appspot.com/static/images/loading-push-wheel.png" 
                alt="Homem empurrando a roda" 
                width={200} 
                height={150} 
                className="w-auto h-auto"
                priority
                data-ai-hint="man pushing wheel"
              />
            </div>
            {/* A roda separada para a animação de 'spin' */}
            <div className="absolute left-[26px] top-[26px] w-[100px] h-[100px]">
              <Image 
                src="https://storage.googleapis.com/project-spark-b8529.appspot.com/static/images/loading-wheel.png" 
                alt="Roda girando" 
                width={100} 
                height={100} 
                className="animate-spin-slow" 
                priority
                data-ai-hint="wheel"
              />
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800">
          Preparando seu painel...
        </h2>
        <p className="text-gray-600 text-sm mt-2">
          Colocando tudo em ordem para você!
        </p>

        {/* Barra de progresso animada */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner mt-6">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}