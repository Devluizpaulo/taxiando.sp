'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles, Utensils, Mountain, Bed, Camera, CheckCircle, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import { generateTipWithAI } from '@/app/actions/city-guide-actions';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface AITipGeneratorDemoProps {
  onTipGenerated?: (tipData: any) => void;
}

const tipTypeIcons = {
  gastronomia: Utensils,
  'day-off': Mountain,
  pousada: Bed,
  turismo: Camera,
  outro: Lightbulb
};

const tipTypeColors = {
  gastronomia: 'bg-orange-100 text-orange-800 border-orange-200',
  'day-off': 'bg-green-100 text-green-800 border-green-200',
  pousada: 'bg-blue-100 text-blue-800 border-blue-200',
  turismo: 'bg-purple-100 text-purple-800 border-purple-200',
  outro: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function AITipGeneratorDemo({ onTipGenerated }: AITipGeneratorDemoProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [target, setTarget] = useState<'driver' | 'client'>('driver');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTip, setGeneratedTip] = useState<any>(null);
  const [detectionSteps, setDetectionSteps] = useState<string[]>([]);

  const examplePrompts = [
    'restaurante japonês barato na zona sul',
    'parque para relaxar no day off',
    'pousada econômica no litoral',
    'museu de arte moderna no centro',
    'café 24h com estacionamento',
    'shopping com cinema e restaurantes',
    'hotel com desconto para motoristas',
    'monumento histórico no centro'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Digite um prompt para gerar o conteúdo.' });
      return;
    }

    setIsGenerating(true);
    setDetectionSteps([]);
    setGeneratedTip(null);

    // Simular passos de detecção
    const steps = [
      'Analisando palavras-chave no prompt...',
      'Identificando categoria do estabelecimento...',
      'Detectando características específicas...',
      'Gerando campos personalizados...',
      'Criando descrição contextualizada...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setTimeout(() => {
        setDetectionSteps(prev => [...prev, steps[i]]);
      }, i * 800);
    }

    try {
      const result = await generateTipWithAI({ topic: prompt, target });
      
      if (result.success && result.data) {
        setGeneratedTip(result.data);
        
        // Trigger confetti after a delay
        setTimeout(() => {
          confetti({ 
            particleCount: 100, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']
          });
        }, 1000);

        toast({ 
          title: 'Dica gerada com sucesso!', 
          description: `Tipo detectado: ${result.data.tipType}. Campos específicos preenchidos automaticamente.` 
        });

        if (onTipGenerated) {
          onTipGenerated(result.data);
        }
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.error || 'Erro ao gerar dica' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
          <Brain className="h-8 w-8 text-blue-500" />
          IA Inteligente para Dicas
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descreva qualquer lugar e nossa IA detectará automaticamente o tipo, 
          preenchendo todos os campos específicos com informações relevantes.
        </p>
      </div>

      {/* Input Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Sparkles className="h-5 w-5" />
            Geração Inteligente de Dicas
          </CardTitle>
          <CardDescription>
            A IA analisa o prompt e detecta automaticamente o tipo de estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Público-alvo</Label>
              <Select value={target} onValueChange={(value: 'driver' | 'client') => setTarget(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">🚖 Motoristas</SelectItem>
                  <SelectItem value="client">🧳 Passageiros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Descreva o lugar</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: restaurante japonês barato na zona sul"
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Gerando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Gerar
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Exemplos de prompts:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left text-xs p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detection Steps */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Processando com IA...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {detectionSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Result */}
      {generatedTip && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Dica Gerada com Sucesso!
            </CardTitle>
            <CardDescription>
              A IA detectou automaticamente o tipo e preencheu os campos específicos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo Detectado */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tipo detectado:</span>
              {(() => {
                const IconComponent = tipTypeIcons[generatedTip.tipType as keyof typeof tipTypeIcons];
                return (
                  <Badge className={tipTypeColors[generatedTip.tipType as keyof typeof tipTypeColors]}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {generatedTip.tipType.replace('-', ' ')}
                  </Badge>
                );
              })()}
            </div>

            {/* Campos Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-gray-700 mt-1">{generatedTip.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {generatedTip.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <p className="text-sm text-gray-700 mt-1">{generatedTip.description}</p>
            </div>

            {/* Campos Específicos */}
            {generatedTip.specificFields && (
              <div>
                <Label className="text-sm font-medium">Campos Específicos Preenchidos</Label>
                <div className="mt-2 p-3 bg-white rounded border">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(generatedTip.specificFields, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  setGeneratedTip(null);
                  setPrompt('');
                  setDetectionSteps([]);
                }}
                variant="outline"
              >
                Gerar Nova Dica
              </Button>
              <Button 
                onClick={() => {
                  // Aqui você pode implementar a lógica para usar a dica gerada
                  toast({ title: 'Dica pronta!', description: 'Use os dados gerados no formulário principal.' });
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Usar Esta Dica
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona a IA</CardTitle>
          <CardDescription>
            O sistema analisa palavras-chave e contexto para detectar automaticamente o tipo de lugar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tipTypeIcons).map(([type, Icon]) => (
              <div key={type} className="text-center p-4 border rounded-lg">
                <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <h3 className="font-medium capitalize">{type.replace('-', ' ')}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {type === 'gastronomia' && 'Restaurantes, cafés, bares'}
                  {type === 'day-off' && 'Parques, shoppings, museus'}
                  {type === 'pousada' && 'Hotéis, hostels, resorts'}
                  {type === 'turismo' && 'Monumentos, atrações'}
                  {type === 'outro' && 'Outras categorias'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 