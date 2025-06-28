import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Termos de Serviço</CardTitle>
              <CardDescription>Última atualização: {new Date().toLocaleDateString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>Bem-vindo ao Táxiando SP. Ao acessar ou usar nossa plataforma, você concorda em cumprir e se vincular aos seguintes termos e condições de uso. Por favor, leia-os com atenção.</p>
              
              <h2>1. Aceitação dos Termos</h2>
              <p>Ao criar uma conta e usar os serviços fornecidos pela Táxiando SP, você concorda com estes Termos de Serviço e nossa Política de Privacidade. Se você não concorda com estes termos, não deve usar nossos serviços.</p>

              <h2>2. Descrição do Serviço</h2>
              <p>A Táxiando SP é uma plataforma que conecta motoristas, frotas e prestadores de serviço do setor de transporte. Oferecemos ferramentas de qualificação, um marketplace de oportunidades e classificados de serviços. Não somos empregadores, agência de empregos ou responsáveis pelas transações diretas entre os usuários.</p>
              
              <h2>3. Contas de Usuário</h2>
              <p>Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta ou senha. Você deve nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</p>

              <h2>4. Conduta do Usuário</h2>
              <p>Você concorda em não usar a plataforma para:</p>
              <ul>
                <li>Publicar informações falsas, imprecisas ou enganosas.</li>
                <li>Violar quaisquer leis ou regulamentos locais, estaduais, nacionais ou internacionais.</li>
                <li>Assediar, abusar ou prejudicar outra pessoa.</li>
                <li>Coletar ou armazenar dados pessoais de outros usuários sem o consentimento deles.</li>
              </ul>

              <h2>5. Conteúdo Gerado pelo Usuário</h2>
              <p>Você é o único responsável pelo conteúdo que publica na plataforma, incluindo informações de perfil, anúncios de veículos e serviços. Ao publicar conteúdo, você nos concede uma licença mundial, não exclusiva, isenta de royalties para usar, reproduzir e exibir tal conteúdo em conexão com o serviço.</p>

              <h2>6. Limitação de Responsabilidade</h2>
              <p>A Táxiando SP não se responsabiliza por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar nossos serviços, incluindo, mas não se limitando a, a conduta de outros usuários ou a qualidade dos serviços prestados por terceiros.</p>

              <h2>7. Modificações nos Termos</h2>
              <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Sua contínua utilização da plataforma após tais modificações constituirá seu reconhecimento e aceitação dos termos modificados.</p>

            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
