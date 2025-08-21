'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/app/actions/course-actions';
import { AdvancedContentEditor } from '@/components/advanced-content-editor';
import { type ContentBlock } from '@/lib/types';
import { generateCourseStructure, type GenerateCourseOutput } from '@/ai/flows/course-creator-flow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Sparkles,
  Loader2,
  Brain
} from 'lucide-react';
import { nanoid } from 'nanoid';

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

// Novo componente para o Assistente de IA
const AiCourseGenerator = ({ onCourseGenerated, isGenerating, onGenerationStart, onGenerationEnd }: {
  onCourseGenerated: (data: GenerateCourseOutput) => void;
  isGenerating: boolean;
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
}) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (topic.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Tópico muito curto',
        description: 'Por favor, forneça mais detalhes sobre o que você quer ensinar.',
      });
      return;
    }

    onGenerationStart();
    try {
      const result = await generateCourseStructure({ topic, targetAudience: audience });
      onCourseGenerated(result);
      toast({
        title: "Curso Gerado com IA!",
        description: "A estrutura e o conteúdo do curso foram preenchidos para você.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro da IA',
        description: 'Não foi possível gerar o curso. Tente novamente ou com um tópico diferente.',
      });
      console.error(error);
    } finally {
      onGenerationEnd();
    }
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          Assistente de IA para Criação de Cursos
        </CardTitle>
        <CardDescription>
          Sem tempo? Descreva um tópico e deixe a IA criar uma estrutura completa de curso, com módulos, aulas e até quizzes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Técnicas de direção defensiva para taxistas em São Paulo"
          rows={3}
          disabled={isGenerating}
        />
        <Input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Público-alvo (opcional, ex: iniciantes, experientes)"
          disabled={isGenerating}
        />
        <Button onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="w-full">
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Gerando curso, aguarde...' : 'Gerar Curso com IA'}
        </Button>
      </CardContent>
    </Card>
  );
};


export default function CreateCourseWithEditorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');
  const [isCreating, setIsCreating] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      blockType: 'slide_title',
      title: 'Bem-vindo ao Curso',
      subtitle: 'Clique para editar o título e subtítulo',
      background: 'gradient-to-r from-blue-500 to-purple-600',
      textColor: 'white',
      alignment: 'center'
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

  const handleAiCourseGenerated = (data: GenerateCourseOutput) => {
    form.setValue('title', data.title);
    form.setValue('description', data.description);
    form.setValue('category', data.category);

    const newContentBlocks = data.modules.flatMap(module => {
      const moduleTitle: ContentBlock = {
        blockType: 'heading',
        level: 2,
        text: module.title,
        style: 'accent'
      };

      const lessonBlocks = module.lessons.flatMap(lesson => ([
        {
          blockType: 'heading' as const,
          level: 3,
          text: lesson.title
        },
        {
          blockType: 'paragraph' as const,
          text: lesson.content
        }
      ]));

      const quizBlock: ContentBlock[] = module.quiz ? [
        {
          blockType: 'quiz' as const,
          questions: module.quiz.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })),
          }))
        }
      ] : [];

      return [moduleTitle, ...lessonBlocks, ...quizBlock];
    });

    setContentBlocks(newContentBlocks);
    
    // Calcula a duração total estimada
    const totalDuration = data.modules.reduce((total, module) => 
      total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.totalDuration, 0), 0);
    form.setValue('estimatedDuration', totalDuration);

    setActiveTab('editor'); // Muda para a aba do editor para ver o resultado
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
      const courseData = {
        ...values,
        modules: [{
          id: nanoid(),
          title: 'Módulo Principal',
          description: 'Conteúdo criado com o editor avançado',
          lessons: [{
            id: nanoid(),
            title: 'Aula Principal',
            content: JSON.stringify(contentBlocks),
            totalDuration: values.estimatedDuration,
            type: 'multi_page' as const,
            pages: [],
            materials: [],
            questions: []
          }]
        }],
        totalLessons: 1,
        totalDuration: values.estimatedDuration,
      };

      const result = await createCourse(courseData);
      
      if (result.success && result.courseId) {
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
                Use o editor avançado ou a IA para criar conteúdo interativo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={onSubmit} disabled={isCreating || isAiGenerating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isCreating ? 'Criando...' : 'Criar Curso'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar com informações do curso */}
        <div className="w-96 bg-white border-r overflow-y-auto p-6 space-y-6">
           <AiCourseGenerator 
              onCourseGenerated={handleAiCourseGenerated}
              isGenerating={isAiGenerating}
              onGenerationStart={() => setIsAiGenerating(true)}
              onGenerationEnd={() => setIsAiGenerating(false)}
            />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="p-1 space-y-6">
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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                               <SelectItem value="Finanças">Finanças</SelectItem>
                                <SelectItem value="Bem-estar">Bem-estar</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
            </TabsContent>
            
            <TabsContent value="settings" className="p-1 space-y-6">
                <Form {...form}>
                  <form className="space-y-4">
                     <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Dificuldade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Editor principal */}
        <div className="flex-1">
          <AdvancedContentEditor
            contentBlocks={contentBlocks}
            onChange={setContentBlocks}
            onSave={() => form.handleSubmit(onSubmit)()}
          />
        </div>
      </div>
    </div>
  );
}
