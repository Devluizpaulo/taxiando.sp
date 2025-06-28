import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Briefcase, Lightbulb, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-background py-20 md:py-32">
          <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                Transforme sua carreira de taxista em São Paulo
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                A Táxiando SP é a plataforma completa para você se qualificar, encontrar as melhores oportunidades e se destacar no mercado.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/register">Comece Agora</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/opportunities">Ver Oportunidades <MoveRight className="ml-2" /></Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image 
                src="https://placehold.co/600x400.png"
                alt="Taxi in São Paulo"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="taxi sao paulo"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                Tudo que você precisa para decolar
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Oferecemos as ferramentas e o conhecimento para você ir mais longe.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Cursos Especializados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Aprenda com especialistas do mercado e obtenha as certificações mais valorizadas.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Quadro de Oportunidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Conectamos você às melhores vagas em frotas e cooperativas de prestígio.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Lightbulb className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Ferramentas Inovadoras</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Utilize nossa IA para otimizar seus estudos e planejar sua carreira com mais eficiência.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-primary py-20">
          <div className="container mx-auto px-4 text-center md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl">
              Pronto para dar o próximo passo?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
              Junte-se a milhares de taxistas que estão transformando suas carreiras com a Táxiando SP.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/register">Crie sua conta gratuitamente</Link>
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
