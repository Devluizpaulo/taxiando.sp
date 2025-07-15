'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { summarizeTranscript, type SummarizeTranscriptOutput } from '@/ai/flows/summarize-transcript';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';

const formSchema = z.object({
  transcript: z.string().min(50, {
    message: 'O texto precisa ter pelo menos 50 caracteres.',
  }),
});

export default function SummarizePage() {
  const [summary, setSummary] = useState<SummarizeTranscriptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcript: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummary(null);
    try {
      const result = await summarizeTranscript({ transcript: values.transcript });
      setSummary(result);
    } catch (error) {
      console.error('Summarization failed:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Sumarização',
        description: 'Não foi possível gerar o resumo. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Sumarizador de Conteúdo</h1>
        <p className="text-muted-foreground">Cole o conteúdo de uma aula ou palestra para gerar um resumo com IA.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Texto Original</CardTitle>
            <CardDescription>Insira o texto que você deseja resumir abaixo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="transcript"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Transcrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole sua transcrição aqui..."
                          className="min-h-[300px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Resumo...
                    </>
                  ) : (
                    'Gerar Resumo'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Gerado por IA</CardTitle>
            <CardDescription>Os pontos chave do seu texto aparecerão aqui.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="mb-4 h-8 w-8 animate-spin" />
                <p>Analisando o texto...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none rounded-md bg-muted p-4">
                <p>{summary.summary}</p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-md border-2 border-dashed text-muted-foreground">
                <FileText className="mb-4 h-8 w-8" />
                <p>Seu resumo aparecerá aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
