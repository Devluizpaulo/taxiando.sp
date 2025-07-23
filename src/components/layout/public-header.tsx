
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, Home, UserPlus, Map, Car, Wrench, Newspaper, Mail, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicSettings } from "@/app/actions/admin-actions";
import { Skeleton } from "../ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function PublicHeader() {
  const pathname = usePathname();
  const [siteSettings, setSiteSettings] = useState<{siteName: string, logoUrl: string} | null>(null);

  useEffect(() => {
    getPublicSettings().then(setSiteSettings);
  }, []);

  const navLinks = [
    { href: "/", label: "Início", icon: Home },
    { href: "/how-to-become-a-taxi-driver", label: "Seja um Taxista", icon: UserPlus },
    { href: "/events", label: "Eventos", icon: Map },
    { href: "/spdicas", label: "Guia da Cidade", icon: Star },
    { href: "/rentals", label: "Alugar Veículo", icon: Car },
    { href: "/services/marketplace", label: "Serviços", icon: Wrench },
    { href: "/blog", label: "Blog & Notícias", icon: Newspaper },
    { href: "/contact", label: "Contato", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-white/95 via-background/95 to-amber-50/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-shadow duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-2 md:px-4 lg:px-8 gap-2 md:gap-4">
        <Link href="/" className="flex items-center max-w-[60vw] mr-2 md:mr-4" aria-label="Página inicial">
          <Image src="/logo.png" alt="Táxiando SP" width={140} height={40} className="h-10 md:h-14 w-auto rounded-xl drop-shadow-lg bg-white/80 p-2 max-w-full" priority />
        </Link>
        {/* Menu desktop */}
        <nav className="hidden lg:flex items-center gap-3 md:gap-4 xl:gap-8 max-w-[60vw]">
          {navLinks.slice(0,5).map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              aria-label={link.label}
              tabIndex={0}
              className={cn(
                "text-base font-medium transition-colors hover:text-primary hover:underline underline-offset-8 px-4 py-2 rounded-md whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                pathname === link.href ? "text-primary font-bold bg-amber-50/80 shadow-sm underline underline-offset-8 decoration-4 decoration-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative group">
            <Button variant="ghost" className="text-base font-medium px-4 py-2 rounded-md whitespace-nowrap">Mais</Button>
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-auto transition-opacity duration-200 z-50">
              <div className="flex flex-col py-2">
                {navLinks.slice(5).map((link) => (
                  <Link key={link.href} href={link.href} aria-label={link.label} className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-amber-50/60 rounded-md transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{link.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="hidden items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 lg:flex">
          <Button asChild variant="ghost" className="font-semibold px-3 md:px-4 py-2" aria-label="Login">
            <Link href="/login" tabIndex={0} aria-label="Login">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-md hover:from-amber-500 hover:to-orange-600 transition-all px-3 md:px-4 py-2">
            <Link href="/register" tabIndex={0}>Cadastre-se</Link>
          </Button>
        </div>
        {/* Menu mobile: botão de menu que abre Sheet lateral com scroll vertical */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shadow-md">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="max-w-xs w-full flex flex-col h-full p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navegação principal do site.</SheetDescription>
              </SheetHeader>
              <nav className="flex-1 flex flex-col gap-2 text-lg font-medium mt-10 px-6 overflow-y-auto">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      aria-label={link.label}
                      tabIndex={0}
                      className={cn(
                        "flex items-center gap-4 transition-colors hover:text-primary hover:underline underline-offset-8 px-3 py-4 rounded-md whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary text-base",
                        pathname === link.href ? "text-primary font-bold bg-amber-50/80 shadow-sm underline underline-offset-8 decoration-4 decoration-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
                <div className="flex flex-col gap-4 pt-8">
                  <Button asChild variant="ghost" size="lg" className="font-semibold text-lg py-4">
                    <Link href="/login" tabIndex={0}>Login</Link>
                  </Button>
                  <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-md hover:from-amber-500 hover:to-orange-600 transition-all text-lg py-4">
                    <Link href="/register" tabIndex={0}>Cadastre-se</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
