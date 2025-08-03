
import { getAllCourses } from '@/app/actions/course-actions';
import { getCourseSuggestions } from '@/app/actions/course-suggestions-actions';
import { CoursesClientPage } from './courses-client-page';
import { type Course, type CourseSuggestion } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Inbox, CheckCircle, XCircle, Clock, BookOpen, Plus, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminCoursesPage() {
    // Fetch data on the server
    const initialCourses: Course[] = await getAllCourses();
    const suggestionsResult = await getCourseSuggestions();
    const suggestions: CourseSuggestion[] = suggestionsResult.success ? suggestionsResult.suggestions || [] : [];
    
    const getStatusIcon = (status: CourseSuggestion['status']) => {
      switch (status) {
        case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
        case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
        case 'implemented': return <BookOpen className="h-4 w-4 text-blue-500" />;
        default: return <Clock className="h-4 w-4 text-gray-500" />;
      }
    };

    const getStatusLabel = (status: CourseSuggestion['status']) => {
      switch (status) {
        case 'pending': return 'Pendente';
        case 'approved': return 'Aprovado';
        case 'rejected': return 'Rejeitado';
        case 'implemented': return 'Implementado';
        default: return 'Desconhecido';
      }
    };

    const getStatusBadgeVariant = (status: CourseSuggestion['status']) => {
      switch (status) {
        case 'pending': return 'secondary';
        case 'approved': return 'default';
        case 'rejected': return 'destructive';
        case 'implemented': return 'outline';
        default: return 'outline';
      }
    };
    
    return (
      <>
        {/* Header simplificado com apenas dois botões principais */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Cursos</h1>
            <p className="text-gray-600 mt-1">Crie e gerencie cursos para motoristas</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/courses/create-with-editor">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Curso
              </Button>
            </Link>
            <Link href="/admin/courses/advanced-editor">
              <Button variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                <Zap className="h-4 w-4 mr-2" />
                Editor Avançado
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-2">
            <Inbox className="h-6 w-6 text-amber-500" />
            <CardTitle>Sugestões de Cursos dos Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-muted-foreground text-sm">Nenhuma sugestão recebida ainda.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4 bg-amber-50/40">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-amber-900">
                          {suggestion.driverName} 
                          <span className="text-xs text-muted-foreground ml-2">({suggestion.driverEmail})</span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">{suggestion.suggestion}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Sugerido em: {suggestion.createdAt instanceof Date 
                            ? suggestion.createdAt.toLocaleDateString('pt-BR') 
                            : new Date(suggestion.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(suggestion.status)}
                        <Badge variant={getStatusBadgeVariant(suggestion.status)}>
                          {getStatusLabel(suggestion.status)}
                        </Badge>
                      </div>
                    </div>
                    {suggestion.adminNotes && (
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <div className="text-xs font-medium text-amber-800 mb-1">Notas do Admin:</div>
                        <div className="text-xs text-amber-700">{suggestion.adminNotes}</div>
                      </div>
                    )}
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
