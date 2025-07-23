'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FacebookIcon } from "../icons/facebook-icon";
import { Instagram, MessageSquare, MoveRight } from "lucide-react";
import { getGlobalSettings } from "@/app/actions/admin-actions";
import { useEffect, useState } from "react";
import { type GlobalSettings } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";


export function PublicFooter() {
  const version = process.env.APP_VERSION || '0.1.0';
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    getGlobalSettings().then(setSettings);
  }, []);

  if (!settings) {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container mx-auto px-4 py-12 md:px-6">
                 <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
                     <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                         <Skeleton className="h-16 w-36 rounded-lg" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4" />
                         <div className="flex gap-4 pt-2">
                             <Skeleton className="h-6 w-6 rounded-full" />
                             <Skeleton className="h-6 w-6 rounded-full" />
                             <Skeleton className="h-6 w-6 rounded-full" />
                         </div>
                     </div>
                      <div className="space-y-4">
                         <Skeleton className="h-5 w-24" />
                         <div className="grid gap-2">
                             <Skeleton className="h-4 w-32" />
                             <Skeleton className="h-4 w-28" />
                             <Skeleton className="h-4 w-24" />
                         </div>
                     </div>
                      <div className="space-y-4">
                         <Skeleton className="h-5 w-24" />
                         <div className="grid gap-2">
                             <Skeleton className="h-4 w-32" />
                             <Skeleton className="h-4 w-28" />
                             <Skeleton className="h-4 w-24" />
                         </div>
                     </div>
                      <div className="space-y-4">
                         <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-full" />
                         <div className="flex gap-2">
                             <Skeleton className="h-10 flex-1" />
                             <Skeleton className="h-10 w-10" />
                         </div>
                     </div>
                 </div>
                 <div className="mt-12 border-t pt-8 text-center space-y-2">
                     <Skeleton className="h-4 w-1/2 mx-auto" />
                     <Skeleton className="h-3 w-1/3 mx-auto" />
                 </div>
            </div>
        </footer>
    );
  }

  const socialMedia = settings?.socialMedia;

  return (
    <footer className="border-t bg-muted/40 relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 opacity-70" />
      <div className="container mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                 <Link href="/" className="mb-6 inline-block max-w-full" tabIndex={0}>
                    <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={142} className="h-20 w-auto rounded-xl shadow-lg bg-white/80 p-2 max-w-full" />
                 </Link>
                 <p className="max-w-xs text-sm text-muted-foreground text-center md:text-left">
                    O ecossistema completo para o profissional do volante em São Paulo. Cursos, oportunidades, guia da cidade e muito mais.
                 </p>
                 <div className="mt-8 flex gap-6 justify-center md:justify-start">
                    {socialMedia?.facebook?.enabled && socialMedia.facebook.url && (
                        <Link href={socialMedia.facebook.url} aria-label="Facebook" target="_blank" rel="noopener noreferrer" tabIndex={0} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                            <FacebookIcon className="h-7 w-7 text-muted-foreground transition-colors hover:text-primary" />
                        </Link>
                    )}
                    {socialMedia?.instagram?.enabled && socialMedia.instagram.url && (
                        <Link href={socialMedia.instagram.url} aria-label="Instagram" target="_blank" rel="noopener noreferrer" tabIndex={0} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                            <Instagram className="h-7 w-7 text-muted-foreground transition-colors hover:text-primary" />
                        </Link>
                    )}
                    {socialMedia?.whatsapp?.enabled && socialMedia.whatsapp.url && (
                        <Link href={socialMedia.whatsapp.url} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" tabIndex={0} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                            <MessageSquare className="h-7 w-7 text-muted-foreground transition-colors hover:text-primary" />
                        </Link>
                    )}
                 </div>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <h4 className="font-headline font-semibold">Plataforma</h4>
                <div className="grid gap-2">
                    <Link href="/how-to-become-a-taxi-driver" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Seja um Taxista</Link>
                    <Link href="/rentals" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Alugar Veículo</Link>
                    <Link href="/courses" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Cursos</Link>
                    <Link href="/services/marketplace" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Serviços</Link>
                    <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Blog & Notícias</Link>
                </div>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <h4 className="font-headline font-semibold">Recursos</h4>
                <div className="grid gap-2">
                    <Link href="/courses" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Cursos</Link>
                    <Link href="/library" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Biblioteca</Link>
                    <Link href="/spdicas" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Guia da Cidade</Link>
                    <Link href="/events" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Eventos</Link>
                </div>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <h4 className="font-headline font-semibold">Suporte</h4>
                <div className="grid gap-2">
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Contato</Link>
                    <Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>FAQ</Link>
                    <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Termos de Serviço</Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}>Política de Privacidade</Link>
                </div>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <h4 className="font-headline font-semibold">Newsletter</h4>
                <p className="text-sm text-muted-foreground">Fique por dentro das novidades, oportunidades e dicas do setor.</p>
                <form className="flex flex-col gap-2 sm:flex-row sm:gap-2 items-center sm:items-stretch">
                    <Input placeholder="seu@email.com" className="flex-1 min-w-0" />
                    <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                        <MoveRight />
                    </Button>
                </form>
            </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Táxiando SP. Todos os direitos reservados.
            </p>
             <p className="text-xs text-muted-foreground mt-2">
                Desenvolvido por{' '}
                <a
                    href="https://fenixsolutions.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    tabIndex={0}
                >
                    FênixSolutions & Build
                </a>{' '}
                | Versão {version}
            </p>
        </div>
      </div>
    </footer>
  );
}
