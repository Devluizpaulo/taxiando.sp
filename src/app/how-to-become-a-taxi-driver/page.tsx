
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, Book, FileText, Car, Award, Star } from "lucide-react";

const steps = [
    {
        icon: Check,
        title: "Passo 1: Verifique os Pré-Requisitos",
        description: "Antes de tudo, garanta que você atende aos requisitos básicos exigidos pela legislação.",
        details: [
            "Ter mais de 20 anos de idade.",
            "Possuir Carteira Nacional de Habilitação (CNH) na categoria B, C, D ou E.",
            "A CNH deve conter a observação 'Exerce Atividade Remunerada' (EAR).",
            "Não possuir antecedentes criminais graves."
        ]
    },
    {
        icon: Book,
        title: "Passo 2: Curso de Formação Específico",
        description: "É obrigatório realizar um curso de formação para condutores de táxi, com carga horária de 50 horas/aula.",
        details: [
            "O curso aborda temas como legislação de trânsito, relações humanas, primeiros socorros e mecânica básica.",
            "Procure por autoescolas (CFCs) credenciadas pelo Detran para oferecer o curso.",
            "Ao final, você receberá um certificado de conclusão, essencial para a próxima etapa."
        ]
    },
    {
        icon: FileText,
        title: "Passo 3: Obtenha o CONDUTAX",
        description: "O CONDUTAX é o Cadastro Municipal de Condutores de Táxi, o seu registro oficial como taxista na cidade de São Paulo.",
        details: [
            "Com o certificado do curso em mãos, você deve se dirigir ao DTP (Departamento de Transportes Públicos).",
            "Será necessário apresentar uma série de documentos, como CNH, comprovante de residência, certidões negativas, entre outros.",
            "Após a aprovação do cadastro, seu CONDUTAX será emitido."
        ]
    },
    {
        icon: Car,
        title: "Passo 4: Veículo e Alvará",
        description: "Com o CONDUTAX, você está habilitado a dirigir um táxi. Agora, você precisa de um veículo com Alvará de Estacionamento.",
        details: [
            "Você pode adquirir seu próprio veículo e solicitar um novo alvará (processo mais complexo e raro).",
            "A forma mais comum é alugar um veículo que já possui alvará de uma frota ou de um taxista autônomo.",
            "A plataforma Táxiando SP é o lugar ideal para encontrar as melhores frotas e oportunidades de aluguel."
        ]
    },
    {
        icon: Star,
        title: "Passo 5: Comece a Rodar!",
        description: "Parabéns! Com tudo em ordem, você está pronto para iniciar sua jornada como taxista em São Paulo.",
        details: [
            "Explore nossa plataforma para encontrar cursos de aperfeiçoamento.",
            "Fique de olho na Agenda Cultural para maximizar seus ganhos em grandes eventos.",
            "Participe da nossa comunidade e aproveite os benefícios dos nossos parceiros."
        ]
    }
];

export default function HowToBeTaxiDriverPage() {
    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Como se Tornar um Taxista em São Paulo</h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                            Um guia completo com o passo a passo para você iniciar sua carreira no volante e se tornar um profissional de sucesso na maior cidade do Brasil.
                        </p>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
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
                                                    <Award className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <h2 className="font-headline text-2xl font-bold">Pronto para começar?</h2>
                        <p className="text-muted-foreground mt-2">Encontre as melhores oportunidades de aluguel em nossa plataforma.</p>
                         <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                            <Link href="/rentals">Ver Oportunidades de Aluguel</Link>
                        </Button>
                    </div>

                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
