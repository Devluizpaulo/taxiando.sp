

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FacebookIcon } from "../icons/facebook-icon";
import { Instagram, MessageSquare, MoveRight } from "lucide-react";


export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-full mb-4 lg:col-span-2 lg:mb-0">
                 <Link href="/" className="mb-4 inline-block">
                    <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-16 w-auto rounded-lg shadow-md" />
                 </Link>
                 <p className="max-w-xs text-sm text-muted-foreground">
                    A plataforma completa para o profissional do volante em SP. Qualificação, notícias e as melhores oportunidades.
                 </p>
                 <div className="mt-6 flex gap-4">
                    <Link href="#" aria-label="Facebook">
                      <FacebookIcon className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                    </Link>
                    <Link href="#" aria-label="Instagram">
                       <Instagram className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                    </Link>
                    <Link href="#" aria-label="WhatsApp">
                        <MessageSquare className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                    </Link>
                 </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-headline font-semibold">Plataforma</h4>
                <div className="grid gap-2">
                    <Link href="/how-to-become-a-taxi-driver" className="text-sm text-muted-foreground transition-colors hover:text-primary">Seja um Taxista</Link>
                    <Link href="/rentals" className="text-sm text-muted-foreground transition-colors hover:text-primary">Alugar Veículo</Link>
                    <Link href="/events" className="text-sm text-muted-foreground transition-colors hover:text-primary">Agenda Cultural</Link>
                    <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-primary">Recursos</Link>
                    <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-primary">Notícias</Link>
                    <Link href="/#quiz" className="text-sm text-muted-foreground transition-colors hover:text-primary">Quiz</Link>
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-headline font-semibold">Legal</h4>
                <div className="grid gap-2">
                    <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">Termos de Serviço</Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">Política de Privacidade</Link>
                    <Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-primary">FAQ</Link>
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contato</Link>
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-headline font-semibold">Newsletter</h4>
                <p className="text-sm text-muted-foreground">Fique por dentro das novidades do setor.</p>
                <form className="flex gap-2">
                    <Input placeholder="seu@email.com" className="flex-1" />
                    <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <MoveRight />
                    </Button>
                </form>
            </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Táxiando SP. Todos os direitos reservados.
            </p>
        </div>
      </div>
    </footer>
  );
}
