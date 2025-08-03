'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Plus, 
    Trash2, 
    Type, 
    Image, 
    Video, 
    FileText, 
    List, 
    Headphones, 
    FileImage, 
    HelpCircle,
    Lightbulb,
    GripVertical,
    Settings
} from 'lucide-react';
import { type ContentBlock } from '@/lib/types';

interface ContentBlocksEditorProps {
    contentBlocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

export function ContentBlocksEditor({ contentBlocks, onChange }: ContentBlocksEditorProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const addBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock = (() => {
            switch (type) {
                case 'heading':
                    return { type: 'heading', level: 1, text: '' };
                case 'paragraph':
                    return { type: 'paragraph', text: '' };
                case 'list':
                    return { type: 'list', style: 'bullet', items: [''] };
                case 'image':
                    return { type: 'image', url: '', alt: '' };
                case 'video':
                    return { type: 'video', url: '', platform: 'youtube' };
                case 'audio':
                    return { type: 'audio', url: '', title: '' };
                case 'pdf':
                    return { type: 'pdf', url: '', title: '' };
                case 'gallery':
                    return { type: 'gallery', images: [{ url: '', alt: '', caption: '' }] };
                case 'exercise':
                    return { type: 'exercise', question: '', answer: '', hints: [] };
                case 'quiz':
                    return { type: 'quiz', questions: [] };
                case 'observation':
                    return { type: 'observation', text: '', icon: '💡' };
                case 'interactive_simulation':
                    return { 
                        type: 'interactive_simulation', 
                        title: '', 
                        description: '', 
                        scenario: '', 
                        options: [
                            { id: nanoid(), text: '', outcome: '', isCorrect: false },
                            { id: nanoid(), text: '', outcome: '', isCorrect: false }
                        ], 
                        feedback: '' 
                    };
                case 'case_study':
                    return { 
                        type: 'case_study', 
                        title: '', 
                        description: '', 
                        background: '', 
                        challenge: '', 
                        questions: [''], 
                        solution: '', 
                        keyLearnings: [] 
                    };
                case 'mind_map':
                    return { 
                        type: 'mind_map', 
                        title: '', 
                        centralTopic: '', 
                        branches: [{ id: nanoid(), text: '', subBranches: [] }] 
                    };
                case 'flashcard':
                    return { 
                        type: 'flashcard', 
                        front: '', 
                        back: '', 
                        category: '', 
                        difficulty: 'medium' 
                    };
                case 'timeline':
                    return { 
                        type: 'timeline', 
                        title: '', 
                        events: [
                            { id: nanoid(), date: '', title: '', description: '' },
                            { id: nanoid(), date: '', title: '', description: '' }
                        ] 
                    };
                case 'comparison_table':
                    return { 
                        type: 'comparison_table', 
                        title: '', 
                        columns: ['', ''], 
                        rows: [{ id: nanoid(), feature: '', values: ['', ''] }] 
                    };
                case 'fill_blanks':
                    return { 
                        type: 'fill_blanks', 
                        title: '', 
                        text: '', 
                        blanks: [{ id: nanoid(), correctAnswer: '', hints: [], alternatives: [] }] 
                    };
                case 'matching':
                    return { 
                        type: 'matching', 
                        title: '', 
                        leftItems: [
                            { id: nanoid(), text: '' },
                            { id: nanoid(), text: '' }
                        ], 
                        rightItems: [
                            { id: nanoid(), text: '', correctMatch: '' },
                            { id: nanoid(), text: '', correctMatch: '' }
                        ] 
                    };
                case 'drag_drop':
                    return { 
                        type: 'drag_drop', 
                        title: '', 
                        description: '', 
                        items: [
                            { id: nanoid(), text: '', correctZone: '' },
                            { id: nanoid(), text: '', correctZone: '' }
                        ], 
                        zones: [
                            { id: nanoid(), title: '', description: '' },
                            { id: nanoid(), title: '', description: '' }
                        ] 
                    };
                case 'hotspot':
                    return { 
                        type: 'hotspot', 
                        title: '', 
                        imageUrl: '', 
                        hotspots: [{ id: nanoid(), x: 50, y: 50, radius: 20, title: '', description: '', isCorrect: false }] 
                    };
                case 'word_search':
                    return { 
                        type: 'word_search', 
                        title: '', 
                        grid: Array(10).fill(null).map(() => Array(10).fill('A')), 
                        words: [
                            { id: nanoid(), word: '', direction: 'horizontal', startX: 0, startY: 0 },
                            { id: nanoid(), word: '', direction: 'vertical', startX: 0, startY: 0 },
                            { id: nanoid(), word: '', direction: 'diagonal', startX: 0, startY: 0 }
                        ] 
                    };
                case 'crossword':
                    return { 
                        type: 'crossword', 
                        title: '', 
                        grid: Array(10).fill(null).map(() => Array(10).fill({ letter: '', number: undefined, isBlack: false })), 
                        clues: { across: [], down: [] } 
                    };
                case 'scenario_builder':
                    return { 
                        type: 'scenario_builder', 
                        title: '', 
                        description: '', 
                        variables: [], 
                        outcomes: [{ id: nanoid(), condition: '', result: '', feedback: '' }] 
                    };
                default:
                    return { type: 'paragraph', text: '' };
            }
        })();
        
        onChange([...contentBlocks, newBlock]);
    };

