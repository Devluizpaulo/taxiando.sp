'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Sparkles, 
  Utensils, 
  Mountain, 
  Bed, 
  Camera, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Lightbulb,
  Wand2,
  Cpu,
  Palette,
  Moon,
  Car,
  ShoppingBag,
  TreePine,
  Users,
  Dog
} from 'lucide-react';
import { generateTipWithAI } from '@/app/actions/city-guide-actions';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface AIDemoSectionProps {
  onTipGenerated?: (tipData: any) => void;
}

const tipTypeIcons = {
  gastronomia: Utensils,
  'day-off': Mountain,
  pousada: Bed,
  turismo: Camera,
  cultura: Palette,
  nightlife: Moon,
  roteiros: Car,
  compras: ShoppingBag,
  aventura: TreePine,
  familia: Users,
  pet: Dog,
  outro: Lightbulb
};

const tipTypeColors = {
  gastronomia: 'bg-orange-100 text-orange-800 border-orange-200',
  'day-off': 'bg-green-100 text-green-800 border-green-200',
  pousada: 'bg-blue-100 text-blue-800 border-blue-200',
  turismo: 'bg-purple-100 text-purple-800 border-purple-200',
  cultura: 'bg-pink-100 text-pink-800 border-pink-200',
  nightlife: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  roteiros: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  compras: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aventura: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  familia: 'bg-rose-100 text-rose-800 border-rose-200',
  pet: 'bg-amber-100 text-amber-800 border-amber-200',
  outro: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function AIDemoSection({ onTipGenerated }: AIDemoSectionProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [target, setTarget] = useState<'driver' | 'client' | 'both'>('driver');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTip, setGeneratedTip] = useState<any>(null);
  const [detectionSteps, setDetectionSteps] = useState<string[]>([]);

  const examplePrompts = [
    'restaurante japonês barato na zona sul',
    'parque para relaxar no day off',
    'pousada econômica no litoral',
    'museu de arte moderna no centro',
    'bar com música ao vivo',
    'shopping com cinema e restaurantes',
    'trilha na serra da mantiqueira',
    'parque infantil com playground',
    'café que aceita pets',
    'roteiro histórico no centro'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Digite um prompt para gerar o conteúdo.' });
      return;
    }

    setIsGenerating(true);
    setDetectionSteps([]);
    setGeneratedTip(null);

    // Simular passos de detecção da IA real
    const steps = [
      'Conectando com IA do Google Gemini...',
      'Analisando contexto e palavras-chave...',
      'Detectando categoria do estabelecimento...',
      'Gerando campos específicos personalizados...',
      'Criando descrição contextualizada...',
      'Finalizando com tags e metadados...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setTimeout(() => {
        setDetectionSteps(prev => [...prev, steps[i]]);
      }, i * 600);
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
          title: 'Dica gerada com IA real!', 
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
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          IA Real - Google Gemini via Genkit
        </CardTitle>
        <CardDescription>
          Descreva o lugar e a IA detectará automaticamente o tipo e preencherá os campos específicos usando inteligência artificial real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Público-alvo</Label>
            <Select value={target} onValueChange={(value: 'driver' | 'client' | 'both') => setTarget(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driver">🚖 Motoristas</SelectItem>
                <SelectItem value="client">🧳 Passageiros</SelectItem>
                <SelectItem value="both">🤝 Ambos</SelectItem>
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
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Gerar com IA
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

        {/* Detection Steps */}
        {isGenerating && (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Processando com IA Real (Google Gemini)...</span>
            </div>
            <div className="space-y-2">
              {detectionSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Result */}
        {generatedTip && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 mb-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Dica Gerada com IA Real!</span>
            </div>
            
            <div className="space-y-3">
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
              {generatedTip.specificFields && Object.keys(generatedTip.specificFields).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Campos Específicos Gerados pela IA</Label>
                  <div className="mt-2 p-3 bg-white rounded border">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(generatedTip.specificFields, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => {
                    setGeneratedTip(null);
                    setPrompt('');
                    setDetectionSteps([]);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Gerar Nova Dica
                </Button>
                <Button 
                  onClick={() => {
                    toast({ title: 'Dica pronta!', description: 'Use os dados gerados no formulário principal.' });
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Usar Esta Dica
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info sobre a IA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Cpu className="h-4 w-4" />
            <span className="font-medium">IA Real em Ação</span>
          </div>
          <p className="text-sm text-blue-700">
            Esta funcionalidade usa a <strong>Google Gemini 2.0 Flash</strong> via Genkit para detectar automaticamente 
            o tipo de estabelecimento e gerar conteúdo contextualizado com base no seu prompt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 