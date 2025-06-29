
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Briefcase, Newspaper, MoveRight, MapPin, Clock, Building, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuizSection } from "@/components/quiz-section";
import { CulturalAgendaSection } from "@/components/cultural-agenda-section";
import { mockJobOpportunities, mockServiceListings } from "@/lib/mock-data";

const blogPosts = [
  {
    id: 1,
    title: "Nova regulamentação para apps de transporte em SP: O que muda?",
    excerpt: "A prefeitura de São Paulo anunciou novas regras que impactam diretamente a vida dos motoristas de aplicativo. Saiba tudo...",
    image: "https://placehold.co/600x400.png",
    imageHint: "city traffic",
    slug: "/blog/nova-regulamentacao"
  },
  {
    id: 2,
    title: "5 dicas para aumentar seus ganhos como taxista",
    excerpt: "Descubra estratégias comprovadas para otimizar suas corridas e maximizar seus lucros no final do mês.",
    image: "https://placehold.co/600x400.png",
    imageHint: "money coins",
    slug: "/blog/dicas-ganhos"
  },
  {
    id: 3,
    title: "Manutenção preventiva: evite surpresas e economize",
    excerpt: "Um guia completo sobre os cuidados essenciais que você deve ter com seu veículo para garantir segurança e economia.",
    image: "https://placehold.co/600x400.png",
    imageHint: "car maintenance",
    slug: "/blog/manutencao-preventiva"
  },
];


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-background py-20 md:py-32">
          <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                A plataforma completa para o profissional do volante em SP
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Qualificação, notícias e as melhores oportunidades para taxistas e motoristas de app. Tudo em um só lugar.
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
                    <Newspaper className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Notícias e Matérias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fique por dentro de tudo que acontece no setor, com análises e novidades.
                  </p>
                </CardContent>
              </Card>
               <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Vagas e Classificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Conectamos você às melhores vagas e serviços para o seu dia a dia.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <QuizSection />

        <CulturalAgendaSection />

        <section id="blog" className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                  Últimas Notícias e Matérias
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  Informação de qualidade para o profissional do volante.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {blogPosts.map((post) => (
                <Card key={post.id} className="flex flex-col overflow-hidden">
                  <Image src={post.image} alt={post.title} width={600} height={400} className="w-full object-cover" data-ai-hint={post.imageHint}/>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={post.slug}>Ler mais <MoveRight className="ml-2"/></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="classifieds" className="py-16 md:py-24">
           <div className="container mx-auto px-4 md:px-6">
              <div className="mb-12 text-center">
                  <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                    Classificados de Oportunidades
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Encontre a vaga ideal e os melhores serviços para acelerar sua carreira.
                  </p>
              </div>
              <Tabs defaultValue="jobs" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="jobs"><Briefcase/> Vagas de Emprego</TabsTrigger>
                      <TabsTrigger value="services"><Wrench/> Serviços e Produtos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="jobs" className="pt-8">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {mockJobOpportunities.slice(0, 3).map((job) => (
                              <Card key={job.id}>
                                  <CardHeader>
                                      <CardTitle className="font-headline text-lg">{job.title}</CardTitle>
                                      <CardDescription>{job.company}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4"/>
                                          <span>{job.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4"/>
                                          <span>{job.type}</span>
                                      </div>
                                  </CardContent>
                                  <CardFooter>
                                      <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        <Link href="/opportunities">Ver mais vagas</Link>
                                      </Button>
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                  </TabsContent>
                   <TabsContent value="services" className="pt-8">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {mockServiceListings.slice(0, 3).map((srv) => (
                              <Card key={srv.id} className="flex flex-col overflow-hidden">
                                  <CardHeader className="p-0">
                                      <Image src={srv.imageUrl} alt={srv.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint={srv.imageHint}/>
                                  </CardHeader>
                                  <CardContent className="p-4 flex-1">
                                      <Badge variant="secondary" className="mb-2">{srv.category}</Badge>
                                      <CardTitle className="font-headline text-lg">{srv.title}</CardTitle>
                                      <CardDescription>Oferecido por: {srv.provider}</CardDescription>
                                  </CardContent>
                                  <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
                                    <p className="text-lg font-bold text-primary">{srv.price}</p>
                                    <Button asChild>
                                        <Link href="/opportunities">Ver detalhes</Link>
                                    </Button>
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                  </TabsContent>
              </Tabs>
           </div>
        </section>

        <section id="partners" className="py-16 md:py-24 bg-muted">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">Nossos Parceiros</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Empresas que confiam e apoiam a nossa comunidade.</p>
                </div>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                            <Building className="h-16 w-16 text-muted-foreground/60" />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="bg-primary py-20">
          <div className="container mx-auto px-4 text-center md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl">
              Pronto para dar o próximo passo?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
              Junte-se a milhares de profissionais que estão transformando suas carreiras com a Táxiando SP.
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
