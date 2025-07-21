'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, MapPin, Star, Users } from 'lucide-react';
import { generateTipWithAI } from '@/app/actions/city-guide-actions';
import { useToast } from '@/hooks/use-toast';

interface GeneratedTip {
  title: string;
  description: string;
  category: string;
  location: string;
  priceRange?: string;
  mapUrl?: string;
}

export function AITipGeneratorDemo() {
  const [prompt, setPrompt] = useState('');
  const [target, setTarget] = useState<'driver' | 'client'>('driver');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTip, setGeneratedTip] = useState<GeneratedTip | null>(null);
  const { toast } = useToast();

  const examplePrompts = {
    driver: [
      "ponto de táxi movimentado na Avenida Paulista",
      "estacionamento gratuito no centro de São Paulo",
      "restaurante popular para almoço em Pinheiros",
      "shopping center com movimento intenso aos finais de semana",
      "hospital com entrada para táxis"
    ],
    client: [
      "restaurante japonês autêntico em Liberdade",
      "café com vista para o parque Ibirapuera",
      "loja de roupas vintage na Vila Madalena",
      "teatro com programação cultural diversificada",
      "padaria tradicional no bairro da Mooca"
    ]
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Digite um prompt para gerar o conteúdo.' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTipWithAI({
        topic: prompt,
        target: target,
      });

      if (result.success && result.data) {
        setGeneratedTip(result.data);
        toast({ 
          title: 'Conteúdo Gerado!', 
          description: 'A IA gerou o conteúdo da dica com sucesso.' 
        });
      } else {
        throw new Error(result.error || 'Erro ao gerar conteúdo');
      }
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Erro na IA', 
        description: (error as Error).message || 'Não foi possível gerar o conteúdo.' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Demonstração: IA para Dicas da Cidade</h1>
        <p className="text-muted-foreground">
          Teste a funcionalidade de geração de conteúdo com IA para dicas de São Paulo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Gerador de Dicas com IA
            </CardTitle>
            <CardDescription>
              Digite um prompt e veja como a IA gera conteúdo de qualidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Público-Alvo</Label>
              <RadioGroup value={target} onValueChange={(value) => setTarget(value as 'driver' | 'client')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="driver" id="driver" />
                  <Label htmlFor="driver" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Motorista
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Cliente
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Prompt para IA</Label>
              <Textarea
                placeholder="Ex: restaurante japonês em Pinheiros, ponto de táxi na Paulista..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Dica
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Exemplos de Prompts</Label>
              <div className="space-y-1">
                {examplePrompts[target].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="w-full justify-start text-left h-auto p-2"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado Gerado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Dica Gerada
            </CardTitle>
            <CardDescription>
              Conteúdo criado automaticamente pela IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedTip ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                  <p className="font-semibold text-lg">{generatedTip.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="text-sm leading-relaxed">{generatedTip.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p className="text-sm font-medium">{generatedTip.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Localização</Label>
                    <p className="text-sm font-medium">{generatedTip.location}</p>
                  </div>
                </div>

                {generatedTip.priceRange && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Faixa de Preço</Label>
                    <p className="text-sm font-medium">{generatedTip.priceRange}</p>
                  </div>
                )}

                {generatedTip.mapUrl && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">URL do Mapa</Label>
                    <p className="text-sm text-blue-600 break-all">{generatedTip.mapUrl}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Digite um prompt e clique em "Gerar Dica" para ver o resultado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold">Digite o Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Descreva o que você quer que a IA gere, seja específico sobre localização e contexto
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold">IA Processa</h3>
              <p className="text-sm text-muted-foreground">
                O modelo Gemini 2.0 Flash analisa o prompt e gera conteúdo contextualizado
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold">Resultado Completo</h3>
              <p className="text-sm text-muted-foreground">
                Receba título, descrição, categoria e localização prontos para uso
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 