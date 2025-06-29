'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/opportunities", label: "Oportunidades" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-12 w-auto" priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/register">Cadastre-se</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
