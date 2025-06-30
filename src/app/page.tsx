
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Briefcase, Newspaper, MoveRight, MapPin, Clock, Building, Wrench, Star, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuizSection } from "@/components/quiz-section";
import { CulturalAgendaSection } from "@/components/cultural-agenda-section";
import { mockVehicles, mockServiceListings } from "@/lib/mock-data";
import { PageViewTracker } from "@/components/page-view-tracker";

const blogPosts = [
  {
    id: 1,
    title: "Nova regulamentação para apps de transporte em SP: O que muda?",
    excerpt: "A prefeitura de São Paulo anunciou novas regras que impactam diretamente a vida dos motoristas de aplicativo. Saiba tudo...",
    image: "/ubertx.png",
    imageHint: "city traffic",
    slug: "/blog/nova-regulamentacao"
  },
  {
    id: 2,
    title: "5 dicas para aumentar seus ganhos como taxista",
    excerpt: "Descubra estratégias comprovadas para otimizar suas corridas e maximizar seus lucros no final do mês.",
    image: "/tx5dicas.png",
    imageHint: "money coins",
    slug: "/blog/dicas-ganhos"
  },
  {
    id: 3,
    title: "Manutenção preventiva: evite surpresas e economize",
    excerpt: "Um guia completo sobre os cuidados essenciais que você deve ter com seu veículo para garantir segurança e economia.",
    image: "/oficina.png",
    imageHint: "car maintenance",
    slug: "/blog/manutencao-preventiva"
  },
];


export default function Home() {
  return (
    <>
      <PageViewTracker page="home" />
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">
           <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background via-muted/50 to-background">
            <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6">
              <div className="space-y-8">
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground font-semibold py-1 px-3">
                  A plataforma Nº1 para o profissional do volante
                </Badge>
                <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  Sua carreira decola aqui.
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                  Cursos, notícias e as melhores oportunidades para taxistas e motoristas de app em São Paulo. Tudo em um só lugar.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                    <Link href="/register">Crie sua conta gratuita</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/rentals">Ver Oportunidades <MoveRight className="ml-2" /></Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>Frotas Verificadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Cursos Especializados</span>
                  </div>
                </div>
              </div>
              <div className="relative flex justify-center items-center">
                <div className="absolute -inset-4 bg-primary/30 rounded-full blur-3xl opacity-50"></div>
                <Image
                  src="/hero.png"
                  alt="Taxista em São Paulo"
                  width={600}
                  height={600}
                  className="relative z-10 w-full max-w-md rounded-full object-cover shadow-2xl aspect-square"
                  priority
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
                    <CardTitle className="font-headline mt-4">Aluguel e Classificados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Conectamos você às melhores frotas e serviços para o seu dia a dia.
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
                      Oportunidades em Destaque
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                      Encontre o veículo ideal e os melhores serviços para acelerar sua carreira.
                    </p>
                </div>
                <Tabs defaultValue="rentals" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rentals"><Briefcase/> Veículos para Alugar</TabsTrigger>
                        <TabsTrigger value="services"><Wrench/> Serviços e Produtos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rentals" className="pt-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {mockVehicles.slice(0, 3).map((vehicle) => (
                                <Card key={vehicle.plate}>
                                    <CardHeader className="p-0 relative">
                                      <Image src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="car front view"/>
                                       <Badge className="absolute top-3 right-3 text-lg py-1 px-3 bg-primary/90 text-primary-foreground font-bold border-2 border-primary-foreground/50">
                                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(vehicle.dailyRate)}
                                          <span className="text-xs font-normal ml-1">/dia</span>
                                      </Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-1">
                                        <CardTitle className="font-headline text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                                        <CardDescription>{vehicle.year} &bull; {vehicle.condition}</CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                          <Link href={`/rentals/${vehicle.id}`}>Ver mais veículos</Link>
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
                                          <Link href="/services/marketplace">Ver detalhes</Link>
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
                <Link href="/register">Crie sua conta gratuita</Link>
              </Button>
            </div>
          </section>
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
