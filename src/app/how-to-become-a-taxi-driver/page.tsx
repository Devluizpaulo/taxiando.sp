
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, Book, FileText, Car, Star, ThumbsUp, ThumbsDown, Building, User, Users, Search, Lightbulb } from "lucide-react";

// The core step-by-step guide
const steps = [
    {
        icon: Check,
        title: "1. Check-list Inicial: Os Pré-Requisitos",
        description: "Antes de tudo, garanta que você atende aos requisitos básicos exigidos pela legislação.",
        details: [
            "Ter mais de 20 anos de idade.",
            "Possuir CNH na categoria B ou superior.",
            "A CNH deve conter a observação 'Exerce Atividade Remunerada' (EAR).",
            "Não possuir antecedentes criminais graves."
        ]
    },
    {
        icon: Book,
        title: "2. A Escola: Curso de Formação Específico",
        description: "É obrigatório realizar um curso de formação para condutores de táxi. É o seu primeiro passo para a profissionalização.",
        details: [
            "O curso aborda legislação, relações humanas, primeiros socorros e mecânica básica.",
            "Procure por Centros de Formação de Condutores (CFCs) credenciados pelo Detran.",
            "Ao final, você receberá um certificado de conclusão, essencial para a próxima etapa."
        ]
    },
    {
        icon: FileText,
        title: "3. O Registro: Obtenha o CONDUTAX",
        description: "O CONDUTAX é o seu registro oficial como taxista em São Paulo. É a sua licença para operar.",
        details: [
            "Com o certificado do curso, dirija-se ao DTP (Departamento de Transportes Públicos).",
            "Será necessário apresentar uma série de documentos (CNH, comprovante de residência, certidões).",
            "Após a aprovação, seu CONDUTAX será emitido. Parabéns, você já é um taxista habilitado!"
        ]
    },
    {
        icon: Car,
        title: "4. A Ferramenta: Veículo e Alvará",
        description: "Com o CONDUTAX em mãos, você precisa de um veículo com Alvará de Estacionamento para começar.",
        details: [
            "Você pode alugar um veículo que já possui alvará de uma frota ou de um taxista autônomo ('porta branca').",
            "Esta é a forma mais comum e rápida para iniciar na profissão.",
            "A plataforma Táxiando SP é o lugar ideal para encontrar as melhores frotas e oportunidades de aluguel."
        ]
    }
];

// New component for Advantages vs Challenges
const RealityCheckSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800"><ThumbsUp /> Vantagens da Profissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
                <p><strong>Autonomia:</strong> Você é seu próprio chefe, define seus horários e metas.</p>
                <p><strong>Flexibilidade:</strong> Adapte sua rotina de trabalho às suas necessidades pessoais.</p>
                <p><strong>Potencial de Ganhos:</strong> Seus resultados dependem diretamente do seu esforço e estratégia.</p>
                <p><strong>Conhecimento da Cidade:</strong> Torne-se um verdadeiro especialista em São Paulo, descobrindo novos caminhos e lugares.</p>
            </CardContent>
        </Card>
        <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-800"><ThumbsDown /> Desafios e Lutas do Setor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
                <p><strong>Concorrência:</strong> A disputa com aplicativos de transporte exige mais profissionalismo e qualidade.</p>
                <p><strong>Custos Operacionais:</strong> Combustível, manutenção e aluguel são despesas constantes.</p>
                <p><strong>Trânsito Intenso:</strong> Lidar com o trânsito de SP exige paciência e estratégia.</p>
                <p><strong>Regulamentação:</strong> Manter-se atualizado com as leis e normas da prefeitura é fundamental.</p>
            </CardContent>
        </Card>
    </div>
);

