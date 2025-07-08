
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FacebookIcon } from "../icons/facebook-icon";
import { Instagram, MessageSquare, MoveRight } from "lucide-react";
import { getGlobalSettings } from "@/app/actions/admin-actions";


export async function PublicFooter() {
  const version = process.env.APP_VERSION || '0.0.0';
  
  const settings = await getGlobalSettings();
  const socialMedia = settings.socialMedia;

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                 <Link href="/" className="mb-4 inline-block">
                    <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-16 w-auto rounded-lg shadow-md" />
                 </Link>
                 <p className="max-w-xs text-sm text-muted-foreground">
                    A plataforma completa para o profissional do volante em SP. Qualificação, notícias e as melhores oportunidades.
                 </p>
                 <div className="mt-6 flex gap-4">
                    {socialMedia?.facebook?.enabled && socialMedia.facebook.url && (
                        <Link href={socialMedia.facebook.url} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <FacebookIcon className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                        </Link>
                    )}
                    {socialMedia?.instagram?.enabled && socialMedia.instagram.url && (
                        <Link href={socialMedia.instagram.url} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                        </Link>
                    )}
                    {socialMedia?.whatsapp?.enabled && socialMedia.whatsapp.url && (
                        <Link href={socialMedia.whatsapp.url} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                        </Link>
                    )}
                 </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-headline font-semibold">Plataforma</h4>
                <div className="grid gap-2">
                    <Link href="/how-to-become-a-taxi-driver" className="text-sm text-muted-foreground transition-colors hover:text-primary">Seja um Taxista</Link>
                    <Link href="/rentals" className="text-sm text-muted-foreground transition-colors hover:text-primary">Alugar Veículo</Link>
                    <Link href="/events" className="text-sm text-muted-foreground transition-colors hover:text-primary">Guia SP</Link>
                    <Link href="/services/marketplace" className="text-sm text-muted-foreground transition-colors hover:text-primary">Serviços</Link>
                    <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-primary">Guias & Notícias</Link>
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-headline font-semibold">Suporte</h4>
                <div className="grid gap-2">
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contato</Link>
                    <Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-primary">FAQ</Link>
                    <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">Termos de Serviço</Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">Política de Privacidade</Link>
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
             <p className="text-xs text-muted-foreground mt-2">
                Desenvolvido por{' '}
                <a
                    href="https://fenixsolutions.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
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
