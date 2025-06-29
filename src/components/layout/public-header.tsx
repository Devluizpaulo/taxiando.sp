'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/rentals", label: "Alugar Veículo" },
    { href: "/#features", label: "Recursos" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-16 w-auto rounded-lg shadow-md" priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/register">Cadastre-se</Link>
          </Button>
        </div>
         <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navegação principal do site.</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium mt-10">
                 {navLinks.map((link) => (
                    <Link 
                        key={link.href} 
                        href={link.href}
                        className={cn(
                            "transition-colors hover:text-primary",
                            pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                        )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 pt-6">
                     <Button asChild variant="ghost" size="lg">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/register">Cadastre-se</Link>
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
