'use client';

import { useState } from 'react';
import { AdvancedContentEditor } from '@/components/advanced-content-editor';
import { type ContentBlock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Download, Share2, Eye, Play, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdvancedEditorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      blockType: 'slide_title',
      title: 'Editor Avançado de Conteúdo',
      subtitle: 'Crie apresentações profissionais com múltiplos tipos de elementos',
      background: 'gradient-to-r from-blue-500 to-purple-600',
      textColor: 'white',
      alignment: 'center'
    },
    {
      blockType: 'heading',
      level: 2,
      text: 'Recursos Principais',
      style: 'accent'
    },
    {
      blockType: 'bullet_points',
      title: 'O que você pode fazer:',
      points: [
        'Adicionar diferentes tipos de conteúdo',
        'Editar elementos de forma intuitiva',
        'Organizar slides como no PowerPoint',
        'Criar apresentações interativas',
        'Exportar em múltiplos formatos'
      ],
      style: 'icons',
      icon: 'check'
    },
    {
      blockType: 'image',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
      alt: 'Editor de apresentações',
      caption: 'Interface moderna e intuitiva',
      style: 'rounded',
      size: 'large'
    },
    {
      blockType: 'paragraph',
      text: 'Este editor oferece uma experiência similar ao PowerPoint, mas com recursos avançados para criação de conteúdo educacional e apresentações profissionais.',
      style: 'highlight'
    }
  ]);

  const handleSave = () => {
    toast({
      title: 'Conteúdo salvo!',
      description: 'Sua apresentação foi salva com sucesso.',
    });
  };

  const handleExport = (format: string) => {
    toast({
      title: 'Exportando...',
      description: `Sua apresentação está sendo exportada em formato ${format.toUpperCase()}.`,
    });
  };

  const handlePreview = () => {
    toast({
      title: 'Modo de visualização',
      description: 'Alterando para modo de visualização.',
    });
  };

  const handlePresentation = () => {
    toast({
      title: 'Modo de apresentação',
      description: 'Iniciando modo de apresentação em tela cheia.',
    });
  };

  const handleCreateCourse = () => {
    router.push('/admin/courses/create-with-editor');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header simplificado */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editor Avançado de Conteúdo</h1>
              <p className="text-gray-600 mt-1">
                Crie apresentações profissionais com múltiplos tipos de elementos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button variant="outline" onClick={handlePresentation}>
              <Play className="h-4 w-4 mr-2" />
              Apresentar
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Criar Curso
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      {/* Editor principal */}
      <div className="flex-1">
        <AdvancedContentEditor
          contentBlocks={contentBlocks}
          onChange={setContentBlocks}
          onSave={handleSave}
        />
      </div>

      {/* Info Panel simplificado */}
      <div className="bg-gray-50 border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Elementos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">50+</p>
                <p className="text-xs text-gray-500">Tipos de conteúdo diferentes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Elementos Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{contentBlocks.length}</p>
                <p className="text-xs text-gray-500">Elementos na apresentação</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium text-green-600">Salvo</p>
                </div>
                <p className="text-xs text-gray-500">Última modificação: agora</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 