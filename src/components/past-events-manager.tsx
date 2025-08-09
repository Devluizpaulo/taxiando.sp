'use client';

import { useState, useEffect } from 'react';
import { getPastEvents, getEventsToDelete, autoDeleteOldEvents, deletePastEvents, getEventStats } from '@/app/actions/event-actions';
import { type Event } from '@/lib/types';
import { type Timestamp } from 'firebase-admin/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  History,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export function PastEventsManager() {
  const { toast } = useToast();
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [eventsToDelete, setEventsToDelete] = useState<Event[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    upcoming: number;
    past: number;
    toDelete: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoDeleting, setIsAutoDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pastEventsData, eventsToDeleteData, statsData] = await Promise.all([
        getPastEvents(30),
        getEventsToDelete(),
        getEventStats()
      ]);

      setPastEvents(pastEventsData);
      setEventsToDelete(eventsToDeleteData);
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos eventos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoDelete = async () => {
    setIsAutoDeleting(true);
    try {
      const result = await autoDeleteOldEvents();
      
      if (result.success) {
        toast({
          title: 'Eventos excluídos!',
          description: `${result.deletedCount} eventos antigos foram excluídos automaticamente.`,
        });
        await loadData(); // Recarregar dados
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir os eventos automaticamente.',
      });
    } finally {
      setIsAutoDeleting(false);
    }
  };

  const handleManualDelete = async (daysBack: number = 7) => {
    setIsAutoDeleting(true);
    try {
      const result = await deletePastEvents(daysBack);
      
      if (result.success) {
        toast({
          title: 'Eventos excluídos!',
          description: `${result.deletedCount} eventos passados foram excluídos.`,
        });
        await loadData(); // Recarregar dados
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir os eventos.',
      });
    } finally {
      setIsAutoDeleting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateInput: string | Timestamp) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput.toDate();
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysSinceEvent = (dateInput: string | Timestamp) => {
    const eventDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput.toDate();
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - eventDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Estatísticas dos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
                <div className="text-sm text-gray-600">Próximos</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.past}</div>
                <div className="text-sm text-gray-600">Passados</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.toDelete}</div>
                <div className="text-sm text-gray-600">Para Excluir</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Gerenciamento de Eventos Passados
          </CardTitle>
          <CardDescription>
            Eventos passados são automaticamente excluídos após 7 dias. Você pode forçar a exclusão manualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleAutoDelete}
              disabled={isAutoDeleting || eventsToDelete.length === 0}
              variant="destructive"
              size="sm"
            >
              {isAutoDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Antigos ({eventsToDelete.length})
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleManualDelete(7)}
              disabled={isAutoDeleting}
              variant="outline"
              size="sm"
            >
              Excluir +7 dias
            </Button>
            
            <Button
              onClick={() => handleManualDelete(30)}
              disabled={isAutoDeleting}
              variant="outline"
              size="sm"
            >
              Excluir +30 dias
            </Button>
            
            <Button
              onClick={loadData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>

          {eventsToDelete.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                {eventsToDelete.length} evento(s) com mais de 7 dias serão excluídos automaticamente.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eventos Passados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-500" />
            Eventos Passados (Últimos 30 dias)
          </CardTitle>
          <CardDescription>
            Lista de eventos que já aconteceram nos últimos 30 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-gray-600">Carregando eventos...</p>
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-600">Nenhum evento passado encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => {
                const daysSince = getDaysSinceEvent(event.startDate);
                const shouldDelete = daysSince > 7;
                
                return (
                  <div
                    key={event.id}
                    className={`p-4 border rounded-lg ${
                      shouldDelete ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Há {daysSince} dia(s)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {shouldDelete ? (
                          <Badge variant="destructive" className="text-xs">
                            Para Excluir
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Recente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eventos para Excluir */}
      {eventsToDelete.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Eventos para Exclusão Automática
            </CardTitle>
            <CardDescription>
              Estes eventos têm mais de 7 dias e serão excluídos automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventsToDelete.map((event) => {
                const daysSince = getDaysSinceEvent(event.startDate);
                
                return (
                  <div
                    key={event.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900">{event.title}</h4>
                        <p className="text-sm text-red-700">{event.location}</p>
                        <p className="text-xs text-red-600 mt-1">
                          {formatDate(event.startDate)} (Há {daysSince} dias)
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    