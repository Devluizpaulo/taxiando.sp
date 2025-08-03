'use client';

import { useState, useCallback } from 'react';
import { type ContentBlock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Copy, 
  Edit3, 
  Eye, 
  EyeOff,
  Type,
  Image,
  Video,
  FileText,
  List,
  Table,
  BarChart3,
  MessageSquare,
  Calendar,
  MapPin,
  Code,
  Settings,
  Palette,
  Layout,
  Zap,
  Star,
  Users,
  Share2,
  Download,
  Save,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  Grid,
  Columns,
  Layers,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize
} from 'lucide-react';

interface AdvancedContentEditorProps {
  contentBlocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

export function AdvancedContentEditor({ 
  contentBlocks, 
  onChange, 
  onSave, 
  readOnly = false 
}: AdvancedContentEditorProps) {
  const { toast } = useToast();
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'presentation'>('edit');

  // Categorias de elementos
  const elementCategories = {
    'Texto': [
      { type: 'heading', label: 'Título', icon: Type, color: 'text-blue-600' },
      { type: 'paragraph', label: 'Parágrafo', icon: Type, color: 'text-green-600' },
      { type: 'list', label: 'Lista', icon: ListIcon, color: 'text-purple-600' },
      { type: 'quote', label: 'Citação', icon: MessageSquare, color: 'text-orange-600' },
      { type: 'callout', label: 'Destaque', icon: Zap, color: 'text-red-600' },
      { type: 'code', label: 'Código', icon: Code, color: 'text-gray-600' }
    ],
    'Mídia': [
      { type: 'image', label: 'Imagem', icon: Image, color: 'text-pink-600' },
      { type: 'video', label: 'Vídeo', icon: Video, color: 'text-red-600' },
      { type: 'audio', label: 'Áudio', icon: Video, color: 'text-blue-600' },
      { type: 'gallery', label: 'Galeria', icon: Grid, color: 'text-purple-600' },
      { type: 'slideshow', label: 'Apresentação', icon: Layers, color: 'text-green-600' },
      { type: 'embed', label: 'Incorporar', icon: Share2, color: 'text-orange-600' }
    ],
    'Layout': [
      { type: 'columns', label: 'Colunas', icon: Columns, color: 'text-blue-600' },
      { type: 'card', label: 'Card', icon: FileText, color: 'text-green-600' },
      { type: 'container', label: 'Container', icon: Layout, color: 'text-purple-600' },
      { type: 'grid', label: 'Grid', icon: Grid, color: 'text-orange-600' },
      { type: 'tabs', label: 'Abas', icon: FileText, color: 'text-red-600' },
      { type: 'accordion', label: 'Acordeão', icon: Layers, color: 'text-pink-600' }
    ],
    'Dados': [
      { type: 'table', label: 'Tabela', icon: Table, color: 'text-blue-600' },
      { type: 'chart', label: 'Gráfico', icon: BarChart3, color: 'text-green-600' },
      { type: 'progress', label: 'Progresso', icon: BarChart3, color: 'text-purple-600' },
      { type: 'stats', label: 'Estatísticas', icon: BarChart3, color: 'text-orange-600' },
      { type: 'timeline', label: 'Linha do Tempo', icon: Calendar, color: 'text-red-600' }
    ],
    'Apresentação': [
      { type: 'slide_title', label: 'Título de Slide', icon: Type, color: 'text-blue-600' },
      { type: 'bullet_points', label: 'Tópicos', icon: ListIcon, color: 'text-green-600' },
      { type: 'feature_comparison', label: 'Comparação', icon: Table, color: 'text-purple-600' },
      { type: 'process_flow', label: 'Fluxo', icon: Zap, color: 'text-orange-600' },
      { type: 'before_after', label: 'Antes/Depois', icon: Eye, color: 'text-red-600' },
      { type: 'testimonial', label: 'Depoimento', icon: MessageSquare, color: 'text-pink-600' }
    ],
    'Interativo': [
      { type: 'quiz', label: 'Quiz', icon: Star, color: 'text-blue-600' },
      { type: 'exercise', label: 'Exercício', icon: Zap, color: 'text-green-600' },
      { type: 'flashcard', label: 'Flashcard', icon: FileText, color: 'text-purple-600' },
      { type: 'poll', label: 'Enquete', icon: Users, color: 'text-orange-600' },
      { type: 'rating', label: 'Avaliação', icon: Star, color: 'text-red-600' }
    ],
    'Avançado': [
      { type: 'map', label: 'Mapa', icon: MapPin, color: 'text-blue-600' },
      { type: 'calendar', label: 'Calendário', icon: Calendar, color: 'text-green-600' },
      { type: 'code_editor', label: 'Editor de Código', icon: Code, color: 'text-purple-600' },
      { type: 'chat_widget', label: 'Chat', icon: MessageSquare, color: 'text-orange-600' },
      { type: '360_view', label: 'Visão 360°', icon: Eye, color: 'text-red-600' }
    ]
  };

  const addBlock = useCallback((type: string) => {
    const newBlock: ContentBlock = createDefaultBlock(type);
    const newBlocks = [...contentBlocks, newBlock];
    onChange(newBlocks);
    setSelectedBlock(newBlocks.length - 1);
    toast({
      title: 'Elemento adicionado',
      description: `Novo elemento "${type}" foi adicionado.`,
    });
  }, [contentBlocks, onChange, toast]);

  const createDefaultBlock = (type: string): ContentBlock => {
    switch (type) {
      case 'heading':
        return { type: 'heading', level: 1, text: 'Novo Título' };
      case 'paragraph':
        return { type: 'paragraph', text: 'Digite seu texto aqui...' };
      case 'list':
        return { type: 'list', style: 'bullet', items: ['Item 1', 'Item 2', 'Item 3'] };
      case 'image':
        return { type: 'image', url: '', alt: 'Descrição da imagem' };
      case 'video':
        return { type: 'video', url: '', platform: 'youtube', title: 'Título do vídeo' };
      case 'table':
        return { type: 'table', headers: ['Coluna 1', 'Coluna 2', 'Coluna 3'], rows: [['Dado 1', 'Dado 2', 'Dado 3']] };
      case 'card':
        return { type: 'card', title: 'Título do Card', content: [{ type: 'paragraph', text: 'Conteúdo do card...' }] };
      case 'columns':
        return { type: 'columns', columns: [
          { content: [{ type: 'paragraph', text: 'Coluna 1' }] },
          { content: [{ type: 'paragraph', text: 'Coluna 2' }] }
        ] };
      case 'slide_title':
        return { type: 'slide_title', title: 'Título da Apresentação', subtitle: 'Subtítulo' };
      case 'bullet_points':
        return { type: 'bullet_points', points: ['Ponto 1', 'Ponto 2', 'Ponto 3'] };
      case 'quiz':
        return { type: 'quiz', questions: [] };
      case 'chart':
        return { type: 'chart', type: 'bar', data: { labels: ['A', 'B', 'C'], datasets: [{ data: [1, 2, 3] }] }, title: 'Gráfico' };
      default:
        return { type: 'paragraph', text: 'Novo elemento' };
    }
  };

  const updateBlock = useCallback((index: number, updatedBlock: ContentBlock) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  }, [contentBlocks, onChange]);

