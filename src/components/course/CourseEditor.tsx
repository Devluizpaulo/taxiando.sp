'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid';
import { debounce } from 'lodash';

import { type CourseFormValues } from '@/lib/course-schemas';
import { courseFormSchema } from '@/lib/course-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  PlusCircle, Trash2, Save, Eye, Copy, Download, Settings, 
  FileText, BookOpen, Clock, Edit3, Zap, Type, Image, Video, 
  FileAudio, FileText as FileTextIcon, Link, Code, Bold, Italic,
  List, ListOrdered, Quote, Heading1, Heading2, Heading3, 
  GripVertical, BarChart3, Target, Users, Star, TrendingUp,
  Calendar, Award, Bookmark, Search, Filter, SortAsc, 
  Play, Pause, Volume2, Maximize, Minimize, RotateCcw,
  CheckCircle, AlertCircle, Info, Lightbulb, Sparkles, TestTube, GraduationCap, Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EducationalElementsManager } from './EducationalElementsManager';

// Componente para estatísticas do curso
const CourseStats = ({ form }: { form: any }) => {
  const modules = form.watch('modules') || [];
  const totalLessons = modules.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0);
  const totalDuration = modules.reduce((acc: number, module: any) => {
    return acc + (module.lessons?.reduce((lessonAcc: number, lesson: any) => lessonAcc + (lesson.totalDuration || 0), 0) || 0);
  }, 0);
  const completionRate = modules.length > 0 ? Math.round((modules.filter((m: any) => m.lessons?.length > 0).length / modules.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Módulos</p>
              <p className="text-2xl font-bold text-blue-900">{modules.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Aulas</p>
              <p className="text-2xl font-bold text-green-900">{totalLessons}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Duração</p>
              <p className="text-2xl font-bold text-purple-900">{totalDuration}h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Progresso</p>
              <p className="text-2xl font-bold text-orange-900">{completionRate}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
          <Progress value={completionRate} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para templates de curso
const CourseTemplates = ({ onSelectTemplate }: { onSelectTemplate: (template: any) => void }) => {
  const templates = [
    {
      id: 'basic',
      name: 'Curso Básico',
      description: 'Estrutura simples com introdução, conteúdo e conclusão',
      icon: BookOpen,
      color: 'blue',
      modules: 3
    },
    {
      id: 'advanced',
      name: 'Curso Avançado',
      description: 'Múltiplos módulos com exercícios e avaliações',
      icon: Target,
      color: 'green',
      modules: 5
    },
    {
      id: 'workshop',
      name: 'Workshop Prático',
      description: 'Foco em atividades práticas e projetos',
      icon: Sparkles,
      color: 'purple',
      modules: 4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
          onClick={() => onSelectTemplate(template)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <template.icon className={`h-6 w-6 text-${template.color}-600`} />
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.modules} módulos</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Componente para o cabeçalho do editor
const EditorHeader = ({ 
  hasUnsavedChanges, 
  lastSaved, 
  onPreviewToggle, 
  isPreviewMode,
  courseStats
}: {
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  onPreviewToggle: () => void;
  isPreviewMode: boolean;
  courseStats: any;
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-6">
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
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>0 alunos inscritos</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="h-4 w-4" />
          <span>0 avaliações</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviewToggle}
        >
          {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {isPreviewMode ? 'Editar' : 'Visualizar'}
        </Button>
      </div>
    </div>

    <CourseStats form={courseStats} />
  </div>
);

// Componente para a aba geral
const GeneralTab = ({ form }: { form: any }) => (
  <TabsContent value="geral" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Informações Gerais
        </CardTitle>
        <CardDescription>Configure as informações básicas do curso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título e Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título do Curso</label>
            <Input
              {...form.register('title')}
              placeholder="Digite o título do curso"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select onValueChange={(value) => form.setValue('status', value)} defaultValue={form.getValues('status')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Rascunho</SelectItem>
                <SelectItem value="Published">Publicado</SelectItem>
                <SelectItem value="Archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            {...form.register('description')}
            placeholder="Descreva o conteúdo do curso..."
            className="min-h-[100px]"
          />
        </div>

        {/* Preço e Duração */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preço (R$)</label>
            <Input
              {...form.register('price', { valueAsNumber: true })}
              type="number"
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duração (horas)</label>
            <Input
              {...form.register('duration', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nível</label>
            <Select onValueChange={(value) => form.setValue('level', value)} defaultValue={form.getValues('level')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categoria e Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Input
              {...form.register('category')}
              placeholder="Ex: Tecnologia, Negócios, Saúde"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
            <Input
              {...form.register('tags')}
              placeholder="tag1, tag2, tag3"
              className="w-full"
            />
          </div>
        </div>

        {/* Configurações Avançadas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Configurações Avançadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Certificado</label>
              <Select onValueChange={(value) => form.setValue('certificate', value)} defaultValue={form.getValues('certificate')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de certificado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem certificado</SelectItem>
                  <SelectItem value="basic">Certificado básico</SelectItem>
                  <SelectItem value="advanced">Certificado avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Acesso</label>
              <Select onValueChange={(value) => form.setValue('access', value)} defaultValue={form.getValues('access')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lifetime">Acesso vitalício</SelectItem>
                  <SelectItem value="1year">1 ano</SelectItem>
                  <SelectItem value="6months">6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Componente para a barra de ferramentas do editor
const EditorToolbar = () => (
  <div className="flex items-center gap-2 p-3 bg-gray-50 border-b rounded-t-lg">
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" title="Negrito">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Itálico">
        <Italic className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <Button variant="ghost" size="sm" title="Título 1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Título 2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Título 3">
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <Button variant="ghost" size="sm" title="Lista">
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Lista numerada">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Citação">
        <Quote className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <Button variant="ghost" size="sm" title="Link">
        <Link className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Imagem">
        <Image className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Vídeo">
        <Video className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Áudio">
        <FileAudio className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Código">
        <Code className="h-4 w-4" />
      </Button>
    </div>
    
    <div className="flex-1"></div>
    
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" title="Desfazer">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Expandir">
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Componente para o editor avançado
const AdvancedEditor = ({ form, moduleIndex, lessonIndex }: { form: any; moduleIndex: number; lessonIndex: number }) => {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const lesson = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}`);
    if (lesson?.content) {
      try {
        const parsed = JSON.parse(lesson.content);
        setContent(parsed.text || '');
      } catch {
        setContent(lesson.content || '');
      }
    }
  }, [form, moduleIndex, lessonIndex]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 palavras por minuto
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const contentBlock = {
      type: 'paragraph',
      text: newContent
    };
    form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.content`, JSON.stringify([contentBlock]));
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <EditorToolbar />
      <div className="p-4 min-h-[400px]">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Digite o conteúdo da aula aqui..."
          className="min-h-[350px] border-0 resize-none focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>{wordCount} palavras</span>
          <span>{readingTime} min de leitura</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Salvo automaticamente</span>
        </div>
      </div>
    </div>
  );
};

// Componente para a aba de conteúdo
const ContentTab = ({ form }: { form: any }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'structure' | 'editor' | 'elements'>('structure');
  const [showTemplates, setShowTemplates] = useState(false);

  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
    control: form.control,
    name: 'modules',
    keyName: 'fieldId',
  });

  const handleAddModule = useCallback(() => {
    appendModule({
      id: nanoid(),
      title: '',
      lessons: [],
      badge: undefined,
    });
  }, [appendModule]);

  const handleAddLesson = useCallback((moduleIndex: number) => {
    const newLesson = {
      id: nanoid(),
      title: 'Nova Aula',
      type: 'single' as const,
      content: JSON.stringify([]),
      totalDuration: 0,
      pages: [],
      materials: [],
      questions: [],
      exercises: [],
      summaries: [],
      exams: [],
      knowledgeTests: [],
      interactiveActivities: [],
      resources: []
    };
    
    const currentLessons = form.getValues(`modules.${moduleIndex}.lessons`) || [];
    const updatedLessons = currentLessons.concat([newLesson]);
    form.setValue(`modules.${moduleIndex}.lessons`, updatedLessons);
    setActiveLessonIndex(currentLessons.length);
  }, [form]);

  const handleSelectTemplate = useCallback((template: any) => {
    // Implementar lógica de template
    setShowTemplates(false);
  }, []);

  return (
    <TabsContent value="conteudo" className="space-y-6">
      {/* Header com Modo de Visualização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conteúdo do Curso</h2>
          <p className="text-gray-600 mt-1">Crie conteúdo incrível com o editor avançado</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'structure' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('structure')}
              className="rounded-md"
            >
              <Settings className="h-4 w-4 mr-2" />
              Estrutura
            </Button>
            <Button
              variant={viewMode === 'editor' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('editor')}
              className="rounded-md"
            >
              <Zap className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={viewMode === 'elements' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('elements')}
              className="rounded-md"
            >
              <Target className="h-4 w-4 mr-2" />
              Elementos
            </Button>
          </div>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Templates de Curso
            </CardTitle>
            <CardDescription>Escolha um template para começar rapidamente</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseTemplates onSelectTemplate={handleSelectTemplate} />
          </CardContent>
        </Card>
      )}

      {viewMode === 'structure' ? (
        /* MODO ESTRUTURA - Organização Visual */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Lista de Módulos */}
          <div className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="h-5 w-5" />
                  Módulos do Curso
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Organize seu conteúdo em módulos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {moduleFields.map((module: any, index: number) => (
                  <div
                    key={module.fieldId}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      activeModuleIndex === index
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => setActiveModuleIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          value={module.title || ''}
                          onChange={(e) => form.setValue(`modules.${index}.title`, e.target.value)}
                          placeholder={`Módulo ${index + 1}`}
                          className="border-none p-0 h-auto font-semibold text-gray-900 focus-visible:ring-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">
                            {module.lessons?.length || 0} aulas
                          </p>
                          {module.lessons?.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {module.lessons.reduce((acc: number, lesson: any) => acc + (lesson.totalDuration || 0), 0)} min
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModule(index);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={handleAddModule}
                  className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Adicionar Módulo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Aulas do Módulo Selecionado */}
          <div className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <BookOpen className="h-5 w-5" />
                  Aulas do Módulo
                </CardTitle>
                <CardDescription className="text-green-700">
                  {moduleFields[activeModuleIndex]?.title || `Módulo ${activeModuleIndex + 1}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {moduleFields[activeModuleIndex]?.lessons?.map((lesson: any, index: number) => (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      activeLessonIndex === index
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                    }`}
                    onClick={() => setActiveLessonIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          value={lesson.title || ''}
                          onChange={(e) => form.setValue(`modules.${activeModuleIndex}.lessons.${index}.title`, e.target.value)}
                          placeholder={`Aula ${index + 1}`}
                          className="border-none p-0 h-auto font-semibold text-gray-900 focus-visible:ring-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {lesson.content ? JSON.parse(lesson.content).length : 0} elementos
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lesson.totalDuration || 0} min
                          </Badge>
                          {lesson.content && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Conteúdo
                            </Badge>
                          )}
                          {/* Badges para elementos educacionais */}
                          {lesson.questions?.length > 0 && (
                            <Badge variant="outline" className="text-xs text-blue-600">
                              <Target className="h-3 w-3 mr-1" />
                              {lesson.questions.length} questões
                            </Badge>
                          )}
                          {lesson.exercises?.length > 0 && (
                            <Badge variant="outline" className="text-xs text-purple-600">
                              <TestTube className="h-3 w-3 mr-1" />
                              {lesson.exercises.length} exercícios
                            </Badge>
                          )}
                          {lesson.exams?.length > 0 && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {lesson.exams.length} provas
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentLessons = form.getValues(`modules.${activeModuleIndex}.lessons`);
                            const updatedLessons = currentLessons.filter((_: any, i: number) => i !== index);
                            form.setValue(`modules.${activeModuleIndex}.lessons`, updatedLessons);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handleAddLesson(activeModuleIndex)}
                  className="w-full border-dashed border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Adicionar Aula
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Preview da Aula */}
          <div className="space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Eye className="h-5 w-5" />
                  Preview da Aula
                </CardTitle>
                <CardDescription className="text-purple-700">
                  {moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex]?.title || 'Selecione uma aula'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border min-h-[200px]">
                  {moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex]?.content ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-600">
                        {(() => {
                          try {
                            const content = JSON.parse(moduleFields[activeModuleIndex].lessons[activeLessonIndex].content);
                            return content[0]?.text || 'Conteúdo da aula...';
                          } catch {
                            return 'Conteúdo da aula...';
                          }
                        })()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">Nenhum conteúdo ainda</p>
                      <Button 
                        size="sm" 
                        onClick={() => setViewMode('editor')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Começar a Editar
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Estatísticas da aula */}
                {moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex]?.content && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded border text-center">
                      <p className="font-medium text-gray-900">
                        {(() => {
                          try {
                            const content = JSON.parse(moduleFields[activeModuleIndex].lessons[activeLessonIndex].content);
                            return content[0]?.text?.split(/\s+/).filter((w: string) => w.length > 0).length || 0;
                          } catch {
                            return 0;
                          }
                        })()}
                      </p>
                      <p className="text-gray-600">palavras</p>
                    </div>
                    <div className="p-2 bg-white rounded border text-center">
                      <p className="font-medium text-gray-900">
                        {moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex]?.totalDuration || 0}
                      </p>
                      <p className="text-gray-600">minutos</p>
                    </div>
                  </div>
                )}

                {/* Resumo dos elementos educacionais */}
                {(() => {
                  const lesson = moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex];
                  if (!lesson) return null;
                  
                  const elements = [
                    { type: 'questions', count: lesson.questions?.length || 0, icon: Target, color: 'blue' },
                    { type: 'exercises', count: lesson.exercises?.length || 0, icon: TestTube, color: 'purple' },
                    { type: 'summaries', count: lesson.summaries?.length || 0, icon: BookOpen, color: 'green' },
                    { type: 'exams', count: lesson.exams?.length || 0, icon: GraduationCap, color: 'orange' },
                    { type: 'tests', count: lesson.knowledgeTests?.length || 0, icon: Brain, color: 'red' }
                  ].filter(el => el.count > 0);

                  if (elements.length === 0) return null;

                  return (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Elementos Educacionais:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {elements.map((element) => (
                          <div key={element.type} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <element.icon className={`h-4 w-4 text-${element.color}-600`} />
                            <span className="text-xs text-gray-600">{element.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : viewMode === 'editor' ? (
        /* MODO EDITOR - Editor Avançado */
        <div className="space-y-6">
          {moduleFields.length > 0 && moduleFields[activeModuleIndex]?.lessons?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Editando: {moduleFields[activeModuleIndex]?.title || `Módulo ${activeModuleIndex + 1}`} - {moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex]?.title || `Aula ${activeLessonIndex + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600">Use as ferramentas abaixo para criar conteúdo rico</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewMode('structure')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Voltar à Estrutura
                  </Button>
                </div>
              </div>
              
              <AdvancedEditor 
                form={form} 
                moduleIndex={activeModuleIndex} 
                lessonIndex={activeLessonIndex} 
              />
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum conteúdo para editar</h3>
              <p className="text-gray-600 mb-4">
                Primeiro, adicione módulos e aulas no modo Estrutura.
              </p>
              <Button onClick={() => setViewMode('structure')}>
                <Settings className="h-4 w-4 mr-2" />
                Ir para Estrutura
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* MODO ELEMENTOS - Gerenciador de Elementos Educacionais */
        <div className="space-y-6">
          {moduleFields.length > 0 && moduleFields[activeModuleIndex]?.lessons?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Elementos Educacionais: {moduleFields[activeModuleIndex]?.title || `Módulo ${activeModuleIndex + 1}`} - {moduleFields[activeModuleIndex]?.lessons?.[activeLessonIndex]?.title || `Aula ${activeLessonIndex + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600">Crie provas, exercícios, resumos e testes para esta aula</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewMode('structure')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Voltar à Estrutura
                  </Button>
                </div>
              </div>
              
              <EducationalElementsManager
                form={form}
                moduleIndex={activeModuleIndex}
                lessonIndex={activeLessonIndex}
              />
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma aula selecionada</h3>
              <p className="text-gray-600 mb-4">
                Primeiro, adicione módulos e aulas no modo Estrutura.
              </p>
              <Button onClick={() => setViewMode('structure')}>
                <Settings className="h-4 w-4 mr-2" />
                Ir para Estrutura
              </Button>
            </div>
          )}
        </div>
      )}
    </TabsContent>
  );
};

// Hook otimizado para auto-save
const useOptimizedAutoSave = (form: any, courseId: string, onSave: (data: any) => Promise<void>) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const debouncedSave = useMemo(
    () => debounce(async (data: any) => {
      try {
        await onSave(data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    [onSave]
  );

  const handleFormChange = useCallback((data: any) => {
    setHasUnsavedChanges(true);
    debouncedSave(data);
  }, [debouncedSave]);

  return { lastSaved, hasUnsavedChanges, handleFormChange };
};

// Componente principal do editor
export function CourseEditor({ 
  course, 
  courseId, 
  onSave 
}: { 
  course: CourseFormValues;
  courseId: string;
  onSave: (data: CourseFormValues) => Promise<void>;
}) {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course,
    mode: 'onChange',
  });

  const { lastSaved, hasUnsavedChanges, handleFormChange } = useOptimizedAutoSave(
    form, 
    courseId, 
    onSave
  );

  // Observar mudanças no formulário
  const watchedData = form.watch();
  
  // Usar useEffect para detectar mudanças sem causar loops
  const prevDataRef = useRef(watchedData);
  useEffect(() => {
    if (JSON.stringify(prevDataRef.current) !== JSON.stringify(watchedData)) {
      prevDataRef.current = watchedData;
      handleFormChange(watchedData);
    }
  }, [watchedData, handleFormChange]);

  const handlePreviewToggle = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <EditorHeader
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        onPreviewToggle={handlePreviewToggle}
        isPreviewMode={isPreviewMode}
        courseStats={form}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <GeneralTab form={form} />
        <ContentTab form={form} />
        
        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>Configure opções avançadas do curso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Configurações avançadas serão implementadas aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 