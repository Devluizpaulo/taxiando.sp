
import { getAllCourses } from '@/app/actions/course-actions';
import { CoursesClientPage } from './courses-client-page';
import { type Course } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Inbox } from 'lucide-react';

// Simulação de sugestões recebidas (substitua por fetch real se desejar)
const mockSuggestions = [
  { name: 'João Motorista', email: 'joao@email.com', message: 'Gostaria de um curso sobre direção econômica.' },
  { name: 'Maria Silva', email: 'maria@email.com', message: 'Sugiro um curso de atendimento ao cliente para motoristas.' },
];

export default async function AdminCoursesPage() {
    // Fetch data on the server
    const initialCourses: Course[] = await getAllCourses();
    
    return (
      <>
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-2">
            <Inbox className="h-6 w-6 text-amber-500" />
            <CardTitle>Sugestões de Cursos dos Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            {mockSuggestions.length === 0 ? (
              <div className="text-muted-foreground text-sm">Nenhuma sugestão recebida ainda.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {mockSuggestions.map((s, i) => (
                  <div key={i} className="border rounded-lg p-4 bg-amber-50/40">
                    <div className="font-semibold text-amber-900">{s.name} <span className="text-xs text-muted-foreground">({s.email})</span></div>
                    <div className="text-sm text-slate-700 mt-1">{s.message}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <CoursesClientPage initialCourses={initialCourses} />
      </>
    );
}
