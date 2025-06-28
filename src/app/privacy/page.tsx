import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Política de Privacidade</CardTitle>
              <CardDescription>Última atualização: {new Date().toLocaleDateString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>Bem-vindo à Política de Privacidade da Táxiando SP. A sua privacidade é de extrema importância para nós. Esta política descreve como coletamos, usamos, armazenamos, compartilhamos e protegemos suas informações pessoais.</p>
              
              <h2>1. Informações que Coletamos</h2>
              <p>Podemos coletar e processar os seguintes dados sobre você:</p>
              <ul>
                <li><strong>Informações de Cadastro:</strong> Nome, e-mail, senha, número de telefone, tipo de perfil (motorista, frota, prestador).</li>
                <li><strong>Informações do Perfil Profissional:</strong> Dados da CNH, Condutax, alvará, qualificações, cursos, biografia, foto de perfil, dados do veículo, etc.</li>
                <li><strong>Informações de Uso:</strong> Dados sobre como você usa nossa plataforma, como cursos acessados, candidaturas enviadas e páginas visitadas.</li>
              </ul>

              <h2>2. Como Usamos Suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul>
                <li>Fornecer, operar e manter nossa plataforma.</li>
                <li>Melhorar, personalizar e expandir nossa plataforma.</li>
                <li>Entender e analisar como você usa nossos serviços.</li>
                <li>Desenvolver novos produtos, serviços, recursos e funcionalidades.</li>
                <li>Comunicar com você, diretamente ou através de um dos nossos parceiros, incluindo para atendimento ao cliente, para lhe fornecer atualizações e outras informações relativas à plataforma, e para fins de marketing e promocionais.</li>
                <li>Processar suas transações e gerenciar suas candidaturas.</li>
              </ul>

              <h2>3. Compartilhamento de Informações</h2>
              <p>Não vendemos suas informações pessoais. Podemos compartilhar suas informações nas seguintes situações:</p>
              <ul>
                  <li><strong>Com Frotas e Prestadores:</strong> Ao se candidatar a uma vaga ou contratar um serviço, seu perfil profissional será compartilhado com a empresa correspondente.</li>
                  <li><strong>Com Provedores de Serviço:</strong> Podemos compartilhar informações com empresas terceirizadas que nos auxiliam na operação da plataforma (ex: processamento de pagamentos, análise de dados).</li>
                  <li><strong>Por Obrigações Legais:</strong> Podemos divulgar suas informações se formos obrigados por lei ou em resposta a solicitações válidas por autoridades públicas.</li>
              </ul>
              
              <h2>4. Seus Direitos</h2>
              <p>Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de suas informações pessoais. Você pode gerenciar a maioria das suas informações diretamente no seu painel de controle ou entrando em contato conosco.</p>

              <h2>5. Alterações a Esta Política</h2>
              <p>Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações, publicando a nova Política de Privacidade nesta página. Recomendamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações.</p>
              
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
