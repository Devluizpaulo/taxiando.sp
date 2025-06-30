import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    question: "Como a plataforma funciona para motoristas?",
    answer: "É um ecossistema completo para o profissional do volante. O cadastro é gratuito e permite que você complete seu perfil, faça cursos de qualificação, encontre oportunidades de trabalho com frotas parceiras e acesse uma rede de serviços com desconto."
  },
  {
    question: "Preciso pagar para usar o Táxiando SP?",
    answer: "O cadastro e o acesso às funcionalidades principais são gratuitos. Oferecemos recursos premium, como a emissão de certificados de cursos, que podem ser adquiridos através da compra de créditos na plataforma."
  },
  {
    question: "Como as frotas entram em contato comigo?",
    answer: "Ao se candidatar a uma vaga de aluguel, a frota recebe seu perfil para análise. Se houver interesse, eles entrarão em contato diretamente com você pelo telefone ou e-mail cadastrado em seu perfil."
  },
  {
    question: "Meus dados estão seguros na plataforma?",
    answer: "Sim. Levamos a segurança e a privacidade dos seus dados muito a sério. Utilizamos as melhores práticas de segurança e seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD)."
  },
  {
    question: "Sou uma frota ou prestador de serviço. Como me cadastro?",
    answer: "Durante o processo de cadastro, você pode selecionar o tipo de perfil 'Frota' ou 'Prestador de Serviço'. Após a criação da conta, você terá acesso a um painel de controle exclusivo para gerenciar seus veículos, anúncios e encontrar profissionais qualificados."
  }
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Perguntas Frequentes (FAQ)</CardTitle>
              <CardDescription>
                Encontre aqui as respostas para as dúvidas mais comuns sobre nossa plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
