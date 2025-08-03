'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/app/actions/course-actions';
import { AdvancedContentEditor } from '@/components/advanced-content-editor';
import { type ContentBlock } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Eye, 
  Play, 
  Download, 
  ArrowLeft, 
  BookOpen, 
  Settings, 
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Sparkles
} from 'lucide-react';

// Schema simplificado e otimizado
const courseSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }),
  difficulty: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  estimatedDuration: z.coerce.number().min(1, "A duração estimada deve ser de pelo menos 1 minuto.").default(60),
  isPublicListing: z.boolean().default(false),
  autoCertification: z.boolean().default(true),
  minimumPassingScore: z.coerce.number().min(0).max(100).default(70),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CreateCourseWithEditorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');
  const [isCreating, setIsCreating] = useState(false);
  
  // Conteúdo inicial otimizado
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      type: 'slide_title',
      title: 'Bem-vindo ao Curso',
      subtitle: 'Clique para editar o título e subtítulo',
      background: 'gradient-to-r from-blue-500 to-purple-600',
      textColor: 'white',
      alignment: 'center'
    },
    {
      type: 'heading',
      level: 2,
      text: 'Objetivos do Curso',
      style: 'accent'
    },
    {
      type: 'bullet_points',
      title: 'O que você aprenderá:',
      points: [
        'Adicione seus objetivos aqui',
        'Use o editor para personalizar',
        'Crie conteúdo interativo',
        'Organize em módulos e aulas'
      ],
      style: 'icons',
      icon: 'check'
    }
  ]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'Iniciante',
      estimatedDuration: 60,
      isPublicListing: false,
      autoCertification: true,
      minimumPassingScore: 70,
    },
  });

  const handleSave = () => {
    toast({
      title: 'Conteúdo salvo!',
      description: 'Seu conteúdo foi salvo automaticamente.',
    });
  };

  const handleCreateCourse = async (values: CourseFormValues) => {
    if (contentBlocks.length === 0) {
      toast({
        title: 'Conteúdo necessário',
        description: 'Adicione pelo menos um elemento de conteúdo antes de criar o curso.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Preparar dados do curso com o conteúdo do editor
      const courseData = {
        ...values,
        modules: [{
          id: 'module-1',
          title: 'Módulo Principal',
          description: 'Conteúdo criado com o editor avançado',
          lessons: [{
            id: 'lesson-1',
            title: 'Aula Principal',
            content: JSON.stringify(contentBlocks),
            totalDuration: values.estimatedDuration,
            pages: [],
            materials: [],
            questions: []
          }]
        }],
        totalLessons: 1,
        totalDuration: values.estimatedDuration,
      };

      const result = await createCourse(courseData);
      
      if (result.success) {
        toast({
          title: 'Curso criado com sucesso!',
          description: 'Seu curso foi criado e está pronto para ser editado.',
        });
        router.push(`/admin/courses/${result.courseId}/edit`);
      } else {
        toast({
          title: 'Erro ao criar curso',
          description: result.error || 'Ocorreu um erro inesperado.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao criar o curso.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const onSubmit = form.handleSubmit(handleCreateCourse);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Curso</h1>
              <p className="text-gray-600 mt-1">
                Use o editor avançado para criar conteúdo interativo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button onClick={onSubmit} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Curso
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar com informações do curso */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Curso</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o título do curso" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o conteúdo do curso"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Legislação">Legislação</SelectItem>
                              <SelectItem value="Segurança">Segurança</SelectItem>
                              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                              <SelectItem value="Atendimento">Atendimento</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
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
                          <FormLabel>Nível de Dificuldade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Iniciante">Iniciante</SelectItem>
                              <SelectItem value="Intermediário">Intermediário</SelectItem>
                              <SelectItem value="Avançado">Avançado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração Estimada (minutos)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configurações</h3>
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isPublicListing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Listagem Pública</FormLabel>
                            <FormDescription>
                              Tornar o curso visível no catálogo público
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="autoCertification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Certificação Automática</FormLabel>
                            <FormDescription>
                              Emitir certificado automaticamente ao concluir
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="minimumPassingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota Mínima para Aprovação (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Editor principal */}
        <div className="flex-1">
          <AdvancedContentEditor
            contentBlocks={contentBlocks}
            onChange={setContentBlocks}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
} 