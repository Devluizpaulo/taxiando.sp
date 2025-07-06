# Táxiando SP

**A plataforma completa para o profissional do volante em São Paulo.**

Táxiando SP é um ecossistema digital completo projetado para conectar, qualificar e fortalecer a comunidade de taxistas, frotas e prestadores de serviço da cidade de São Paulo. A plataforma oferece ferramentas para desenvolvimento profissional, oportunidades de negócio e um canal de comunicação centralizado para o setor.

---

## ✨ Funcionalidades Principais

### Para Motoristas (Drivers)
-   **Perfil Profissional Detalhado:** Crie um perfil com qualificações, documentos e experiência, com uma interface que se adapta se você é **proprietário ou locatário**.
-   **Catálogo de Cursos:** Acesse cursos especializados (Legislação, Atendimento, Direção Defensiva) com aulas em vídeo, texto, áudio e provas interativas.
-   **Biblioteca Digital:** Acesse uma biblioteca de livros e materiais em PDF com um leitor integrado que salva seu progresso.
-   **Busca de Oportunidades:** Encontre e candidate-se a veículos para aluguel de frotas verificadas e de outros taxistas autônomos.
-   **Agenda Cultural:** Fique por dentro dos principais eventos da cidade para planejar suas corridas.
-   **Marketplace de Serviços:** Encontre prestadores de serviço (oficinas, despachantes, etc.) com avaliações da comunidade.
-   **Guia "Como se Tornar um Taxista":** Um passo a passo completo para guiar novos profissionais.
-   **Assistente de IA:** Use a IA para resumir textos longos e regulamentações.

### Para Frotas (Fleets) e Prestadores (Providers)
-   **Painel de Gerenciamento:** Cadastre e gerencie seus veículos (frotas) ou serviços/produtos (prestadores).
-   **Gestão de Candidaturas (Frotas):** Receba e avalie perfis de motoristas interessados.
-   **Página de Perfil Pública:** Crie uma vitrine para sua empresa, destacando seus diferenciais para atrair clientes ou motoristas.

### Para Administradores (Admin)
-   **Dashboard Central:** Tenha uma visão geral da plataforma com estatísticas de usuários, vendas e atividades.
-   **Moderação de Conteúdo:** Aprove ou rejeite cadastros de usuários e anúncios de veículos/serviços com filtros avançados.
-   **Construtor de Cursos:** Crie e gerencie conteúdo educacional com suporte a **vídeo, texto, áudio e provas**, incluindo um modo de edição seguro para cursos publicados.
-   **Gerenciamento da Biblioteca:** Adicione e gerencie livros (PDFs) para a biblioteca digital dos usuários.
-   **Gerenciamento da Galeria de Mídia:** Centralize o upload e o gerenciamento de todas as imagens da plataforma.
-   **Gerenciamento de Marketing Avançado:**
    -   Crie e gerencie **cupons de desconto**.
    -   Envie **notificações e newsletters** para públicos segmentados.
    -   Gerencie **banners de parceiros/patrocinadores**.
-   **Gerenciamento de Ferramentas de Engajamento:**
    -   Crie e administre eventos na **agenda cultural**, com auxílio de IA para preenchimento de detalhes.
    -   Crie e gerencie **quizzes interativos** para a página inicial com assistente de IA.
-   **Configurações Globais da Plataforma:**
    -   Gerencie **gateways de pagamento** (Mercado Pago, Stripe).
    -   Crie e alterne entre **temas visuais** para customizar a aparência do site.

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
4.  Configure suas variáveis de ambiente. Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais.
    ```bash
    cp .env.example .env.local
    ```

### Rodando o Projeto
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o resultado.

---

## ⚠️ Solução de Problemas: Erro de "Credenciais não definidas"

Se você encontrar um erro dizendo `Firebase Admin SDK not initialized`, significa que a aplicação não encontrou as "chaves secretas" para se conectar ao seu banco de dados no servidor.

**Como Resolver:**

1.  **Encontre sua Chave de Serviço:**
    *   Vá para as **Configurações do Projeto** no seu console do Firebase.
    *   Acesse a aba **Contas de serviço**.
    *   Clique em **"Gerar nova chave privada"**. Isso fará o download de um arquivo JSON.

2.  **Configure a Variável de Ambiente:**
    *   No seu arquivo `.env.local`, encontre a linha `FIREBASE_SERVICE_ACCOUNT_JSON=''`.
    *   Copie o **conteúdo completo** do seu arquivo JSON e cole dentro das aspas simples.

Após configurar `FIREBASE_SERVICE_ACCOUNT_JSON` e as outras chaves do `.env.example`, o erro desaparecerá.

---

## 📂 Estrutura do Projeto (Simplificada)

```
.
├── src
│   ├── app                 # Rotas principais (App Router)
│   │   ├── (auth)          # Rotas de autenticação (login, register)
│   │   ├── (dashboard)     # Rotas protegidas (após login)
│   │   │   ├── admin       #   - Painel de Administração
│   │   │   │   ├── blog
│   │   │   │   ├── billing
│   │   │   │   ├── courses
│   │   │   │   ├── events
│   │   │   │   ├── gallery
│   │   │   │   ├── library
│   │   │   │   ├── marketing
│   │   │   │   ├── reviews
│   │   │   │   ├── settings
│   │   │   │   ├── support
│   │   │   │   └── users
│   │   │   ├── fleet       #   - Painel da Frota
│   │   │   ├── services    #   - Painel do Prestador
│   │   │   └── ...         #   - Painéis de Motorista
│   │   ├── actions         # Server Actions (lógica de backend)
│   │   └── api             # Rotas de API (webhooks)
│   ├── components          # Componentes React reutilizáveis
│   │   ├── ui              # Componentes de UI (ShadCN)
│   │   └── layout          # Componentes de layout (Header, Footer, etc)
│   ├── hooks               # Hooks customizados (useAuth, etc)
│   ├── lib                 # Funções utilitárias, schemas, config
│   └── ai                  # Lógica de IA com Genkit
│       └── flows           #   - Fluxos de IA
└── ...
```
