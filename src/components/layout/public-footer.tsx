import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
        <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-14 w-auto rounded-md shadow-sm" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Táxiando SP. Todos os direitos reservados.
        </p>
        <nav className="flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Termos de Serviço
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Política de Privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}
