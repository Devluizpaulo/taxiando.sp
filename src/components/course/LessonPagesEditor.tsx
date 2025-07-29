'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
    Plus, 
    Trash2, 
    Type, 
    Image, 
    Video, 
    FileText, 
    Headphones, 
    FileImage, 
    HelpCircle,
    Lightbulb,
    GripVertical,
    MoveUp,
    MoveDown,
    Settings,
    Eye,
    Clock
} from 'lucide-react';
import { type LessonPage } from '@/lib/types';
import { ContentBlocksEditor } from './ContentBlocksEditor';

interface LessonPagesEditorProps {
    pages: LessonPage[];
    onChange: (pages: LessonPage[]) => void;
}

export function LessonPagesEditor({ pages, onChange }: LessonPagesEditorProps) {
    const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

    const addPage = (type: LessonPage['type']) => {
        const newPage: LessonPage = {
            id: `page_${Date.now()}`,
            title: '',
            type,
            order: pages.length,
            duration: 5,
            contentBlocks: [],
            videoUrl: '',
            audioUrl: '',
            pdfUrl: '',
            galleryImages: [],
            questions: [],
            exercise: { question: '', answer: '', hints: [] },
            summary: '',
            observations: '',
            isCompleted: false,
            feedback: {
                thumbsUp: 0,
                thumbsDown: 0,
                comments: []
            }
        };
        
        onChange([...pages, newPage]);
        setSelectedPageIndex(pages.length);
    };

    const updatePage = (index: number, updatedPage: LessonPage) => {
        const newPages = [...pages];
        newPages[index] = updatedPage;
        onChange(newPages);
    };

    const removePage = (index: number) => {
        const newPages = pages.filter((_, i) => i !== index);
        // Reordenar as páginas restantes
        const reorderedPages = newPages.map((page, i) => ({
            ...page,
            order: i
        }));
        onChange(reorderedPages);
        setSelectedPageIndex(null);
    };

    const movePage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= pages.length) return;
        
        const newPages = [...pages];
        const [movedPage] = newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, movedPage);
        
        // Reordenar todas as páginas
        const reorderedPages = newPages.map((page, i) => ({
            ...page,
            order: i
        }));
        
        onChange(reorderedPages);
        setSelectedPageIndex(toIndex);
    };

    const getPageIcon = (type: LessonPage['type']) => {
        switch (type) {
            case 'text': return <Type className="h-4 w-4" />;
            case 'video': return <Video className="h-4 w-4" />;
            case 'audio': return <Headphones className="h-4 w-4" />;
            case 'pdf': return <FileText className="h-4 w-4" />;
            case 'gallery': return <FileImage className="h-4 w-4" />;
            case 'quiz': return <HelpCircle className="h-4 w-4" />;
            case 'exercise': return <Lightbulb className="h-4 w-4" />;
            case 'mixed': return <Settings className="h-4 w-4" />;
            default: return <Type className="h-4 w-4" />;
        }
    };

    const getPageLabel = (type: LessonPage['type']) => {
        switch (type) {
            case 'text': return 'Texto';
            case 'video': return 'Vídeo';
            case 'audio': return 'Áudio';
            case 'pdf': return 'PDF';
            case 'gallery': return 'Galeria';
            case 'quiz': return 'Quiz';
            case 'exercise': return 'Exercício';
            case 'mixed': return 'Misto';
            default: return 'Texto';
        }
    };

    const renderPageEditor = (page: LessonPage, index: number) => {
        if (selectedPageIndex !== index) return null;

        return (
            <Card className="mt-4 border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {getPageIcon(page.type)}
                        Editar Página {index + 1}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Informações básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`page-title-${index}`}>Título da Página</Label>
                            <Input
                                id={`page-title-${index}`}
                                value={page.title || ''}
                                onChange={(e) => updatePage(index, { ...page, title: e.target.value })}
                                placeholder="Digite o título da página"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`page-duration-${index}`}>Duração (minutos)</Label>
                            <Input
                                id={`page-duration-${index}`}
                                type="number"
                                value={page.duration || 5}
                                onChange={(e) => updatePage(index, { ...page, duration: parseInt(e.target.value) || 5 })}
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Resumo e observações */}
                    <div className="space-y-2">
                        <Label htmlFor={`page-summary-${index}`}>Resumo da Página</Label>
                        <Textarea
                            id={`page-summary-${index}`}
                            value={page.summary || ''}
                            onChange={(e) => updatePage(index, { ...page, summary: e.target.value })}
                            placeholder="Breve descrição do conteúdo desta página"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`page-observations-${index}`}>Observações Importantes</Label>
                        <Textarea
                            id={`page-observations-${index}`}
                            value={page.observations || ''}
                            onChange={(e) => updatePage(index, { ...page, observations: e.target.value })}
                            placeholder="Dicas, observações ou explicações adicionais"
                            rows={2}
                        />
                    </div>

                    {/* Conteúdo específico por tipo */}
                    {renderPageContent(page, index)}
                </CardContent>
            </Card>
        );
    };

    const renderPageContent = (page: LessonPage, index: number) => {
        switch (page.type) {
            case 'text':
            case 'mixed':
                return (
                    <div className="space-y-2">
                        <Label>Conteúdo da Página</Label>
                        <ContentBlocksEditor
                            contentBlocks={page.contentBlocks || []}
                            onChange={(blocks) => updatePage(index, { ...page, contentBlocks: blocks })}
                        />
                    </div>
                );

            case 'video':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`page-video-${index}`}>URL do Vídeo</Label>
                        <Input
                            id={`page-video-${index}`}
                            value={page.videoUrl || ''}
                            onChange={(e) => updatePage(index, { ...page, videoUrl: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>
                );

            case 'audio':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`page-audio-${index}`}>URL do Áudio</Label>
                        <Input
                            id={`page-audio-${index}`}
                            value={page.audioUrl || ''}
                            onChange={(e) => updatePage(index, { ...page, audioUrl: e.target.value })}
                            placeholder="https://exemplo.com/audio.mp3"
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`page-pdf-${index}`}>URL do PDF</Label>
                        <Input
                            id={`page-pdf-${index}`}
                            value={page.pdfUrl || ''}
                            onChange={(e) => updatePage(index, { ...page, pdfUrl: e.target.value })}
                            placeholder="https://exemplo.com/documento.pdf"
                        />
                    </div>
                );

            case 'gallery':
                return (
                    <div className="space-y-2">
                        <Label>Imagens da Galeria</Label>
                        <div className="space-y-2">
                            {(page.galleryImages || []).map((image, imgIndex) => (
                                <div key={imgIndex} className="flex gap-2">
                                    <Input
                                        value={image.url || ''}
                                        onChange={(e) => {
                                            const newImages = [...(page.galleryImages || [])];
                                            newImages[imgIndex] = { ...image, url: e.target.value };
                                            updatePage(index, { ...page, galleryImages: newImages });
                                        }}
                                        placeholder="URL da imagem"
                                    />
                                    <Input
                                        value={image.alt || ''}
                                        onChange={(e) => {
                                            const newImages = [...(page.galleryImages || [])];
                                            newImages[imgIndex] = { ...image, alt: e.target.value };
                                            updatePage(index, { ...page, galleryImages: newImages });
                                        }}
                                        placeholder="Texto alternativo"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newImages = (page.galleryImages || []).filter((_, i) => i !== imgIndex);
                                            updatePage(index, { ...page, galleryImages: newImages });
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
                                    const newImages = [...(page.galleryImages || []), { url: '', alt: '', caption: '' }];
                                    updatePage(index, { ...page, galleryImages: newImages });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Imagem
                            </Button>
                        </div>
                    </div>
                );

            case 'quiz':
                return (
                    <div className="space-y-2">
                        <Label>Questões do Quiz</Label>
                        <div className="text-sm text-muted-foreground">
                            Use o editor de blocos de conteúdo para adicionar questões de quiz.
                        </div>
                        <ContentBlocksEditor
                            contentBlocks={page.contentBlocks || []}
                            onChange={(blocks) => updatePage(index, { ...page, contentBlocks: blocks })}
                        />
                    </div>
                );

            case 'exercise':
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor={`page-question-${index}`}>Pergunta do Exercício</Label>
                            <Textarea
                                id={`page-question-${index}`}
                                value={page.exercise?.question || ''}
                                onChange={(e) => updatePage(index, {
                                    ...page,
                                    exercise: { 
                                        question: e.target.value,
                                        answer: page.exercise?.answer || '',
                                        hints: page.exercise?.hints || []
                                    }
                                })}
                                placeholder="Digite a pergunta do exercício"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`page-answer-${index}`}>Resposta</Label>
                            <Textarea
                                id={`page-answer-${index}`}
                                value={page.exercise?.answer || ''}
                                onChange={(e) => updatePage(index, {
                                    ...page,
                                    exercise: { 
                                        question: page.exercise?.question || '',
                                        answer: e.target.value,
                                        hints: page.exercise?.hints || []
                                    }
                                })}
                                placeholder="Digite a resposta correta"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Páginas da Aula</h3>
                    <p className="text-sm text-muted-foreground">
                        Organize o conteúdo em múltiplas páginas com diferentes tipos de mídia
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select onValueChange={(value) => addPage(value as LessonPage['type'])}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Adicionar página" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">📝 Página de Texto</SelectItem>
                            <SelectItem value="video">🎥 Página de Vídeo</SelectItem>
                            <SelectItem value="audio">🎵 Página de Áudio</SelectItem>
                            <SelectItem value="pdf">📄 Página de PDF</SelectItem>
                            <SelectItem value="gallery">🖼️ Página de Galeria</SelectItem>
                            <SelectItem value="quiz">❓ Página de Quiz</SelectItem>
                            <SelectItem value="exercise">💡 Página de Exercício</SelectItem>
                            <SelectItem value="mixed">🔀 Página Mista</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Lista de páginas */}
            {pages.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h4 className="text-lg font-medium">Nenhuma página criada</h4>
                        <p className="text-sm text-muted-foreground">
                            Adicione a primeira página para começar a estruturar sua aula
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-2">
                    {pages.map((page, index) => (
                        <div key={page.id}>
                            <Card className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedPageIndex === index ? 'ring-2 ring-primary' : ''
                            }`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {index + 1}
                                                </Badge>
                                                {getPageIcon(page.type)}
                                                <span className="font-medium">{page.title || `Página ${index + 1}`}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {getPageLabel(page.type)}
                                            </Badge>
                                            {page.duration && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {page.duration}min
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPageIndex(selectedPageIndex === index ? null : index)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => movePage(index, index - 1)}
                                                disabled={index === 0}
                                            >
                                                <MoveUp className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => movePage(index, index + 1)}
                                                disabled={index === pages.length - 1}
                                            >
                                                <MoveDown className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePage(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Editor da página selecionada */}
                            {renderPageEditor(page, index)}
                        </div>
                    ))}
                </div>
            )}

            {/* Resumo */}
            {pages.length > 0 && (
                <Card className="bg-muted/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>
                                <strong>{pages.length}</strong> página{pages.length !== 1 ? 's' : ''} criada{pages.length !== 1 ? 's' : ''}
                            </span>
                            <span>
                                Duração total: <strong>{pages.reduce((total, page) => total + (page.duration || 0), 0)} minutos</strong>
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 