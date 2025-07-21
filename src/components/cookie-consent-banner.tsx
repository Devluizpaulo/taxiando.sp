'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check localStorage only on the client side
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] p-4 transition-transform duration-500",
        showBanner ? "translate-y-0" : "translate-y-full"
    )}>
        <Card className="max-w-4xl mx-auto shadow-2xl">
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                    Nós utilizamos cookies para melhorar sua experiência de navegação e personalizar o conteúdo. Ao continuar, você concorda com nossa{' '}
                    <Link href="/privacy" className="underline hover:text-primary">
                        Política de Privacidade
                    </Link>.
                </p>
                <Button onClick={handleAccept} className="w-full md:w-auto flex-shrink-0">
                    Entendi e Aceito
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
