'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Filter, Grid, List, Edit, Trash2, Eye, 
  Download, Upload, Copy, Archive, Settings, Brain, Calendar,
  BarChart3, Edit3, Link, MousePointer, Target, Puzzle
} from 'lucide-react';
import { 
  getEducationalElements,
  getEducationalElementsByType,
  getEducationalElementsByDifficulty,
  deleteEducationalElement,
  updateEducationalElementStatus,
  exportEducationalElements,
  type EducationalElement 
} from '@/app/actions/educational-elements-actions';
import { EducationalElementEditor } from '@/components/course/EducationalElementEditor';
import { useToast } from '@/hooks/use-toast';

export default function EducationalElementsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { toast } = useToast();

  const [elements, setElements] = useState<EducationalElement[]>([]);
  const [filteredElements, setFilteredElements] = useState<EducationalElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedElement, setSelectedElement] = useState<EducationalElement | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Carregar elementos educativos
  const loadElements = async () => {
    setLoading(true);
    try {
      // Buscar todos os elementos do curso (você pode implementar uma busca por curso)
      const result = await getEducationalElements(courseId, 'all');
      if (result.success && result.elements) {
        setElements(result.elements);
        setFilteredElements(result.elements);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar elementos",
        description: "Não foi possível carregar os elementos educativos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElements();
  }, [courseId]);

  // Filtrar elementos
  useEffect(() => {
    let filtered = elements;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(element => {
        const searchLower = searchTerm.toLowerCase();
        
        // Check for title (only for types that have it)
        const hasTitle = 'title' in element.data && 
          element.data.title?.toLowerCase().includes(searchLower);
        
        // Check for description (only for types that have it)
        const hasDescription = 'description' in element.data && 
          element.data.description?.toLowerCase().includes(searchLower);
        
        // Check for text content (for types like heading, paragraph, etc.)
        const hasText = 'text' in element.data && 
          element.data.text?.toLowerCase().includes(searchLower);
        
        // Check for question content (for exercise, quiz types)
        const hasQuestion = 'question' in element.data && 
          element.data.question?.toLowerCase().includes(searchLower);
        
        // Check for scenario content (for interactive_simulation)
        const hasScenario = 'scenario' in element.data && 
          element.data.scenario?.toLowerCase().includes(searchLower);
        
        // Check for background content (for case_study)
        const hasBackground = 'background' in element.data && 
          element.data.background?.toLowerCase().includes(searchLower);
        
        // Check for challenge content (for case_study)
        const hasChallenge = 'challenge' in element.data && 
          element.data.challenge?.toLowerCase().includes(searchLower);
        
        // Check for central topic (for mind_map)
        const hasCentralTopic = 'centralTopic' in element.data && 
          element.data.centralTopic?.toLowerCase().includes(searchLower);
        
        // Check for front/back content (for flashcard)
        const hasFlashcardContent = ('front' in element.data && 
          element.data.front?.toLowerCase().includes(searchLower)) ||
          ('back' in element.data && 
          element.data.back?.toLowerCase().includes(searchLower));
        
        return hasTitle || hasDescription || hasText || hasQuestion || 
               hasScenario || hasBackground || hasChallenge || 
               hasCentralTopic || hasFlashcardContent;
      });
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(element => element.type === filterType);
    }

    // Filtro por dificuldade
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(element => 
        element.metadata?.difficulty === filterDifficulty
      );
    }

    setFilteredElements(filtered);
  }, [elements, searchTerm, filterType, filterDifficulty]);

  // Deletar elemento
  const handleDelete = async (elementId: string) => {
    if (!confirm('Tem certeza que deseja deletar este elemento?')) return;

    try {
      const result = await deleteEducationalElement(elementId, courseId, 'all');
      if (result.success) {
        toast({
          title: "Elemento deletado",
          description: "O elemento educativo foi removido com sucesso.",
        });
        loadElements();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  // Alterar status
  const handleStatusChange = async (elementId: string, status: 'draft' | 'published' | 'archived') => {
    try {
      const result = await updateEducationalElementStatus(elementId, status);
      if (result.success) {
        toast({
          title: "Status atualizado",
          description: `Elemento ${status === 'published' ? 'publicado' : status === 'draft' ? 'salvo como rascunho' : 'arquivado'}.`,
        });
        loadElements();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  // Exportar elementos
  const handleExport = async () => {
    try {
      const result = await exportEducationalElements(courseId);
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `educational-elements-${courseId}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Exportação realizada",
          description: "Os elementos educativos foram exportados com sucesso.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'interactive_simulation': return <span className="text-lg">🎮</span>;
      case 'case_study': return <span className="text-lg">📋</span>;
      case 'timeline': return <span className="text-lg">📅</span>;
      case 'fill_blanks': return <span className="text-lg">✏️</span>;
      case 'mind_map': return <span className="text-lg">🧠</span>;
      case 'flashcard': return <span className="text-lg">🃏</span>;
      case 'comparison_table': return <span className="text-lg">📊</span>;
      case 'matching': return <span className="text-lg">🔗</span>;
      case 'drag_drop': return <span className="text-lg">🎯</span>;
      case 'hotspot': return <span className="text-lg">📍</span>;
      case 'word_search': return <span className="text-lg">🔍</span>;
      case 'crossword': return <span className="text-lg">📝</span>;
      case 'scenario_builder': return <span className="text-lg">🎭</span>;
      default: return <Puzzle className="h-4 w-4" />;
    }
  };

  const getElementLabel = (type: string) => {
    switch (type) {
      case 'interactive_simulation': return 'Simulação Interativa';
      case 'case_study': return 'Estudo de Caso';
      case 'timeline': return 'Linha do Tempo';
      case 'fill_blanks': return 'Preencher Lacunas';
      case 'mind_map': return 'Mapa Mental';
      case 'flashcard': return 'Flashcard';
      case 'comparison_table': return 'Tabela Comparativa';
      case 'matching': return 'Correspondência';
      case 'drag_drop': return 'Arrastar e Soltar';
      case 'hotspot': return 'Hotspot';
      case 'word_search': return 'Caça-Palavras';
      case 'crossword': return 'Palavras Cruzadas';
      case 'scenario_builder': return 'Construtor de Cenários';
      default: return 'Elemento';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Fácil</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      case 'hard':
        return <Badge variant="default" className="bg-red-100 text-red-800">Difícil</Badge>;
      default:
        return <Badge variant="outline">Não definido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando elementos educativos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Elementos Educativos</h1>
          <p className="text-muted-foreground">
            Gerencie os elementos interativos do curso
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Elemento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar elementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="interactive_simulation">Simulação Interativa</SelectItem>
                <SelectItem value="case_study">Estudo de Caso</SelectItem>
                <SelectItem value="timeline">Linha do Tempo</SelectItem>
                <SelectItem value="fill_blanks">Preencher Lacunas</SelectItem>
                <SelectItem value="mind_map">Mapa Mental</SelectItem>
                <SelectItem value="flashcard">Flashcard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Elementos */}
      {filteredElements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum elemento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterDifficulty !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Crie seu primeiro elemento educativo para começar.'
              }
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Elemento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredElements.map((element) => (
            <Card key={element.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getElementIcon(element.type)}
                    <div>
                      <CardTitle className="text-lg">
                        {'title' in element.data ? element.data.title : 'Sem título'}
                      </CardTitle>
                      <CardDescription>
                        {getElementLabel(element.type)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(element.status)}
                    {getDifficultyBadge(element.metadata?.difficulty)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {'description' in element.data ? element.data.description : 'Sem descrição'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Criado em {element.createdAt.toDate().toLocaleDateString()}</span>
                  <span>{element.metadata?.estimatedTime || 5} min</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedElement(element);
                      setShowEditor(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Implementar visualização
                      console.log('Visualizar elemento:', element.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(element.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                </div>

                {element.status === 'draft' && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleStatusChange(element.id, 'published')}
                    >
                      Publicar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EducationalElementEditor
              courseId={courseId}
              lessonId="all"
              userId="current-user-id" // Você precisa passar o ID do usuário atual
              element={selectedElement || undefined}
              onSave={(elementId) => {
                setShowEditor(false);
                setSelectedElement(null);
                setIsCreating(false);
                loadElements();
              }}
              onCancel={() => {
                setShowEditor(false);
                setSelectedElement(null);
                setIsCreating(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 