# Sistema de Limpeza Automática de Eventos

## 📋 Visão Geral

Este sistema gerencia automaticamente eventos passados, excluindo-os após 7 dias da data do evento para manter o banco de dados limpo e organizado.

## 🚀 Funcionalidades

### ✅ Implementadas

1. **Listagem de Eventos Passados**
   - Visualização dos últimos 30 dias de eventos
   - Diferenciação visual entre eventos recentes e antigos
   - Contador de dias desde o evento

2. **Exclusão Automática**
   - Eventos com mais de 7 dias são marcados para exclusão
   - Função `autoDeleteOldEvents()` para limpeza automática
   - Exclusão em lote usando Firebase Batch

3. **Gerenciamento Manual**
   - Interface administrativa para visualizar eventos passados
   - Botões para exclusão manual (7 dias, 30 dias)
   - Estatísticas em tempo real

4. **API para Cron Jobs**
   - Endpoint `/api/cron/cleanup-events` para automação
   - Suporte a autenticação via token
   - Logs detalhados de execução

5. **Estatísticas**
   - Total de eventos
   - Eventos próximos
   - Eventos passados
   - Eventos para exclusão

## 🛠️ Como Usar

### 1. Acessar a Interface Administrativa

```
/admin/events/past
```

### 2. Visualizar Estatísticas

A página mostra:
- **Total**: Todos os eventos no sistema
- **Próximos**: Eventos futuros
- **Passados**: Eventos dos últimos 30 dias
- **Para Excluir**: Eventos com mais de 7 dias

### 3. Exclusão Manual

- **Excluir Antigos**: Remove eventos com mais de 7 dias
- **Excluir +7 dias**: Remove eventos com mais de 7 dias
- **Excluir +30 dias**: Remove eventos com mais de 30 dias

### 4. Configurar Cron Job

#### Opção 1: Usando Vercel Cron (Recomendado)

Adicione ao `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-events",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### Opção 2: Usando Serviços Externos

Configure um cron job para chamar:
```
POST https://seu-dominio.com/api/cron/cleanup-events
Authorization: Bearer SEU_TOKEN_SECRET
```

### 5. Configurar Variável de Ambiente

Adicione ao `.env.local`:

```env
CRON_SECRET_TOKEN=seu_token_secreto_aqui
```

## 📊 Estrutura de Dados

### Event Interface
```typescript
interface Event {
  id: string;
  title: string;
  location: string;
  description: string;
  driverSummary: string;
  peakTimes: string;
  trafficTips: string;
  pickupPoints: string;
  mapUrl: string;
  startDate: Timestamp | string;
  createdAt: Timestamp | string;
}
```

## 🔧 Funções Principais

### `getPastEvents(daysBack: number = 30)`
Busca eventos passados dos últimos N dias.

### `getEventsToDelete()`
Busca eventos que devem ser excluídos (mais de 7 dias).

### `autoDeleteOldEvents()`
Executa a exclusão automática de eventos antigos.

### `deletePastEvents(daysBack: number = 7)`
Exclusão manual de eventos passados.

### `getEventStats()`
Retorna estatísticas dos eventos.

## 🧪 Testando o Sistema

### 1. Criar Eventos de Exemplo

```typescript
import { createSampleEvents } from '@/app/actions/admin-actions';

// Executar uma vez para criar dados de teste
await createSampleEvents();
```

### 2. Testar API de Limpeza

```bash
# Teste manual
curl -X GET https://seu-dominio.com/api/cron/cleanup-events

# Teste com autenticação
curl -X POST https://seu-dominio.com/api/cron/cleanup-events \
  -H "Authorization: Bearer SEU_TOKEN_SECRET"
```

### 3. Verificar Logs

Os logs são exibidos no console do servidor:
```
Cron job: Auto-deleted 3 old events
```

## 📁 Arquivos Principais

- `src/app/actions/event-actions.ts` - Ações do servidor
- `src/components/past-events-manager.tsx` - Componente de interface
- `src/app/(dashboard)/admin/events/past/page.tsx` - Página administrativa
- `src/app/api/cron/cleanup-events/route.ts` - API para cron jobs
- `src/app/actions/admin-actions.ts` - Função para criar dados de exemplo

## 🔒 Segurança

- API protegida por token de autenticação
- Validação de entrada
- Logs de auditoria
- Tratamento de erros robusto

## 📈 Monitoramento

### Métricas Disponíveis
- Número de eventos excluídos
- Frequência de execução
- Tempo de processamento
- Erros de execução

### Logs Importantes
- Sucesso na exclusão
- Falhas na operação
- Tentativas de acesso não autorizado

## 🚨 Troubleshooting

### Problema: Eventos não são excluídos
**Solução**: Verificar se a data `startDate` está correta no formato Timestamp.

### Problema: Cron job não executa
**Solução**: Verificar configuração do Vercel ou serviço de cron.

### Problema: Erro de autenticação
**Solução**: Verificar se `CRON_SECRET_TOKEN` está configurado corretamente.

## 🔄 Próximas Melhorias

1. **Notificações**: Alertas quando eventos são excluídos
2. **Backup**: Backup automático antes da exclusão
3. **Configuração**: Interface para ajustar período de retenção
4. **Relatórios**: Relatórios detalhados de limpeza
5. **Webhooks**: Notificações para sistemas externos

---

**Desenvolvido para o Portal Taxiandosp** 🚕 