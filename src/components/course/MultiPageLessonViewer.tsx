'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
    ChevronLeft, 
    ChevronRight, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX,
    Maximize,
    Clock,
    CheckCircle,
    Circle,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Type,
    Video,
    FileText,
    Headphones,
    FileImage,
    HelpCircle,
    Lightbulb,
    Settings
} from 'lucide-react';
import { type LessonPage, type Lesson } from '@/lib/types';
import { InteractiveVideoPlayer } from './interactive-video-player';

interface MultiPageLessonViewerProps {
    lesson: Lesson;
    onPageComplete?: (pageIndex: number) => void;
    onLessonComplete?: () => void;
    onFeedback?: (pageIndex: number, type: 'thumbsUp' | 'thumbsDown' | 'comment', value?: string) => void;
}

export function MultiPageLessonViewer({ 
    lesson, 
    onPageComplete, 
    onLessonComplete, 
    onFeedback 
}: MultiPageLessonViewerProps) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
    const [showObservations, setShowObservations] = useState(true);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const pages = lesson.pages || [];
    const currentPage = pages[currentPageIndex];
    const totalPages = pages.length;
    const progress = totalPages > 0 ? (completedPages.size / totalPages) * 100 : 0;

    useEffect(() => {
        // Reset state when lesson changes
        setCurrentPageIndex(0);
        setCompletedPages(new Set());
        setShowObservations(true);
        setAudioPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [lesson.id]);

    const handlePageComplete = () => {
        const newCompletedPages = new Set(completedPages);
        newCompletedPages.add(currentPageIndex);
        setCompletedPages(newCompletedPages);
        
        onPageComplete?.(currentPageIndex);
        
        // Auto advance if enabled
        if (lesson.settings?.autoAdvance && currentPageIndex < totalPages - 1) {
            setTimeout(() => {
                setCurrentPageIndex(currentPageIndex + 1);
            }, 1000);
        }
    };

    const handleNextPage = () => {
        if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            // Lesson completed
            onLessonComplete?.();
        }
    };

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    const canNavigateToPage = (pageIndex: number) => {
        if (!lesson.settings?.requireSequentialProgress) return true;
        return pageIndex === 0 || completedPages.has(pageIndex - 1);
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

    const renderPageContent = () => {
        if (!currentPage) return null;

        switch (currentPage.type) {
            case 'text':
            case 'mixed':
                return (
                    <div className="prose prose-sm max-w-none">
                        {currentPage.contentBlocks?.map((block, index) => (
                            <div key={index} className="mb-4">
                                {block.type === 'heading' && (
                                    <h3 style={{ fontSize: `${24 - block.level * 2}px` }}>
                                        {block.text}
                                    </h3>
                                )}
                                {block.type === 'paragraph' && (
                                    <p className="text-gray-700 leading-relaxed">{block.text}</p>
                                )}
                                {block.type === 'list' && (
                                    <ul className="list-disc pl-6 space-y-1">
                                        {block.items.map((item, i) => (
                                            <li key={i} className="text-gray-700">{item}</li>
                                        ))}
                                    </ul>
                                )}
                                {block.type === 'image' && (
                                    <div className="my-4">
                                        <img 
                                            src={block.url} 
                                            alt={block.alt || ''} 
                                            className="max-w-full h-auto rounded-lg shadow-md"
                                        />
                                    </div>
                                )}
                                {block.type === 'observation' && (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded-r-lg">
                                        <div className="flex items-start gap-2">
                                            <span className="text-2xl">{block.icon || '💡'}</span>
                                            <p className="text-blue-800 font-medium">{block.text}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'video':
                return currentPage.videoUrl ? (
                    <div className="my-4">
                        <InteractiveVideoPlayer 
                            videoUrl={currentPage.videoUrl}
                            observations={currentPage.observations}
                            showObservations={showObservations}
                            onObservationsToggle={() => setShowObservations(!showObservations)}
                        />
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        URL do vídeo não encontrada
                    </div>
                );

            case 'audio':
                return currentPage.audioUrl ? (
                    <div className="my-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setAudioPlaying(!audioPlaying)}
                                    >
                                        {audioPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                    </Button>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{currentPage.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            {currentPage.duration} minutos
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Volume2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <audio 
                                    src={currentPage.audioUrl}
                                    controls
                                    className="w-full mt-4"
                                    onPlay={() => setAudioPlaying(true)}
                                    onPause={() => setAudioPlaying(false)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        URL do áudio não encontrada
                    </div>
                );

            case 'pdf':
                return currentPage.pdfUrl ? (
                    <div className="my-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-medium">{currentPage.title}</h4>
                                        <p className="text-sm text-gray-500">Documento PDF</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Maximize className="h-4 w-4 mr-2" />
                                        Abrir em Nova Aba
                                    </Button>
                                </div>
                                <iframe
                                    src={currentPage.pdfUrl}
                                    className="w-full h-96 border rounded-lg"
                                    title={currentPage.title}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        URL do PDF não encontrada
                    </div>
                );

            case 'gallery':
                return currentPage.galleryImages && currentPage.galleryImages.length > 0 ? (
                    <div className="my-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentPage.galleryImages.map((image, index) => (
                                <div key={index} className="group relative">
                                    <img 
                                        src={image.url} 
                                        alt={image.alt || ''} 
                                        className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                                    />
                                    {image.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                                            <p className="text-sm">{image.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Nenhuma imagem encontrada na galeria
                    </div>
                );

            case 'quiz':
                return (
                    <div className="my-4">
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="font-medium mb-4">Quiz</h4>
                                <div className="text-center py-8 text-gray-500">
                                    Quiz em desenvolvimento
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'exercise':
                return currentPage.exercise ? (
                    <div className="my-4">
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="font-medium mb-4">Exercício</h4>
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-medium text-gray-700 mb-2">Pergunta:</h5>
                                        <p className="text-gray-600">{currentPage.exercise.question}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-2">Resposta:</h5>
                                        <p className="text-gray-600">{currentPage.exercise.answer}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Exercício não encontrado
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        Tipo de página não suportado
                    </div>
                );
        }
    };

    if (totalPages === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h4 className="text-lg font-medium">Nenhuma página encontrada</h4>
                        <p className="text-sm text-muted-foreground">
                            Esta aula não possui páginas configuradas
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho da aula */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{lesson.title}</CardTitle>
                            {lesson.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {lesson.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {totalPages} página{totalPages !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary">
                                {lesson.totalDuration} min
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Barra de progresso */}
            {lesson.settings?.showProgressBar && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progresso da Aula</span>
                            <span className="text-sm text-muted-foreground">
                                {completedPages.size} de {totalPages} páginas
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardContent>
                </Card>
            )}

            {/* Navegação de páginas */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={currentPageIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                        </Button>

                        <div className="flex items-center gap-2">
                            {pages.map((page, index) => (
                                <button
                                    key={page.id}
                                    onClick={() => canNavigateToPage(index) && setCurrentPageIndex(index)}
                                    disabled={!canNavigateToPage(index)}
                                    className={`p-2 rounded-full transition-colors ${
                                        index === currentPageIndex
                                            ? 'bg-primary text-primary-foreground'
                                            : completedPages.has(index)
                                            ? 'bg-green-100 text-green-700'
                                            : canNavigateToPage(index)
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={`${page.title || `Página ${index + 1}`} - ${getPageIcon(page.type).type.name}`}
                                >
                                    {completedPages.has(index) ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <Circle className="h-4 w-4" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPageIndex === totalPages - 1}
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Conteúdo da página atual */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getPageIcon(currentPage?.type || 'text')}
                            <div>
                                <CardTitle className="text-lg">
                                    {currentPage?.title || `Página ${currentPageIndex + 1}`}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Página {currentPageIndex + 1} de {totalPages}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {currentPage?.duration && (
                                <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {currentPage.duration} min
                                </Badge>
                            )}
                            {completedPages.has(currentPageIndex) && (
                                <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Concluída
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {renderPageContent()}
                </CardContent>
            </Card>

            {/* Observações importantes */}
            {currentPage?.observations && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1">Observações Importantes</h4>
                                <p className="text-blue-800 text-sm">{currentPage.observations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ações da página */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onFeedback?.(currentPageIndex, 'thumbsUp')}
                            >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Útil
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onFeedback?.(currentPageIndex, 'thumbsDown')}
                            >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Não Útil
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Comentar
                            </Button>
                        </div>

                        <Button
                            onClick={handlePageComplete}
                            disabled={completedPages.has(currentPageIndex)}
                            className="ml-auto"
                        >
                            {completedPages.has(currentPageIndex) ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Concluída
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Marcar como Concluída
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 