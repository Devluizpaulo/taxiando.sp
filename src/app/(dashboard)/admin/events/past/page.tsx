import { PastEventsManager } from '@/components/past-events-manager';

export default function PastEventsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Eventos Passados</h1>
          <p className="text-gray-600 mt-2">
            Visualize e gerencie eventos que já aconteceram. Eventos com mais de 7 dias são automaticamente excluídos.
          </p>
        </div>
      </div>
      
      <PastEventsManager />
    </div>
  );
} 