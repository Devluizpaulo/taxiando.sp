# Táxiando SP

**A plataforma completa para o profissional do volante em São Paulo.**

Táxiando SP é um ecossistema digital completo projetado para conectar, qualificar e fortalecer a comunidade de taxistas, frotas e prestadores de serviço da cidade de São Paulo. A plataforma oferece ferramentas para desenvolvimento profissional, oportunidades de negócio e um canal de comunicação centralizado para o setor.

---

## ✨ Funcionalidades Principais

### Para Motoristas (Drivers)
-   **Perfil Profissional Detalhado:** Crie um perfil completo com suas qualificações, documentos e experiência para se destacar no mercado.
-   **Catálogo de Cursos:** Acesse cursos especializados (Legislação, Atendimento, Direção Defensiva) para aprimorar suas habilidades.
-   **Busca de Oportunidades:** Encontre e candidate-se a veículos para aluguel de frotas verificadas e de outros taxistas autônomos.
-   **Agenda Cultural:** Fique por dentro dos principais eventos da cidade para planejar suas corridas e maximizar seus ganhos.
-   **Marketplace de Serviços:** Encontre prestadores de serviço (oficinas, despachantes, etc.) com avaliações da comunidade.

### Para Frotas (Fleets)
-   **Painel de Gerenciamento:** Cadastre e gerencie sua frota de veículos, definindo preços, descrições e benefícios.
-   **Gestão de Candidaturas:** Receba e avalie perfis de motoristas interessados em alugar seus veículos.
-   **Perfil da Empresa:** Crie um perfil público para sua frota, destacando suas comodidades e diferenciais para atrair os melhores profissionais.

### Para Administradores (Admin)
-   **Dashboard Central:** Tenha uma visão geral da plataforma com estatísticas de usuários, vendas e atividades.
-   **Moderação de Conteúdo:** Aprove ou rejeite cadastros de usuários, anúncios de veículos e serviços para garantir a qualidade da plataforma.
-   **Construtor de Cursos:** Uma ferramenta poderosa para criar e gerenciar todo o conteúdo educacional, com suporte para aulas em vídeo, texto e quizzes interativos, além de controle de publicação.
-   **Gerenciamento de Blog e Notícias:** Crie, edite e publique artigos e notícias com um editor Markdown e um assistente de IA para geração de conteúdo, mantendo a comunidade informada.
-   **Gerenciador de Eventos:** Cadastre e administre eventos da agenda cultural, com auxílio de IA para preenchimento de detalhes e logística para motoristas.
-   **Gerenciamento de Marketing:** Crie cupons de desconto, envie notificações para públicos segmentados e gerencie banners de parceiros/patrocinadores com controle de ativação.
-   **Configurações de Pagamento:** Integre e gerencie as credenciais do gateway de pagamento (Mercado Pago) para a venda de pacotes de crédito.

---

## 🚀 Tecnologias Utilizadas

*   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [ShadCN/UI](https://ui.shadcn.com/)
*   **Backend & Banco de Dados:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
*   **Funcionalidades de IA:** [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
*   **Formulários:** [React Hook Form](https://react-hook-form.com/) com [Zod](https://zod.dev/) para validação.

---

## 🏁 Como Começar

### Pré-requisitos
-   Node.js (versão 20 ou superior)
-   Um projeto Firebase configurado.

### Instalação
1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/taxiando-sp.git
    ```
2.  Navegue até o diretório do projeto:
    ```bash
    cd taxiando-sp
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Configure suas variáveis de ambiente do Firebase em um arquivo `.env.local`.

### Rodando o Projeto
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o resultado.

---

## 📂 Estrutura do Projeto

Uma visão geral da organização das pastas e arquivos principais:

```
.
├── src
│   ├── app                 # Rotas principais (App Router)
│   │   ├── (auth)          # Rotas públicas (login, register)
│   │   ├── (dashboard)     # Rotas protegidas (autenticação)
│   │   │   ├── admin       #   - Painel de Administração
│   │   │   │   ├── blog
│   │   │   │   ├── billing
│   │   │   │   ├── courses
│   │   │   │   ├── events
│   │   │   │   └── marketing
│   │   │   └── ...         #   - Painéis de usuário (motorista, frota)
│   │   ├── actions         # Server Actions
│   │   └── api             # Rotas de API (ex: webhooks)
│   ├── components          # Componentes React reutilizáveis
│   │   ├── ui              # Componentes de UI (ShadCN)
│   │   └── layout          # Componentes de layout (Header, Footer, etc)
│   ├── hooks               # Hooks customizados (ex: useAuth)
│   ├── lib                 # Funções utilitárias, schemas, config
│   └── ai                  # Lógica de IA com Genkit
│       └── flows           #   - Fluxos de IA
└── ...
```
