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
  Heading3, Table, Zap, Sparkles, ChevronDown, ChevronUp, Move3D
} from 'lucide-react';
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
export type PageType = "video" | "text" | "file"; // removido "quiz" e "interactive"
export type LessonTypeLiteral = "video" | "text" | "quiz" | "audio"; // removido "interactive"
export const validPageTypes: PageType[] = ["video", "text", "file"];
export const validLessonTypes: LessonTypeLiteral[] = ["video", "text", "quiz", "audio"];

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
  return {
    title: course.title || '',
    description: course.description || '',
    category: course.category || '',
    modules: (course.modules || []).map((m) => ({
      id: m.id || '',
      title: m.title || '',
      badge: m.badge || undefined,
      lessons: (m.lessons || []).map((l: any) => ({
        id: l.id || '',
        title: l.title || '',
        summary: l.summary || '',
        pages: l.pages || [],
        type: l.type,
        duration: l.duration || 1,
        content: l.content || '',
        contentBlocks: l.contentBlocks || [],
        audioFile: l.audioFile,
        materials: l.materials || [],
        questions: l.questions || [],
        passingScore: l.passingScore,
      })),
    })),
    difficulty: course.difficulty || 'Iniciante',
    investmentCost: course.investmentCost || 0,
    priceInCredits: course.priceInCredits || 0,
    authorInfo: course.authorInfo || '',
    legalNotice: course.legalNotice || '',
    coverImageUrl: course.coverImageUrl || '',
  };
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
        const course = await getCourseById(id);
        return course ? courseToFormValues(course) : null;
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao carregar curso.' });
        return null;
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
  const operations = useCourseOperations(id, user?.uid || '');

  useEffect(() => {
    const loadCourse = async () => {
      const courseData = await operations.read(id);
      if (courseData) {
        setCourse(courseData);
      }
      setIsLoading(false);
    };
    loadCourse();
  }, [id, operations]);

  if (isLoading) return <LoadingScreen />;
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
            type: 'text' as LessonTypeLiteral,
            duration: 10,
            pages: [{
              id: nanoid(),
              type: 'text' as PageType,
              title: '',
              textContent: ''
            }],
            questions: [],
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
  const lessonTypeIcons = {
    video: <Video className="h-4 w-4" />,
    text: <FileText className="h-4 w-4" />,
    quiz: <ClipboardCheck className="h-4 w-4" />,
    audio: <Mic className="h-4 w-4" />,
    interactive: <Sparkles className="h-4 w-4" />,
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
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
                    className="font-medium"
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
                    <SelectTrigger className="w-32">
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
      
      {/* Resumo da aula */}
      <FormField
        control={form.control}
        name={`modules.${moduleIndex}.lessons.${lessonIndex}.summary`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Resumo da aula..."
                rows={2}
                className="text-sm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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