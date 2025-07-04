
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
              <p>A Táxiando SP é uma plataforma de tecnologia que atua como intermediária, conectando motoristas, frotas e prestadores de serviço do setor de transporte. Oferecemos ferramentas de qualificação, um marketplace de oportunidades e classificados de serviços. Não somos empregadores, agência de empregos, locadora de veículos ou prestadores finais dos serviços anunciados.</p>
              
              <h2>3. Contas de Usuário</h2>
              <p>Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta ou senha. Você deve nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</p>

              <h2>4. Conduta do Usuário e Sistema de Avaliações</h2>
              <p>Você concorda em não usar a plataforma para:</p>
              <ul>
                <li>Publicar informações falsas, imprecisas ou enganosas.</li>
                <li>Violar quaisquer leis ou regulamentos locais, estaduais, nacionais ou internacionais.</li>
                <li>Assediar, abusar ou prejudicar outra pessoa.</li>
                <li>Coletar ou armazenar dados pessoais de outros usuários sem o consentimento deles.</li>
              </ul>
              <p>A plataforma inclui um sistema de avaliações para que os usuários possam compartilhar suas experiências. Essas avaliações são de responsabilidade exclusiva de quem as publica e não refletem necessariamente a opinião da Táxiando SP. Reservamo-nos o direito de moderar e remover avaliações que violem nossos termos.</p>

              <h2>5. Conteúdo Gerado pelo Usuário</h2>
              <p>Você é o único responsável pelo conteúdo que publica na plataforma, incluindo informações de perfil, anúncios de veículos e serviços. Ao publicar conteúdo, você nos concede uma licença mundial, não exclusiva, isenta de royalties para usar, reproduzir e exibir tal conteúdo em conexão com o serviço.</p>

              <h2>6. Limitação de Responsabilidade</h2>
              <p>A Táxiando SP atua como uma ponte, facilitando o contato entre as partes. Não nos responsabilizamos pela qualidade, segurança ou legalidade dos veículos, serviços ou conduta dos usuários. As negociações, contratos e interações são de responsabilidade exclusiva dos usuários envolvidos. As avaliações e informações fornecidas na plataforma servem como um guia, mas não constituem uma garantia de idoneidade ou qualidade. Recomendamos que todos os usuários tomem as devidas precauções antes de fechar qualquer negócio.</p>
              <p>Em máxima extensão permitida pela lei, a Táxiando SP não se responsabiliza por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar nossos serviços.</p>

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
