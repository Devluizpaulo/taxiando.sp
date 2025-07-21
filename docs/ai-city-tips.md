# IA para Geração de Dicas da Cidade

## Visão Geral

O sistema de IA para geração de dicas da cidade permite que administradores criem conteúdo de qualidade de forma rápida e eficiente, utilizando o modelo Gemini 2.0 Flash da Google AI.

## Como Usar

### 1. Acesse o Painel Admin
- Navegue para `/admin/city-guide`
- Clique em "Criar Nova Dica"

### 2. Use o Assistente de IA
- Na coluna esquerda, você verá o "Assistente de IA"
- Digite um prompt descritivo no campo de texto
- Selecione o público-alvo (Motorista ou Cliente)
- Clique em "Gerar Conteúdo IA"

### 3. Exemplos de Prompts Efetivos

#### Para Motoristas:
```
- "ponto de táxi movimentado na Avenida Paulista"
- "estacionamento gratuito no centro de São Paulo"
- "restaurante popular para almoço em Pinheiros"
- "shopping center com movimento intenso aos finais de semana"
- "hospital com entrada para táxis"
```

#### Para Clientes:
```
- "restaurante japonês autêntico em Liberdade"
- "café com vista para o parque Ibirapuera"
- "loja de roupas vintage na Vila Madalena"
- "teatro com programação cultural diversificada"
- "padaria tradicional no bairro da Mooca"
```

### 4. Revisão e Ajustes
- A IA preencherá automaticamente os campos do formulário
- Revise o conteúdo gerado
- Faça ajustes conforme necessário
- Adicione URLs de imagens e mapa se disponíveis
- Salve a dica

## Funcionalidades da IA

### Geração Inteligente
- **Títulos atrativos**: Cria títulos descritivos e envolventes
- **Descrições detalhadas**: Fornece informações práticas e úteis
- **Categorização automática**: Sugere a categoria mais apropriada
- **Localização específica**: Identifica bairros e áreas relevantes
- **Faixa de preço**: Para dicas de clientes, sugere preços quando relevante

### Contexto Específico
- **Para Motoristas**: Foca em informações práticas de trabalho
- **Para Clientes**: Foca em experiências e qualidade de vida

## Estrutura Técnica

### Arquivos Principais
- `src/ai/flows/generate-city-tip-flow.ts` - Fluxo de IA
- `src/app/actions/city-guide-actions.ts` - Integração com o sistema
- `src/app/(dashboard)/admin/city-guide/tip-form.tsx` - Interface do usuário

### Modelo de IA
- **Provedor**: Google AI (Gemini 2.0 Flash)
- **Framework**: Genkit
- **Idioma**: Português Brasileiro
- **Contexto**: Especializado em São Paulo

## Boas Práticas

### Prompts Efetivos
1. **Seja específico**: Mencione bairros, ruas ou pontos de referência
2. **Defina o contexto**: Especifique se é para motoristas ou clientes
3. **Inclua detalhes**: Mencione horários, características especiais
4. **Use exemplos**: Baseie-se em locais reais de São Paulo

### Revisão de Conteúdo
1. **Verifique a precisão**: Confirme informações sobre horários e localizações
2. **Ajuste o tom**: Personalize para o público-alvo
3. **Adicione contexto**: Complemente com informações específicas
4. **Valide URLs**: Teste links de mapas e imagens

## Limitações

- A IA pode não conhecer informações muito recentes
- Locais muito específicos podem precisar de verificação manual
- URLs de mapas precisam ser adicionadas manualmente
- Imagens não são geradas automaticamente

## Suporte

Para dúvidas sobre o uso da IA ou problemas técnicos, entre em contato com a equipe de desenvolvimento. 