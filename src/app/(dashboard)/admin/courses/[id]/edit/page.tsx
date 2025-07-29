'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useFieldArray, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { use } from 'react';
import { debounce } from 'lodash';

import { type Course } from '@/lib/types';
import { getCourseById, updateCourse, updateCourseStatus, deleteCourse } from '@/app/actions/course-actions';
import { courseFormSchema, type CourseFormValues } from '@/lib/course-schemas';
import { LoadingScreen } from '@/components/loading-screen';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, PlusCircle, Trash2, Save, LogOut, UploadCloud, Eye, Copy, 
  FileText, Video, ClipboardCheck, Mic, GripVertical, Paperclip, 
  DollarSign, Copyright, Gavel, CreditCard, BarChart, Trophy, BrainCircuit,
  Settings, History, Download, Upload, RefreshCw, Clock, Users, Star,
  Edit3, Maximize2, Minimize2, RotateCcw, RotateCw, Palette, Type,
  Image as ImageIcon, Link2, Code, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, List, ListOrdered, Quote, Heading1, Heading2,
  Heading3, Table, Zap, Sparkles, ChevronDown, ChevronUp, Move3D,
  AlertCircle, Check
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentBlocksEditor } from '@/components/course/ContentBlocksEditor';
import { Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { CoverImageGalleryModal } from '@/components/ui/CoverImageGalleryModal';

// Tipos e constantes
// Removido tipos locais - usar tipos do schema
export const validPageTypes = ["text", "video", "audio", "pdf", "gallery", "exercise", "quiz", "mixed"] as const;
export const validLessonTypes = ["single", "multi_page"] as const;

// Interface para operações CRUD
interface CourseOperations {
  create: (data: Partial<CourseFormValues>) => Promise<void>;
  read: (id: string) => Promise<CourseFormValues | null>;
  update: (id: string, data: Partial<CourseFormValues>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  export: (id: string) => Promise<void>;
  import: (file: File) => Promise<void>;
}

// Função utilitária para converter Course em CourseFormValues
function courseToFormValues(course: Course): CourseFormValues {
  try {
    console.log(`[courseToFormValues] Convertendo curso:`, course);
    
    if (!course) {
      console.error('[courseToFormValues] Curso é null ou undefined');
      throw new Error('Curso é null ou undefined');
    }

    // Função helper para garantir que algo seja um array
    const ensureArray = (value: any, name: string): any[] => {
      console.log(`[courseToFormValues] Verificando ${name}:`, typeof value, value);
      
      if (value === null || value === undefined) {
        console.log(`[courseToFormValues] ${name} é null/undefined, retornando array vazio`);
        return [];
      }
      
      if (Array.isArray(value)) {
        console.log(`[courseToFormValues] ${name} é um array válido com ${value.length} itens`);
        return value;
      }
      
      if (typeof value === 'object') {
        console.log(`[courseToFormValues] ${name} é um objeto, convertendo para array vazio`);
        return [];
      }
      
      console.log(`[courseToFormValues] ${name} é um tipo primitivo, retornando array vazio`);
      return [];
    };

    // Verificação robusta dos módulos
    const modules = ensureArray(course.modules, 'course.modules');
    console.log(`[courseToFormValues] Modules processados:`, modules);

    const formValues = {
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      modules: modules.map((m) => {
        // Verificação robusta das lessons
        const lessons = ensureArray(m.lessons, `module ${m.title}.lessons`);
        
        return {
          id: m.id || '',
          title: m.title || '',
          badge: m.badge || null,
          lessons: lessons.map((l: any) => ({
            id: l.id || '',
            title: l.title || '',
            summary: l.summary || '',
            pages: ensureArray(l.pages, `lesson ${l.title}.pages`).map((p: any) => ({
              id: p.id || '',
              title: p.title || '',
              type: p.type || 'text',
              order: p.order || 0,
              duration: p.duration || 1,
              contentBlocks: ensureArray(p.contentBlocks, `page ${p.title}.contentBlocks`),
              videoUrl: p.videoUrl || '',
              audioUrl: p.audioUrl || '',
              pdfUrl: p.pdfUrl || '',
              galleryImages: ensureArray(p.galleryImages, `page ${p.title}.galleryImages`),
              questions: ensureArray(p.questions, `page ${p.title}.questions`),
              exercise: p.exercise || undefined,
              summary: p.summary || '',
              observations: p.observations || '',
              isCompleted: p.isCompleted || false,
              feedback: p.feedback || {
                thumbsUp: 0,
                thumbsDown: 0,
                comments: []
              }
            })),
            type: l.type || 'single',
            totalDuration: l.totalDuration || l.duration || 1,
            content: l.content || '',
            contentBlocks: ensureArray(l.contentBlocks, `lesson ${l.title}.contentBlocks`),
            audioFile: l.audioFile,
            materials: ensureArray(l.materials, `lesson ${l.title}.materials`),
            questions: ensureArray(l.questions, `lesson ${l.title}.questions`),
            passingScore: l.passingScore || 70,
            observations: l.observations || '',
            order: l.order || 0,
            isCompleted: l.isCompleted || false,
            feedback: l.feedback || {
              thumbsUp: 0,
              thumbsDown: 0,
              comments: []
            },
            settings: l.settings || {
              allowPageNavigation: true,
              requireSequentialProgress: false,
              showProgressBar: true,
              autoAdvance: false
            }
          })),
        };
      }),
      difficulty: course.difficulty || 'Iniciante',
      investmentCost: course.investmentCost || 0,
      priceInCredits: course.priceInCredits || 0,
      authorInfo: course.authorInfo || '',
      legalNotice: course.legalNotice || '',
      coverImageUrl: course.coverImageUrl || '',
      
      // Novos campos obrigatórios
      targetAudience: course.targetAudience || '',
      estimatedDuration: course.estimatedDuration || 1,
      isPublicListing: course.isPublicListing || false,
      
      // Tipo de contrato
      contractType: course.contractType || 'own_content',
      saleValue: course.saleValue || 0,
      
      // Controle financeiro
      courseType: course.courseType || 'own_course',
      partnerName: course.partnerName || '',
      paymentType: course.paymentType || 'fixed',
      contractStatus: course.contractStatus || 'negotiating',
      contractPdfUrl: course.contractPdfUrl || '',
      
      // SEO e tags
      seoTags: course.seoTags || [],
      
      // Configurações de avaliação
      enableComments: course.enableComments !== undefined ? course.enableComments : true,
      autoCertification: course.autoCertification !== undefined ? course.autoCertification : true,
      minimumPassingScore: course.minimumPassingScore || 70,
    };

    console.log(`[courseToFormValues] Form values gerados:`, formValues);
    return formValues;
  } catch (error) {
    console.error(`[courseToFormValues] Erro ao converter curso:`, error);
    console.error(`[courseToFormValues] Stack trace:`, (error as Error).stack);
    throw error;
  }
}

// Hook personalizado para operações CRUD
function useCourseOperations(courseId: string, userId: string): CourseOperations {
  const { toast } = useToast();
  const router = useRouter();

  return useMemo(() => ({
    create: async (data) => {
      try {
        toast({ title: 'Sucesso', description: 'Curso criado com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao criar curso.' });
      }
    },
    read: async (id) => {
      try {
        console.log(`[useCourseOperations.read] Buscando curso: ${id}`);
        const course = await getCourseById(id);
        
        if (course) {
          console.log(`[useCourseOperations.read] Curso encontrado:`, course);
          const formValues = courseToFormValues(course);
          console.log(`[useCourseOperations.read] Form values:`, formValues);
          return formValues;
        } else {
          console.log(`[useCourseOperations.read] Curso não encontrado: ${id}`);
          return null;
        }
      } catch (error) {
        console.error(`[useCourseOperations.read] Erro ao carregar curso:`, error);
        toast({ 
          title: 'Erro', 
          description: 'Falha ao carregar curso. Verifique o console para mais detalhes.' 
        });
        throw error; // Re-throw para que o componente possa capturar
      }
    },
    update: async (id, data) => {
      try {
        const result = await updateCourse(id, data as CourseFormValues, userId);
        if (result.success) {
          toast({ title: 'Sucesso', description: 'Curso atualizado com sucesso!' });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao atualizar curso.' });
      }
    },
    delete: async (id) => {
      try {
        const result = await deleteCourse(id);
        if (result.success) {
          toast({ title: 'Sucesso', description: 'Curso excluído com sucesso!' });
          router.push('/admin/courses');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao excluir curso.' });
      }
    },
    duplicate: async (id) => {
      try {
        const course = await getCourseById(id);
        if (course) {
          const duplicatedCourse = {
            ...courseToFormValues(course),
            title: `${course.title} (Cópia)`,
            status: 'Draft',
          };
          toast({ title: 'Sucesso', description: 'Curso duplicado com sucesso!' });
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao duplicar curso.' });
      }
    },
    export: async (id) => {
      try {
        const course = await getCourseById(id);
        if (course) {
          const dataStr = JSON.stringify(courseToFormValues(course), null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `curso-${course.title.replace(/\s+/g, '-').toLowerCase()}.json`;
          link.click();
          URL.revokeObjectURL(url);
          toast({ title: 'Sucesso', description: 'Curso exportado com sucesso!' });
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao exportar curso.' });
      }
    },
    import: async (file) => {
      try {
        const text = await file.text();
        const courseData = JSON.parse(text);
        toast({ title: 'Sucesso', description: 'Curso importado com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao importar curso.' });
      }
    }
  }), [courseId, userId, toast, router]);
}

// Hook para auto-save otimizado
function useAutoSave(form: UseFormReturn<CourseFormValues>, courseId: string, operations: CourseOperations) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const debouncedSave = useCallback(
    debounce(async (data: CourseFormValues) => {
      try {
        await operations.update(courseId, data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    [courseId, operations]
  );

  useEffect(() => {
    const subscription = form.watch((data) => {
      setHasUnsavedChanges(true);
      debouncedSave(data as CourseFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedSave]);

  return { lastSaved, hasUnsavedChanges };
}

// Componente principal
export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const operations = useCourseOperations(id, user?.uid || '');

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

  useEffect(() => {
    const loadCourse = async () => {
      try {
        console.log(`[EditCoursePage] Carregando curso com ID: ${id}`);
        console.log(`[EditCoursePage] Usuário:`, user);
        console.log(`[EditCoursePage] Operations:`, operations);
        
        if (!id || id.trim() === '') {
          console.error('[EditCoursePage] ID do curso é inválido:', id);
          setError('ID do curso inválido');
          return;
        }
        
        const courseData = await operations.read(id);
        if (courseData) {
          console.log(`[EditCoursePage] Curso carregado com sucesso:`, courseData);
          setCourse(courseData);
        } else {
          console.log(`[EditCoursePage] Curso não encontrado: ${id}`);
          setError('Curso não encontrado');
        }
      } catch (error) {
        console.error(`[EditCoursePage] Erro ao carregar curso:`, error);
        setError('Falha ao carregar curso');
      } finally {
        setIsLoading(false);
      }
    };
    loadCourse();
  }, [id, operations, user]);

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

  return (
    <EnhancedCourseEditor 
      course={course} 
      courseId={id} 
      operations={operations}
    />
  );
}

// Componente do editor aprimorado
function EnhancedCourseEditor({ 
  course, 
  courseId, 
  operations 
}: { 
  course: CourseFormValues;
  courseId: string;
  operations: CourseOperations;
}) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course,
  });

  const { lastSaved, hasUnsavedChanges } = useAutoSave(form, courseId, operations);
  const [activeTab, setActiveTab] = useState('geral');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Operações do formulário
  const handleSave = async (action: 'continue' | 'exit' | 'publish') => {
    setIsSaving(true);
    try {
      const values = form.getValues();
      await operations.update(courseId, values);
      
      if (action === 'publish') {
        await updateCourseStatus(courseId, 'Published');
        toast({ title: 'Sucesso', description: 'Curso publicado com sucesso!' });
      } else if (action === 'exit') {
        window.location.href = '/admin/courses';
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar curso.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await operations.delete(courseId);
  };

  const handleDuplicate = async () => {
    await operations.duplicate(courseId);
  };

  const handleExport = async () => {
    await operations.export(courseId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header aprimorado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor de Curso</h1>
            <p className="text-gray-600 mt-1">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Alterações não salvas
                </span>
              ) : lastSaved ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </p>
          </div>
          
          {/* Barra de ferramentas */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreviewMode ? 'Editar' : 'Visualizar'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4" />
              Duplicar
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O curso será permanentemente excluído.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Indicador de progresso */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Curso</span>
            <span className="text-sm text-gray-500">75% completo</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
      </div>

      {/* Formulário principal */}
      <Form {...form}>
        <form className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="geral" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="conteudo" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avançado
              </TabsTrigger>
            </TabsList>

            {/* Aba Geral */}
            <TabsContent value="geral" className="space-y-6">
              <GeneralTab form={form} />
            </TabsContent>

            {/* Aba Conteúdo */}
            <TabsContent value="conteudo" className="space-y-6">
              <ContentTab form={form} />
            </TabsContent>

            {/* Aba Financeiro */}
            <TabsContent value="financeiro" className="space-y-6">
              <FinancialTab form={form} />
            </TabsContent>

            {/* Aba Configurações Avançadas */}
            <TabsContent value="configuracoes" className="space-y-6">
              <AdvancedTab form={form} />
            </TabsContent>
          </Tabs>

          {/* Botões de ação fixos */}
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 border">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave('continue')}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
              
              <Button
                type="button"
                onClick={() => handleSave('exit')}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Salvar e Sair
              </Button>
              
              <Button
                type="button"
                onClick={() => handleSave('publish')}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                Publicar
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Componentes das abas
function GeneralTab({ form }: { form: UseFormReturn<CourseFormValues> }) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Informações Gerais
        </CardTitle>
        <CardDescription>
          Configure as informações básicas do seu curso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Título do Curso</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Digite o título do curso..."
                  className="text-lg"
                />
              </FormControl>
              <FormDescription>
                Um título claro e atrativo para o seu curso
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Descreva o que os alunos aprenderão..."
                  rows={4}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                Uma descrição detalhada do conteúdo e objetivos do curso
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria e Dificuldade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="condução">Condução</SelectItem>
                    <SelectItem value="legislação">Legislação</SelectItem>
                    <SelectItem value="segurança">Segurança</SelectItem>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Dificuldade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Iniciante">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Iniciante
                      </div>
                    </SelectItem>
                    <SelectItem value="Intermediário">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        Intermediário
                      </div>
                    </SelectItem>
                    <SelectItem value="Avançado">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Avançado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Imagem de Capa */}
        <CoverImageSection form={form} />
      </CardContent>
    </Card>
  );
}

function ContentTab({ form }: { form: UseFormReturn<CourseFormValues> }) {
  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
    control: form.control,
    name: 'modules',
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estrutura do Curso
          </CardTitle>
          <CardDescription>
            Organize o conteúdo em módulos e aulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleFields.map((module, index) => (
              <EnhancedModuleEditor
                key={module.id}
                moduleIndex={index}
                form={form}
                onRemove={() => removeModule(index)}
              />
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendModule({
                id: nanoid(),
                title: '',
                lessons: [],
                badge: undefined,
              })}
              className="w-full border-dashed border-2 h-16 text-lg"
            >
              <PlusCircle className="h-6 w-6 mr-2" />
              Adicionar Módulo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialTab({ form }: { form: UseFormReturn<CourseFormValues> }) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Informações Financeiras e Legais
        </CardTitle>
        <CardDescription>
          Configure preços, custos e informações legais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priceInCredits"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Preço em Créditos
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="0" />
                </FormControl>
                <FormDescription>
                  Deixe 0 para curso gratuito
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="investmentCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Custo de Investimento (R$)
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="0.00" />
                </FormControl>
                <FormDescription>
                  Valor investido na produção
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Informações Legais */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="authorInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Copyright className="h-4 w-4" />
                  Informações de Direitos Autorais
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="© 2024 Nome do Autor" />
                </FormControl>
                <FormDescription>
                  Informações sobre propriedade intelectual
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legalNotice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Aviso Legal
                </FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Aviso sobre reprodução e uso do conteúdo..."
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  Termos de uso e restrições
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AdvancedTab({ form }: { form: UseFormReturn<CourseFormValues> }) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>
            Recursos avançados e configurações especiais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações de Acesso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Controle de Acesso</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-approval">Requer Aprovação</Label>
                <p className="text-sm text-gray-500">Alunos precisam de aprovação para acessar</p>
              </div>
              <Switch id="require-approval" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="time-limit">Limite de Tempo</Label>
                <p className="text-sm text-gray-500">Definir prazo para conclusão</p>
              </div>
              <Switch id="time-limit" />
            </div>
          </div>

          <Separator />

          {/* Gamificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Gamificação</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-badges">Habilitar Badges</Label>
                <p className="text-sm text-gray-500">Recompensas por conclusão de módulos</p>
              </div>
              <Switch id="enable-badges" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-leaderboard">Ranking</Label>
                <p className="text-sm text-gray-500">Classificação entre alunos</p>
              </div>
              <Switch id="enable-leaderboard" />
            </div>
          </div>

          <Separator />

          {/* Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analytics</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="track-progress">Rastrear Progresso</Label>
                <p className="text-sm text-gray-500">Acompanhar evolução detalhada</p>
              </div>
              <Switch id="track-progress" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="generate-reports">Relatórios Automáticos</Label>
                <p className="text-sm text-gray-500">Gerar relatórios de desempenho</p>
              </div>
              <Switch id="generate-reports" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para edição de módulos aprimorado
function EnhancedModuleEditor({ 
  moduleIndex, 
  form, 
  onRemove 
}: { 
  moduleIndex: number;
  form: UseFormReturn<CourseFormValues>;
  onRemove: () => void;
}) {
  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control: form.control,
    name: `modules.${moduleIndex}.lessons`,
  });

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.title`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={`Módulo ${moduleIndex + 1}`}
                      className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {lessonFields.length} aula{lessonFields.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Aulas do módulo */}
        <div className="space-y-3">
          {lessonFields.map((lesson, lessonIndex) => (
            <EnhancedLessonEditor
              key={lesson.id}
              moduleIndex={moduleIndex}
              lessonIndex={lessonIndex}
              form={form}
              onRemove={() => removeLesson(lessonIndex)}
            />
          ))}
        </div>
        
        {/* Botão para adicionar aula */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendLesson({
            id: nanoid(),
            title: '',
            summary: '',
            type: 'single', // Corrigido aqui!
            totalDuration: 10,
            pages: [{
              id: nanoid(),
              type: 'text',
              title: 'Página 1',
              order: 0,
              contentBlocks: [{
                type: 'paragraph',
                text: ''
              }],
              summary: '',
              observations: '',
            }],
            questions: [],
            materials: [],
            observations: '',
          })}
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Aula
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente para edição de aulas aprimorado
function EnhancedLessonEditor({ 
  moduleIndex, 
  lessonIndex, 
  form, 
  onRemove 
}: { 
  moduleIndex: number;
  lessonIndex: number;
  form: UseFormReturn<CourseFormValues>;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const lessonTypeIcons = {
    single: <FileText className="h-4 w-4" />,
    multi_page: <Move3D className="h-4 w-4" />,
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={`Aula ${lessonIndex + 1}`}
                      className="font-medium text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validLessonTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {lessonTypeIcons[type]}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Tabs para diferentes seções */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="pages" className="flex items-center gap-2">
                <Move3D className="h-4 w-4" />
                Páginas
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Materiais
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Resumo da aula */}
              <FormField
                control={form.control}
                name={`modules.${moduleIndex}.lessons.${lessonIndex}.summary`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo da Aula</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva brevemente o que será abordado nesta aula..."
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Um resumo curto que aparecerá na lista de aulas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações importantes */}
              <FormField
                control={form.control}
                name={`modules.${moduleIndex}.lessons.${lessonIndex}.observations`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Importantes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Dicas práticas, avisos importantes, ou observações didáticas..."
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Informações importantes que aparecerão destacadas para o aluno.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duração estimada */}
              <FormField
                control={form.control}
                name={`modules.${moduleIndex}.lessons.${lessonIndex}.totalDuration`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Estimada (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="1"
                        placeholder="15"
                        className="w-32"
                      />
                    </FormControl>
                    <FormDescription>
                      Tempo estimado para completar esta aula.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="pages" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Páginas da Aula</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentPages = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.pages`) || [];
                      const newPage = {
                        id: nanoid(),
                        title: `Página ${currentPages.length + 1}`,
                        type: 'text' as const,
                        order: currentPages.length,
                        contentBlocks: [],
                        summary: '',
                        observations: '',
                      };
                      form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.pages`, [...currentPages, newPage]);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Página
                  </Button>
                </div>

                {/* Lista de páginas */}
                <div className="space-y-3">
                  {form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.pages`)?.map((page, pageIndex) => (
                    <Card key={page.id} className="border-l-4 border-l-blue-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <FormField
                              control={form.control}
                              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.title`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Título da página"
                                      className="font-medium"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {validPageTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          <div className="flex items-center gap-2">
                                            {type === 'video' && <Video className="h-4 w-4" />}
                                            {type === 'text' && <FileText className="h-4 w-4" />}
                                            {type === 'audio' && <Mic className="h-4 w-4" />}
                                            {type === 'pdf' && <FileText className="h-4 w-4" />}
                                            {type === 'gallery' && <ImageIcon className="h-4 w-4" />}
                                            {type === 'exercise' && <ClipboardCheck className="h-4 w-4" />}
                                            {type === 'quiz' && <ClipboardCheck className="h-4 w-4" />}
                                            {type === 'mixed' && <Sparkles className="h-4 w-4" />}
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentPages = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.pages`) || [];
                              const newPages = currentPages.filter((_, index) => index !== pageIndex);
                              form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.pages`, newPages);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Conteúdo específico da página baseado no tipo */}
                        <PageContentEditor 
                          form={form}
                          moduleIndex={moduleIndex}
                          lessonIndex={lessonIndex}
                          pageIndex={pageIndex}
                          pageType={page.type}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Materiais Complementares</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentMaterials = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.materials`) || [];
                      const newMaterial = {
                        name: '',
                        url: '',
                      };
                      form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.materials`, [...currentMaterials, newMaterial]);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>

                {/* Lista de materiais */}
                <div className="space-y-3">
                  {form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.materials`)?.map((material, materialIndex) => (
                    <div key={materialIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <FormField
                        control={form.control}
                        name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Nome do material"
                                className="text-sm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="URL do material"
                                className="text-sm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentMaterials = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.materials`) || [];
                          const newMaterials = currentMaterials.filter((_, index) => index !== materialIndex);
                          form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.materials`, newMaterials);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Quiz da Aula</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentQuestions = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.questions`) || [];
                      const newQuestion = {
                        id: nanoid(),
                        question: '',
                        options: [
                          { id: nanoid(), text: '', isCorrect: false },
                          { id: nanoid(), text: '', isCorrect: false },
                          { id: nanoid(), text: '', isCorrect: false },
                          { id: nanoid(), text: '', isCorrect: false },
                        ],
                      };
                      form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.questions`, [...currentQuestions, newQuestion]);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Questão
                  </Button>
                </div>

                {/* Lista de questões */}
                <div className="space-y-4">
                  {form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.questions`)?.map((question, questionIndex) => (
                    <Card key={question.id} className="border-l-4 border-l-purple-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium">Questão {questionIndex + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentQuestions = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.questions`) || [];
                              const newQuestions = currentQuestions.filter((_, index) => index !== questionIndex);
                              form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.questions`, newQuestions);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Digite a pergunta..."
                                  rows={2}
                                  className="text-sm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Opções da questão */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Opções:</Label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={option.id} className="flex items-center gap-3">
                              <FormField
                                control={form.control}
                                name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options.${optionIndex}.text`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder={`Opção ${optionIndex + 1}`}
                                        className="text-sm"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

// Componente para editar conteúdo específico de cada página
function PageContentEditor({ 
  form, 
  moduleIndex, 
  lessonIndex, 
  pageIndex, 
  pageType 
}: { 
  form: UseFormReturn<CourseFormValues>;
  moduleIndex: number;
  lessonIndex: number;
  pageIndex: number;
  pageType: 'text' | 'video' | 'audio' | 'pdf' | 'gallery' | 'exercise' | 'quiz' | 'mixed';
}) {
  const renderContentByType = () => {
    switch (pageType) {
      case 'text':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo da Página</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Resumo do conteúdo desta página..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.observations`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Observações importantes para esta página..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Editor de blocos de conteúdo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Blocos de Conteúdo</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentBlocks = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks`) || [];
                    const newBlock = {
                      type: 'paragraph' as const,
                      text: '',
                    };
                    form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks`, [...currentBlocks, newBlock]);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Bloco
                </Button>
              </div>
              
              <div className="space-y-2">
                {form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks`)?.map((block, blockIndex) => (
                  <div key={blockIndex} className="flex items-start gap-2 p-2 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks.${blockIndex}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="paragraph">Parágrafo</SelectItem>
                              <SelectItem value="heading">Título</SelectItem>
                              <SelectItem value="list">Lista</SelectItem>
                              <SelectItem value="image">Imagem</SelectItem>
                              <SelectItem value="video">Vídeo</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks.${blockIndex}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Conteúdo do bloco..."
                              rows={2}
                              className="text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentBlocks = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks`) || [];
                        const newBlocks = currentBlocks.filter((_, index) => index !== blockIndex);
                        form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.contentBlocks`, newBlocks);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.videoUrl`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Cole a URL do vídeo (YouTube, Vimeo, ou arquivo direto)
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Vídeo</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o conteúdo do vídeo..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.pdfUrl`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Arquivo PDF</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://exemplo.com/arquivo.pdf"
                      className="text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    URL do arquivo PDF
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Arquivo</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o conteúdo do arquivo..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'audio':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.audioUrl`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Áudio</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://exemplo.com/audio.mp3"
                      className="text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    URL do arquivo de áudio
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Áudio</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o conteúdo do áudio..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'gallery':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Galeria</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva a galeria de imagens..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'exercise':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Exercício</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o exercício..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'quiz':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Quiz</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o quiz..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'mixed':
        return (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${pageIndex}.summary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Conteúdo Misto</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o conteúdo misto..."
                      rows={2}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
        
      default:
        return (
          <div className="text-sm text-gray-500">
            Tipo de página não suportado: {pageType}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {renderContentByType()}
    </div>
  );
}

// Componente para seleção de imagem de capa
function CoverImageSection({ form }: { form: UseFormReturn<CourseFormValues> }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  return (
    <FormField
      control={form.control}
      name="coverImageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold">Imagem de Capa</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Preview da imagem */}
              {(typeof (preview || field.value) === 'string' && (preview || field.value)) && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img 
                    src={preview || (typeof field.value === 'string' ? field.value : '')} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPreview(null);
                      field.onChange('');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {/* Botões de ação */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGalleryOpen(true)}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Galeria
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result as string;
                          setPreview(result);
                          field.onChange(result);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </FormControl>
          <FormDescription>
            Escolha uma imagem atrativa para representar seu curso
          </FormDescription>
          <FormMessage />
          {/* Modal da galeria */}
          <CoverImageGalleryModal
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
            onSelect={(url) => {
              field.onChange(url);
              setPreview(url);
              setGalleryOpen(false);
            }}
          />
        </FormItem>
      )}
    />
  );
}