    const updateBlock = (index: number, updatedBlock: ContentBlock) => {
        const newBlocks = [...contentBlocks];
        newBlocks[index] = updatedBlock;
        onChange(newBlocks);
    };

    const removeBlock = (index: number) => {
        const newBlocks = contentBlocks.filter((_, i) => i !== index);
        onChange(newBlocks);
    };

    const moveBlock = (fromIndex: number, toIndex: number) => {
        const newBlocks = [...contentBlocks];
        const [movedBlock] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, movedBlock);
        onChange(newBlocks);
    };

    const renderBlockEditor = (block: ContentBlock, index: number) => {
        switch (block.type) {
            case 'heading':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Select 
                                value={block.level.toString()} 
                                onValueChange={(value) => updateBlock(index, { ...block, level: parseInt(value) as 1 | 2 | 3 | 4 })}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">H1</SelectItem>
                                    <SelectItem value="2">H2</SelectItem>
                                    <SelectItem value="3">H3</SelectItem>
                                    <SelectItem value="4">H4</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                value={block.text || ''}
                                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                                placeholder="Digite o título..."
                                className="font-bold"
                            />
                        </div>
                    </div>
                );

            case 'paragraph':
                return (
                    <Textarea
                        value={block.text || ''}
                        onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                        placeholder="Digite o texto do parágrafo..."
                        rows={3}
                    />
                );

            case 'list':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Select 
                                value={block.style} 
                                onValueChange={(value) => updateBlock(index, { ...block, style: value as 'bullet' | 'numbered' })}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bullet">Lista com marcadores</SelectItem>
                                    <SelectItem value="numbered">Lista numerada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {block.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground w-6">
                                    {block.style === 'numbered' ? `${itemIndex + 1}.` : '•'}
                                </span>
                                <Input
                                    value={item || ''}
                                    onChange={(e) => {
                                        const newItems = [...block.items];
                                        newItems[itemIndex] = e.target.value;
                                        updateBlock(index, { ...block, items: newItems });
                                    }}
                                    placeholder="Item da lista..."
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const newItems = block.items.filter((_, i) => i !== itemIndex);
                                        updateBlock(index, { ...block, items: newItems });
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                updateBlock(index, { ...block, items: [...block.items, ''] });
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Item
                        </Button>
                    </div>
                );

            case 'image':
                return (
                    <div className="space-y-2">
                        <Input
                            value={block.url || ''}
                            onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                            placeholder="URL da imagem..."
                        />
                        <Input
                            value={block.alt || ''}
                            onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                            placeholder="Texto alternativo (alt)..."
                        />
                        {block.url && (
                            <img src={block.url} alt={block.alt || 'Preview'} className="max-w-xs rounded-lg shadow" />
                        )}
                    </div>
                );

            case 'video':
                return (
                    <div className="space-y-2">
                        <Input
                            value={block.url || ''}
                            onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                            placeholder="URL do vídeo (YouTube, Vimeo ou direto)..."
                        />
                        <div className="flex gap-2">
                            <Select 
                                value={block.platform || 'youtube'} 
                                onValueChange={(value) => updateBlock(index, { ...block, platform: value as 'youtube' | 'vimeo' | 'direct' })}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="vimeo">Vimeo</SelectItem>
                                    <SelectItem value="direct">Upload direto</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                value={block.title || ''}
                                onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                                placeholder="Título do vídeo..."
                            />
                        </div>
                    </div>
                );

            case 'audio':
                return (
                    <div className="space-y-2">
                        <Input
                            value={block.url || ''}
                            onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                            placeholder="URL do arquivo de áudio..."
                        />
                        <Input
                            value={block.title || ''}
                            onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                            placeholder="Título do áudio..."
                        />
                        <Input
                            type="number"
                            value={block.duration || ''}
                            onChange={(e) => updateBlock(index, { ...block, duration: parseInt(e.target.value) || undefined })}
                            placeholder="Duração em segundos..."
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="space-y-2">
                        <Input
                            value={block.url || ''}
                            onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                            placeholder="URL do arquivo PDF..."
                        />
                        <Input
                            value={block.title || ''}
                            onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                            placeholder="Título do PDF..."
                        />
                        <Input
                            value={block.filename || ''}
                            onChange={(e) => updateBlock(index, { ...block, filename: e.target.value })}
                            placeholder="Nome do arquivo..."
                        />
                    </div>
                );

            case 'gallery':
                return (
                    <div className="space-y-2">
                        {block.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Imagem {imageIndex + 1}</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newImages = block.images.filter((_, i) => i !== imageIndex);
                                            updateBlock(index, { ...block, images: newImages });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Input
                                    value={image.url || ''}
                                    onChange={(e) => {
                                        const newImages = [...block.images];
                                        newImages[imageIndex] = { ...image, url: e.target.value };
                                        updateBlock(index, { ...block, images: newImages });
                                    }}
                                    placeholder="URL da imagem..."
                                />
                                <Input
                                    value={image.alt || ''}
                                    onChange={(e) => {
                                        const newImages = [...block.images];
                                        newImages[imageIndex] = { ...image, alt: e.target.value };
                                        updateBlock(index, { ...block, images: newImages });
                                    }}
                                    placeholder="Texto alternativo..."
                                />
                                <Input
                                    value={image.caption || ''}
                                    onChange={(e) => {
                                        const newImages = [...block.images];
                                        newImages[imageIndex] = { ...image, caption: e.target.value };
                                        updateBlock(index, { ...block, images: newImages });
                                    }}
                                    placeholder="Legenda..."
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                updateBlock(index, { 
                                    ...block, 
                                    images: [...block.images, { url: '', alt: '', caption: '' }] 
                                });
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Imagem
                        </Button>
                    </div>
                );

            case 'exercise':
                return (
                    <div className="space-y-2">
                        <Textarea
                            value={block.question || ''}
                            onChange={(e) => updateBlock(index, { ...block, question: e.target.value })}
                            placeholder="Pergunta do exercício..."
                            rows={2}
                        />
                        <Textarea
                            value={block.answer || ''}
                            onChange={(e) => updateBlock(index, { ...block, answer: e.target.value })}
                            placeholder="Resposta do exercício..."
                            rows={2}
                        />
                        <div className="space-y-1">
                            <Label>Dicas (opcional)</Label>
                            {(block.hints || []).map((hint, hintIndex) => (
                                <div key={hintIndex} className="flex items-center gap-2">
                                    <Input
                                        value={hint || ''}
                                        onChange={(e) => {
                                            const newHints = [...(block.hints || [])];
                                            newHints[hintIndex] = e.target.value;
                                            updateBlock(index, { ...block, hints: newHints });
                                        }}
                                        placeholder="Dica..."
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newHints = (block.hints || []).filter((_, i) => i !== hintIndex);
                                            updateBlock(index, { ...block, hints: newHints });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    updateBlock(index, { 
                                        ...block, 
                                        hints: [...(block.hints || []), ''] 
                                    });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Dica
                            </Button>
                        </div>
                    </div>
                );

            case 'observation':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Input
                                value={block.icon || '💡'}
                                onChange={(e) => updateBlock(index, { ...block, icon: e.target.value })}
                                placeholder="Emoji ou ícone..."
                                className="w-16"
                            />
                            <Textarea
                                value={block.text || ''}
                                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                                placeholder="Observação importante em tom didático..."
                                rows={2}
                            />
                        </div>
                    </div>
                );

            // Novos elementos educativos - renderizar editores específicos
            case 'interactive_simulation':
            case 'case_study':
            case 'timeline':
            case 'fill_blanks':
            case 'mind_map':
            case 'flashcard':
            case 'comparison_table':
            case 'matching':
            case 'drag_drop':
            case 'hotspot':
            case 'word_search':
            case 'crossword':
            case 'scenario_builder':
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">
                                    {block.type === 'interactive_simulation' && '🎮'}
                                    {block.type === 'case_study' && '📋'}
                                    {block.type === 'timeline' && '📅'}
                                    {block.type === 'fill_blanks' && '✏️'}
                                    {block.type === 'mind_map' && '🧠'}
                                    {block.type === 'flashcard' && '🃏'}
                                    {block.type === 'comparison_table' && '📊'}
                                    {block.type === 'matching' && '🔗'}
                                    {block.type === 'drag_drop' && '🎯'}
                                    {block.type === 'hotspot' && '📍'}
                                    {block.type === 'word_search' && '🔍'}
                                    {block.type === 'crossword' && '📝'}
                                    {block.type === 'scenario_builder' && '🎭'}
                                </span>
                                <h4 className="font-medium">
                                    {getBlockLabel(block.type)}
                                </h4>
                            </div>
                            <p className="text-sm text-blue-700">
                                Este elemento educativo será configurado no editor específico.
                                Use o botão "Configurar Elemento" abaixo para editar detalhadamente.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Input
                                value={'title' in block ? block.title || '' : ''}
                                onChange={(e) => {
                                    if ('title' in block) {
                                        updateBlock(index, { ...block, title: e.target.value });
                                    }
                                }}
                                placeholder="Título do elemento..."
                            />
                            <Textarea
                                value={'description' in block ? block.description || '' : ''}
                                onChange={(e) => {
                                    if ('description' in block) {
                                        updateBlock(index, { ...block, description: e.target.value });
                                    }
                                }}
                                placeholder="Descrição breve..."
                                rows={2}
                            />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                // Aqui você pode abrir um modal ou navegar para o editor específico
                                console.log('Abrir editor específico para:', block.type);
                            }}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar Elemento Detalhadamente
                        </Button>
                    </div>
                );

            default:
                return <div>Tipo de bloco não suportado</div>;
        }
    };

    const getBlockIcon = (type: ContentBlock['type']) => {
        switch (type) {
            case 'heading': return <Type className="h-4 w-4" />;
            case 'paragraph': return <FileText className="h-4 w-4" />;
            case 'list': return <List className="h-4 w-4" />;
            case 'image': return <Image className="h-4 w-4" />;
            case 'video': return <Video className="h-4 w-4" />;
            case 'audio': return <Headphones className="h-4 w-4" />;
            case 'pdf': return <FileText className="h-4 w-4" />;
            case 'gallery': return <FileImage className="h-4 w-4" />;
            case 'exercise': return <HelpCircle className="h-4 w-4" />;
            case 'observation': return <Lightbulb className="h-4 w-4" />;
            case 'interactive_simulation': return <span className="text-lg">🎮</span>;
            case 'case_study': return <span className="text-lg">📋</span>;
            case 'mind_map': return <span className="text-lg">🧠</span>;
            case 'flashcard': return <span className="text-lg">🃏</span>;
            case 'timeline': return <span className="text-lg">📅</span>;
            case 'comparison_table': return <span className="text-lg">📊</span>;
            case 'fill_blanks': return <span className="text-lg">✏️</span>;
            case 'matching': return <span className="text-lg">🔗</span>;
            case 'drag_drop': return <span className="text-lg">🎯</span>;
            case 'hotspot': return <span className="text-lg">📍</span>;
            case 'word_search': return <span className="text-lg">🔍</span>;
            case 'crossword': return <span className="text-lg">📝</span>;
            case 'scenario_builder': return <span className="text-lg">🎭</span>;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getBlockLabel = (type: ContentBlock['type']) => {
        switch (type) {
            case 'heading': return 'Título';
            case 'paragraph': return 'Texto';
            case 'list': return 'Lista';
            case 'image': return 'Imagem';
            case 'video': return 'Vídeo';
            case 'audio': return 'Áudio';
            case 'pdf': return 'PDF';
            case 'gallery': return 'Galeria';
            case 'exercise': return 'Exercício';
            case 'observation': return 'Observação';
            case 'interactive_simulation': return 'Simulação Interativa';
            case 'case_study': return 'Estudo de Caso';
            case 'mind_map': return 'Mapa Mental';
            case 'flashcard': return 'Flashcard';
            case 'timeline': return 'Linha do Tempo';
            case 'comparison_table': return 'Tabela Comparativa';
            case 'fill_blanks': return 'Preencher Lacunas';
            case 'matching': return 'Correspondência';
            case 'drag_drop': return 'Arrastar e Soltar';
            case 'hotspot': return 'Hotspot';
            case 'word_search': return 'Caça-Palavras';
            case 'crossword': return 'Palavras Cruzadas';
            case 'scenario_builder': return 'Construtor de Cenários';
            default: return 'Bloco';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Blocos de Conteúdo</h3>
                <div className="flex gap-2">
                    <Select onValueChange={(value) => addBlock(value as ContentBlock['type'])}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Adicionar bloco..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="heading">Título</SelectItem>
                            <SelectItem value="paragraph">Texto</SelectItem>
                            <SelectItem value="list">Lista</SelectItem>
                            <SelectItem value="image">Imagem</SelectItem>
                            <SelectItem value="video">Vídeo</SelectItem>
                            <SelectItem value="audio">Áudio</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="gallery">Galeria</SelectItem>
                            <SelectItem value="exercise">Exercício</SelectItem>
                            <SelectItem value="observation">Observação</SelectItem>
                            <SelectItem value="interactive_simulation">🎮 Simulação Interativa</SelectItem>
                            <SelectItem value="case_study">📋 Estudo de Caso</SelectItem>
                            <SelectItem value="mind_map">🧠 Mapa Mental</SelectItem>
                            <SelectItem value="flashcard">🃏 Flashcard</SelectItem>
                            <SelectItem value="timeline">📅 Linha do Tempo</SelectItem>
                            <SelectItem value="comparison_table">📊 Tabela Comparativa</SelectItem>
                            <SelectItem value="fill_blanks">✏️ Preencher Lacunas</SelectItem>
                            <SelectItem value="matching">🔗 Correspondência</SelectItem>
                            <SelectItem value="drag_drop">🎯 Arrastar e Soltar</SelectItem>
                            <SelectItem value="hotspot">📍 Hotspot</SelectItem>
                            <SelectItem value="word_search">🔍 Caça-Palavras</SelectItem>
                            <SelectItem value="crossword">📝 Palavras Cruzadas</SelectItem>
                            <SelectItem value="scenario_builder">🎭 Construtor de Cenários</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                {contentBlocks.map((block, index) => (
                    <Card key={index} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    {getBlockIcon(block.type)}
                                    <Badge variant="outline">{getBlockLabel(block.type)}</Badge>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBlock(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {renderBlockEditor(block, index)}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {contentBlocks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum bloco de conteúdo adicionado ainda.</p>
                    <p className="text-sm">Clique em "Adicionar bloco" para começar.</p>
                </div>
            )}
        </div>
    );
} 