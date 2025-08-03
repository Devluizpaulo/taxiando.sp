'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createCourseSuggestion } from '@/app/actions/course-suggestions-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send, Loader2 } from 'lucide-react';

export function CourseSuggestionForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userProfile) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Você precisa estar logado para enviar sugestões.',
      });
      return;
    }

    if (!suggestion.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campo obrigatório',
        description: 'Por favor, escreva sua sugestão de curso.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCourseSuggestion(
        user.uid,
        userProfile.name || 'Motorista',
        user.email || '',
        suggestion.trim()
      );

      if (result.success) {
        toast({
          title: 'Sugestão enviada!',
          description: 'Obrigado pela sua sugestão. Ela será analisada pela nossa equipe.',
        });
        setSuggestion('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar sua sugestão. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Sugerir um Curso
        </CardTitle>
        <CardDescription>
          Tem uma ideia para um curso? Conte para nós! Suas sugestões nos ajudam a criar conteúdo mais relevante para a comunidade de motoristas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="suggestion" className="text-sm font-medium">
              Sua sugestão de curso
            </label>
            <Textarea
              id="suggestion"
              placeholder="Ex: Gostaria de um curso sobre direção econômica e manutenção preventiva de veículos..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {suggestion.length}/500 caracteres
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>Dicas: Seja específico sobre o tema, público-alvo e benefícios do curso.</span>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !suggestion.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Sugestão
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 