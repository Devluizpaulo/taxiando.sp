import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center bg-background", className)}>
      <div className="flex flex-col items-center gap-6">
        <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={170} className="h-24 w-auto rounded-xl shadow-lg" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