// New component for Fleet vs Private
const YourStartingPointSection = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-t-4 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><Building /> Alugar de uma Frota</CardTitle>
                <CardDescription>Ideal para quem busca segurança e menos burocracia para começar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                 <p className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0"/> <span>Menor risco inicial, sem necessidade de grande investimento.</span></p>
                 <p className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0"/> <span>Manutenção, seguro e documentação geralmente inclusos.</span></p>
                 <p className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0"/> <span>Suporte da empresa para questões operacionais.</span></p>
                 <p className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0"/> <span>Veículos mais novos e com revisões em dia.</span></p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><User /> Alugar de um Particular ('Porta Branca')</CardTitle>
                 <CardDescription>Uma alternativa com mais flexibilidade na negociação direta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                 <p className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0"/> <span>Possibilidade de negociar valores e condições diretamente.</span></p>
                 <p className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0"/> <span>Contratos que podem ser mais flexíveis.</span></p>
                 <p className="pl-6 text-muted-foreground">Responsabilidade maior sobre manutenção e limpeza.</p>
                 <p className="pl-6 text-muted-foreground">Menos suporte em caso de imprevistos.</p>
            </CardContent>
        </Card>
    </div>
);


export default function HowToBeTaxiDriverPage() {
    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 space-y-16">
                    <div className="text-center">
                        <Badge variant="secondary" className="mb-4">Sua Nova Carreira Começa Aqui</Badge>
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-5xl">A Rota para sua Independência Profissional</h1>
                        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
                            Deixar um emprego tradicional ou sair dos aplicativos para se tornar taxista em São Paulo é uma grande decisão. É sobre ser seu próprio chefe, conhecer a cidade como ninguém e ter o controle da sua renda. Aqui, vamos te mostrar que, com a orientação certa, essa transição pode ser mais simples e lucrativa do que você imagina.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-center font-headline text-3xl font-bold mb-8">A Realidade do Volante: Vantagens e Desafios</h2>
                        <RealityCheckSection />
                    </div>

                     <div>
                        <h2 className="text-center font-headline text-3xl font-bold mb-8">Seu Ponto de Partida: Frota ou Particular?</h2>
                        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">A primeira grande escolha é como você vai conseguir seu carro. Existem dois caminhos principais, cada um com suas particularidades.</p>
                        <YourStartingPointSection />
                    </div>

                    <div>
                         <h2 className="text-center font-headline text-3xl font-bold mb-8">O Caminho das Pedras: Seu Guia Passo a Passo</h2>
                         <div className="relative max-w-3xl mx-auto">
                            <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2 md:left-1/2"></div>
                            
                            {steps.map((step, index) => (
                                <div key={index} className="relative flex items-start gap-6 md:gap-12 mb-12">
                                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <Card className="w-full md:flex-1">
                                        <CardHeader>
                                            <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                                            <CardDescription>{step.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {step.details.map((detail, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <Star className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="bg-accent text-accent-foreground">
                        <CardHeader className="text-center">
                            <Lightbulb className="mx-auto h-12 w-12 mb-4" />
                            <CardTitle className="font-headline text-3xl">A Táxiando SP é sua Copilota nessa Jornada</CardTitle>
                            <CardDescription className="text-accent-foreground/80 max-w-3xl mx-auto text-lg">Entendemos que esse processo pode parecer complexo. É por isso que existimos. Não te deixamos na mão.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 rounded-lg bg-accent/50">
                                <Search className="mx-auto h-8 w-8 mb-2"/>
                                <h3 className="font-bold">Oportunidades Verificadas</h3>
                                <p className="text-sm text-accent-foreground/80">Conectamos você às melhores e mais confiáveis frotas de São Paulo.</p>
                            </div>
                             <div className="p-4 rounded-lg bg-accent/50">
                                <Book className="mx-auto h-8 w-8 mb-2"/>
                                <h3 className="font-bold">Qualificação na Prática</h3>
                                <p className="text-sm text-accent-foreground/80">Oferecemos cursos que te preparam para os desafios reais da rua.</p>
                            </div>
                             <div className="p-4 rounded-lg bg-accent/50">
                                <Users className="mx-auto h-8 w-8 mb-2"/>
                                <h3 className="font-bold">Comunidade Forte</h3>
                                <p className="text-sm text-accent-foreground/80">Faça parte de uma rede de profissionais que se ajuda e compartilha dicas valiosas.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <h2 className="font-headline text-3xl font-bold">Pronto para dar a partida?</h2>
                        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">O primeiro passo para sua nova carreira é encontrar o veículo certo. Explore as opções disponíveis em nossa plataforma.</p>
                         <Button asChild size="lg" className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/rentals">Buscar Veículos para Alugar</Link>
                        </Button>
                    </div>

                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
