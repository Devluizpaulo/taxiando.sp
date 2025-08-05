'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { LoadingScreen } from '@/components/loading-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { CourseEditor } from '@/components/course/CourseEditor';
import { type CourseFormValues } from '@/lib/course-schemas';
import { getCourseById, updateCourse } from '@/app/actions/course-actions';

// Hook para carregar curso
function useCourseLoader(id: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        console.log(`[useCourseLoader] Carregando curso com ID: ${id}`);
        
        if (!id || id.trim() === '') {
          console.error('[useCourseLoader] ID do curso é inválido:', id);
          setError('ID do curso inválido');
          return;
        }
        
        const courseData = await getCourseById(id);
        if (courseData) {
          console.log(`[useCourseLoader] Curso carregado com sucesso:`, courseData);
          // Converter para CourseFormValues
          const formValues: CourseFormValues = {
            id: courseData.id,
            title: courseData.title,
            description: courseData.description || '',
            status: courseData.status || 'Draft',
            price: 0, // Campo não existe no tipo Course
            duration: courseData.totalDuration || 0, // Usar totalDuration do Course
            level: 'beginner', // Campo não existe no tipo Course
            category: courseData.category || '',
            tags: '', // Campo não existe no tipo Course
            certificate: 'none', // Campo não existe no tipo Course
            access: 'lifetime', // Campo não existe no tipo Course
            modules: [], // Simplificar - não converter módulos complexos por enquanto
            createdAt: courseData.createdAt ? (courseData.createdAt instanceof Date ? courseData.createdAt : new Date(courseData.createdAt.toString())) : undefined,
            updatedAt: courseData.updatedAt ? (courseData.updatedAt instanceof Date ? courseData.updatedAt : new Date(courseData.updatedAt.toString())) : undefined,
          };
          setCourse(formValues);
        } else {
          console.log(`[useCourseLoader] Curso não encontrado: ${id}`);
          setError('Curso não encontrado');
        }
      } catch (error) {
        console.error(`[useCourseLoader] Erro ao carregar curso:`, error);
        setError('Falha ao carregar curso');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourse();
  }, [id]);

  return { isLoading, course, error };
}

// Componente principal
export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLoading, course, error } = useCourseLoader(id);

  // Verificar se o usuário está autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">Você precisa estar logado para acessar esta página.</p>
            <div className="mt-4">
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <LoadingScreen />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
            <div className="mt-4">
              <Button 
                onClick={() => window.location.href = '/admin/courses'}
                variant="outline"
                className="w-full"
              >
                Voltar para Lista de Cursos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!course) return <div>Curso não encontrado</div>;

  // Função para salvar o curso
  const handleSave = async (data: CourseFormValues) => {
    try {
      await updateCourse(id, data, user.uid);
      toast({ title: 'Sucesso', description: 'Curso salvo com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      toast({ title: 'Erro', description: 'Falha ao salvar curso.' });
      throw error;
    }
  };

  return (
    <CourseEditor 
      course={course} 
      courseId={id} 
      onSave={handleSave}
    />
  );
}