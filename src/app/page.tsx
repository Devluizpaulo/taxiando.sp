
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Briefcase, Newspaper, MoveRight, MapPin, Clock, Building, Wrench, Star, ShieldCheck, FileText, Car, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuizSection } from "@/components/quiz-section";
import { CulturalAgendaSection } from "@/components/cultural-agenda-section";
import { PageViewTracker } from "@/components/page-view-tracker";
import { PartnersSection } from "@/components/partners-section";
import { getPublishedBlogPosts } from "@/app/actions/blog-actions";
import { getFeaturedVehicles } from "@/app/actions/fleet-actions";
import { getFeaturedServices } from "@/app/actions/service-actions";
import { BlogPost, ServiceListing, Testimonial, Vehicle } from "@/lib/types";
import { mockTestimonials } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGlobalSettings } from "./actions/admin-actions";


const HowToBeDriverSection = () => (
    <section id="how-to-start" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <Badge variant="secondary" className="mb-4">Guia do Iniciante</Badge>
            <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
              Quer se tornar um taxista profissional em SP?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground md:text-justify">
              Preparamos um guia completo com o passo a passo, desde a documentação necessária até encontrar o veículo ideal para você começar com o pé direito.
            </p>
            <p className="mt-4 text-muted-foreground md:text-justify">
              Desmistificamos todo o processo para você focar no que realmente importa: dirigir com segurança e profissionalismo.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/how-to-become-a-taxi-driver">Ver o Guia Completo <MoveRight className="ml-2" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Documentação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Saiba tudo sobre CNH com EAR e o Condutax.</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Entenda a importância do curso de formação obrigatório.</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader>
                <Car className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Alvará e Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Descubra como alugar um veículo regularizado.</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader>
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Início da Carreira</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Dicas para começar com o pé direito na profissão.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );

  const TestimonialsSection = ({ testimonials }: { testimonials: Testimonial[] }) => (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                    Aprovado por quem está na rua
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Veja o que profissionais como você estão dizendo sobre a Táxiando SP.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="flex flex-col justify-between">
                        <CardContent className="pt-6">
                            <Quote className="h-8 w-8 text-primary/30 mb-4" />
                            <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                        </CardContent>
                        <CardFooter className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={testimonial.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={testimonial.name} data-ai-hint="driver portrait business owner" />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    </section>
);


  const BlogSection = async () => {
    let blogPosts: BlogPost[] = [];
    try {
      blogPosts = await getPublishedBlogPosts(3);
    } catch (error) {
      if (!(error as Error).message.includes('Firebase Admin SDK not initialized')) {
        console.error("Failed to fetch blog posts for homepage, hiding section.", error);
      }
    }
    
    if (!blogPosts || blogPosts.length === 0) return null;

    return (
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
                        <Card key={post.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <Image src={post.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={post.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="city traffic"/>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-muted-foreground">{post.excerpt}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/blog/${post.slug}`}>Ler mais <MoveRight className="ml-2"/></Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
  }
  
const ClassifiedsSection = async () => {
    let featuredVehicles: Vehicle[] = [];
    let featuredServices: ServiceListing[] = [];
    
    try {
      [featuredVehicles, featuredServices] = await Promise.all([
          getFeaturedVehicles(3),
          getFeaturedServices(3)
      ]);
    } catch (error) {
       if (!(error as Error).message.includes('Firebase Admin SDK not initialized')) {
        console.error("Error fetching classifieds for homepage:", error);
      }
    }


    const hasContent = featuredVehicles.length > 0 || featuredServices.length > 0;
    if (!hasContent) return null;

    return (
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
                        <TabsTrigger value="rentals" disabled={featuredVehicles.length === 0}><Briefcase/> Veículos para Alugar</TabsTrigger>
                        <TabsTrigger value="services" disabled={featuredServices.length === 0}><Wrench/> Serviços e Produtos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rentals" className="pt-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredVehicles.map((vehicle) => (
                                <Card key={vehicle.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <CardHeader className="relative p-0">
                                      <Image src={vehicle.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={`${vehicle.make} ${vehicle.model}`} width={600} height={400} className="aspect-video w-full object-cover" data-ai-hint="car front view"/>
                                       <Badge className="absolute right-3 top-3 border-2 border-primary-foreground/50 bg-primary/90 px-3 py-1 text-lg font-bold text-primary-foreground">
                                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(vehicle.dailyRate)}
                                          <span className="ml-1 text-xs font-normal">/dia</span>
                                      </Badge>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-4">
                                        <CardTitle className="font-headline text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                                        <CardDescription>{vehicle.year} &bull; {vehicle.condition}</CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                          <Link href={`/rentals/${vehicle.id}`}>Ver Detalhes</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                     <TabsContent value="services" className="pt-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredServices.map((srv) => (
                                <Card key={srv.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <CardHeader className="p-0">
                                        <Image src={srv.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={srv.title} width={600} height={400} className="aspect-video w-full object-cover" data-ai-hint="services marketplace"/>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-4">
                                        <Badge variant="secondary" className="mb-2">{srv.category}</Badge>
                                        <CardTitle className="font-headline text-lg">{srv.title}</CardTitle>
                                        <CardDescription>Oferecido por: <span className="font-medium text-foreground">{srv.provider}</span></CardDescription>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
                                      <p className="text-lg font-bold text-primary">{srv.price}</p>
                                      <Button asChild>
                                          <Link href={`/services/${srv.id}`}>Ver Detalhes</Link>
                                      </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
             </div>
          </section>
    );
}

const CityGuideSection = () => (
  <section id="city-guide" className="py-16 md:py-24 bg-muted">
    <div className="container mx-auto px-4 md:px-6">
      <div className="mb-12 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
          Guia da Cidade
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Descubra os melhores lugares de São Paulo com dicas exclusivas para motoristas e passageiros.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dicas removidas temporariamente. Implemente aqui se desejar mostrar dicas estáticas ou buscar de outro lugar. */}
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <CardHeader className="relative p-0">
            <div className="aspect-video w-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-slate-400" />
            </div>
            <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground">
              Motorista
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <CardTitle className="font-headline text-lg">Dica de exemplo</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">Aqui você pode exibir dicas estáticas ou buscar de outra fonte.</CardDescription>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>São Paulo, SP</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/spdicas">Ver Mais Dicas</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/spdicas">Explorar Guia Completo <MoveRight className="ml-2" /></Link>
        </Button>
      </div>
    </div>
  </section>
);

const RentVehiclePrompt = () => (
    <section id="rent-vehicle" className="py-16 md:py-24 bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Precisa de um carro pra rodar?
            </h2>
            <p className="mt-4 text-lg text-accent-foreground/80 md:text-justify">
              Não fique a pé. Na Táxiando SP você encontra veículos de frotas e "porta branca" verificados, prontos para você começar a trabalhar hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Button asChild size="lg" variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/rentals">Ver Veículos Disponíveis</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-80 w-full order-first md:order-last">
            <Image
              src="/bannerhome.png"
              alt="Chave de carro sendo entregue"
              fill
              className="rounded-lg shadow-xl object-cover"
              priority
              data-ai-hint="handing car keys"
            />
          </div>
        </div>
      </div>
    </section>
  );

export default async function Home() {
  const settings = await getGlobalSettings();
  
  return (
    <>
      <PageViewTracker page="home" />
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">
           <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background via-muted/50 to-background">
            <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6">
              <div className="space-y-8 text-center md:text-left">
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground font-semibold py-1 px-3">
                  A plataforma completa para o profissional do volante em São Paulo
                </Badge>
                <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  O ecossistema completo para o profissional do volante.
                </h1>
                <p className="mx-auto max-w-xl text-lg text-muted-foreground md:mx-0 md:text-xl md:text-justify">
                  Mais que uma plataforma, uma comunidade. Encontre veículos, qualifique-se com cursos exclusivos e descubra os melhores roteiros da cidade com nosso Guia SP.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                    <Link href="/register">Crie sua conta gratuita</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/rentals">Ver Oportunidades <MoveRight className="ml-2" /></Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground md:justify-start">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>Frotas Verificadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Cursos Especializados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Guia da Cidade</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                 <div className="absolute -inset-4 rounded-3xl bg-primary/20 opacity-60 blur-3xl"></div>
                <Image
                  src="/hero.png"
                  alt="Taxista em São Paulo"
                  width={600}
                  height={600}
                  className="relative z-10 w-full max-w-xs rounded-2xl object-cover shadow-2xl aspect-[4/5] sm:max-w-sm md:aspect-square md:max-w-md"
                  priority
                  data-ai-hint="professional taxi driver"
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
                <Card className="text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
                <Card className="text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
                 <Card className="text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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

          <RentVehiclePrompt />
          
          <HowToBeDriverSection />

          <CityGuideSection />

          {settings.homepage?.showTestimonials && <TestimonialsSection testimonials={mockTestimonials} />}

          <QuizSection />
          
          {settings.homepage?.showAgenda && <CulturalAgendaSection />}

          <BlogSection />

          <ClassifiedsSection />
          
          {settings.homepage?.showPartners && <PartnersSection />}

          <section className="bg-primary py-20">
            <div className="container mx-auto px-4 text-center md:px-6">
              <h2 className="font-headline text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl">
                Pronto para dar o próximo passo?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90 md:text-justify">
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