  const deleteBlock = useCallback((index: number) => {
    const newBlocks = contentBlocks.filter((_, i) => i !== index);
    onChange(newBlocks);
    setSelectedBlock(null);
    toast({
      title: 'Elemento removido',
      description: 'O elemento foi removido com sucesso.',
    });
  }, [contentBlocks, onChange, toast]);

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === contentBlocks.length - 1) return;

    const newBlocks = [...contentBlocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
    setSelectedBlock(newIndex);
  }, [contentBlocks, onChange]);

  const duplicateBlock = useCallback((index: number) => {
    const newBlocks = [...contentBlocks];
    const duplicatedBlock = JSON.parse(JSON.stringify(newBlocks[index]));
    newBlocks.splice(index + 1, 0, duplicatedBlock);
    onChange(newBlocks);
    setSelectedBlock(index + 1);
    toast({
      title: 'Elemento duplicado',
      description: 'O elemento foi duplicado com sucesso.',
    });
  }, [contentBlocks, onChange, toast]);

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    if (selectedBlock !== index) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Editar {block.type}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {block.type === 'heading' && (
            <>
              <div>
                <Label>Texto</Label>
                <Input
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  placeholder="Digite o título..."
                />
              </div>
              <div>
                <Label>Nível</Label>
                <Select value={block.level.toString()} onValueChange={(value) => updateBlock(index, { ...block, level: parseInt(value) as 1 | 2 | 3 | 4 })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1 - Principal</SelectItem>
                    <SelectItem value="2">H2 - Secundário</SelectItem>
                    <SelectItem value="3">H3 - Terciário</SelectItem>
                    <SelectItem value="4">H4 - Quaternário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {block.type === 'paragraph' && (
            <div>
              <Label>Texto</Label>
              <Textarea
                value={block.text}
                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                placeholder="Digite o texto..."
                rows={4}
              />
            </div>
          )}

          {block.type === 'image' && (
            <>
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={block.url}
                  onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <Label>Texto Alternativo</Label>
                <Input
                  value={block.alt || ''}
                  onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                  placeholder="Descrição da imagem"
                />
              </div>
              <div>
                <Label>Tamanho</Label>
                <Select value={block.size || 'medium'} onValueChange={(value) => updateBlock(index, { ...block, size: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="full">Largura Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {block.type === 'video' && (
            <>
              <div>
                <Label>URL do Vídeo</Label>
                <Input
                  value={block.url}
                  onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label>Plataforma</Label>
                <Select value={block.platform || 'youtube'} onValueChange={(value) => updateBlock(index, { ...block, platform: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="direct">URL Direta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={block.autoplay || false}
                  onCheckedChange={(checked) => updateBlock(index, { ...block, autoplay: checked })}
                />
                <Label>Reproduzir automaticamente</Label>
              </div>
            </>
          )}

          {block.type === 'slide_title' && (
            <>
              <div>
                <Label>Título</Label>
                <Input
                  value={block.title}
                  onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                  placeholder="Título da apresentação"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={block.subtitle || ''}
                  onChange={(e) => updateBlock(index, { ...block, subtitle: e.target.value })}
                  placeholder="Subtítulo (opcional)"
                />
              </div>
              <div>
                <Label>Alinhamento</Label>
                <Select value={block.alignment || 'center'} onValueChange={(value) => updateBlock(index, { ...block, alignment: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {block.type === 'bullet_points' && (
            <>
              <div>
                <Label>Título (opcional)</Label>
                <Input
                  value={block.title || ''}
                  onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                  placeholder="Título dos tópicos"
                />
              </div>
              <div>
                <Label>Estilo</Label>
                <Select value={block.style || 'default'} onValueChange={(value) => updateBlock(index, { ...block, style: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="numbered">Numerado</SelectItem>
                    <SelectItem value="icons">Com Ícones</SelectItem>
                    <SelectItem value="animated">Animado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tópicos</Label>
                {block.points.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex gap-2 mt-2">
                    <Input
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...block.points];
                        newPoints[pointIndex] = e.target.value;
                        updateBlock(index, { ...block, points: newPoints });
                      }}
                      placeholder={`Tópico ${pointIndex + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPoints = block.points.filter((_, i) => i !== pointIndex);
                        updateBlock(index, { ...block, points: newPoints });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPoints = [...block.points, `Tópico ${block.points.length + 1}`];
                    updateBlock(index, { ...block, points: newPoints });
                  }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tópico
                </Button>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteBlock(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateBlock(index)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBlockPreview = (block: ContentBlock, index: number) => {
    const isSelected = selectedBlock === index;
    
    return (
      <div
        key={index}
        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => setSelectedBlock(index)}
      >
        {/* Controles do bloco */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              moveBlock(index, 'up');
            }}
            disabled={index === 0}
          >
            <MoveUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              moveBlock(index, 'down');
            }}
            disabled={index === contentBlocks.length - 1}
          >
            <MoveDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(index);
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(index);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Preview do conteúdo */}
        <div className="pr-20">
          {block.type === 'heading' && (
            <div className={`font-bold ${block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg'}`}>
              {block.text || 'Título'}
            </div>
          )}
          
          {block.type === 'paragraph' && (
            <p className="text-gray-700">{block.text || 'Parágrafo'}</p>
          )}
          
          {block.type === 'image' && (
            <div className="text-center p-4 bg-gray-100 rounded">
              {block.url ? (
                <img src={block.url} alt={block.alt} className="max-w-full h-32 object-cover rounded" />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  <Image className="h-8 w-8" />
                  <span className="ml-2">Imagem</span>
                </div>
              )}
            </div>
          )}
          
          {block.type === 'video' && (
            <div className="text-center p-4 bg-gray-100 rounded">
              <Video className="h-8 w-8 mx-auto text-gray-500" />
              <p className="text-sm text-gray-600 mt-2">{block.title || 'Vídeo'}</p>
            </div>
          )}
          
          {block.type === 'slide_title' && (
            <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <h1 className="text-3xl font-bold mb-2">{block.title || 'Título da Apresentação'}</h1>
              {block.subtitle && <p className="text-xl opacity-90">{block.subtitle}</p>}
            </div>
          )}
          
          {block.type === 'bullet_points' && (
            <div>
              {block.title && <h3 className="font-semibold mb-2">{block.title}</h3>}
              <ul className="space-y-1">
                {block.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{point || `Tópico ${i + 1}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {block.type === 'table' && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr>
                    {block.headers.map((header, i) => (
                      <th key={i} className="border border-gray-300 px-3 py-2 bg-gray-100 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="border border-gray-300 px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {block.type === 'card' && (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              {block.title && <h3 className="font-semibold mb-2">{block.title}</h3>}
              <p className="text-gray-600">Conteúdo do card...</p>
            </div>
          )}
        </div>

        {/* Badge do tipo */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {block.type}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar Superior */}
      {showToolbar && (
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('edit')}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('preview')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button
                variant={viewMode === 'presentation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('presentation')}
              >
                <Maximize className="h-4 w-4 mr-2" />
                Apresentação
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
              <Layout className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowToolbar(!showToolbar)}>
              <Settings className="h-4 w-4" />
            </Button>
            {onSave && (
              <Button size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar de Elementos */}
        {showSidebar && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Elementos</h3>
              
              <Tabs defaultValue="Texto" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="Texto">Texto</TabsTrigger>
                  <TabsTrigger value="Mídia">Mídia</TabsTrigger>
                  <TabsTrigger value="Layout">Layout</TabsTrigger>
                </TabsList>
                
                {Object.entries(elementCategories).map(([category, elements]) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {elements.map((element) => (
                        <Button
                          key={element.type}
                          variant="outline"
                          size="sm"
                          className="h-auto p-3 flex flex-col items-center gap-2"
                          onClick={() => addBlock(element.type)}
                          disabled={readOnly}
                        >
                          <element.icon className={`h-5 w-5 ${element.color}`} />
                          <span className="text-xs text-center">{element.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}

        {/* Área Principal */}
        <div className="flex-1 flex flex-col">
          {/* Área de Conteúdo */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div 
              className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm min-h-full"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              {contentBlocks.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhum conteúdo ainda</p>
                    <p className="text-sm">Adicione elementos usando a barra lateral</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {contentBlocks.map((block, index) => (
                    <div key={index} className="group">
                      {renderBlockPreview(block, index)}
                      {renderBlockEditor(block, index)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 