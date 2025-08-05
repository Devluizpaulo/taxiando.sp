'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Trash2, Settings, Clock, RefreshCw, Shuffle, Eye, Award, 
  HelpCircle, CheckCircle, AlertCircle 
} from 'lucide-react';

// Remover os imports inexistentes
type IndividualQuizSchema = any; // Substituto temporário, ajuste conforme necessário

interface IndividualQuizEditorProps {
  value?: IndividualQuizSchema;
  onChange: (quiz: IndividualQuizSchema) => void;
  onRemove?: () => void;
}

export function IndividualQuizEditor({ 
  value, 
  onChange, 
  onRemove 
}: IndividualQuizEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<IndividualQuizSchema>({
    resolver: zodResolver(z.object({})), // Schema temporário
    defaultValues: value || {
      id: nanoid(),
      title: '',
      description: '',
      questions: [],
      passingScore: 70,
      timeLimit: undefined,
      allowRetry: true,
      maxRetries: 3,
      shuffleQuestions: false,
      showResults: true,
      certificateRequired: false,
      weight: 100,
    },
  });

  const { fields: questions, append: addQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const onSubmit = (data: IndividualQuizSchema) => {
    onChange(data);
  };

  const addNewQuestion = () => {
    addQuestion({
      id: nanoid(),
      question: '',
      options: [
        { id: nanoid(), text: '', isCorrect: false },
        { id: nanoid(), text: '', isCorrect: false },
        { id: nanoid(), text: '', isCorrect: false },
        { id: nanoid(), text: '', isCorrect: false },
      ],
    });
  };

  const removeQuestionById = (index: number) => {
    removeQuestion(index);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const currentQuestions = form.getValues('questions');
    currentQuestions[index] = { ...currentQuestions[index], [field]: value };
    form.setValue('questions', currentQuestions);
    form.handleSubmit(onSubmit)();
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const currentQuestions = form.getValues('questions');
    currentQuestions[questionIndex].options[optionIndex] = {
      ...currentQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    form.setValue('questions', currentQuestions);
    form.handleSubmit(onSubmit)();
  };

  const setCorrectOption = (questionIndex: number, correctOptionIndex: number) => {
    const currentQuestions = form.getValues('questions');
    currentQuestions[questionIndex].options.forEach((option: any, index: number) => {
      option.isCorrect = index === correctOptionIndex;
    });
    form.setValue('questions', currentQuestions);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Quiz Individual</CardTitle>
              <CardDescription>
                Configure uma prova específica com questões e critérios de aprovação
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Quiz</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Prova Final do Módulo 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso da Prova (%)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="1" 
                        max="100"
                        placeholder="100" 
                      />
                    </FormControl>
                    <FormDescription>
                      Peso desta prova no cálculo da nota final
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o conteúdo e objetivos desta prova..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Configurações Avançadas */}
            {isExpanded && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h4 className="font-medium">Configurações Avançadas</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nota Mínima para Aprovação (%)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            max="100"
                            placeholder="70" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Tempo (minutos)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            placeholder="Sem limite" 
                          />
                        </FormControl>
                        <FormDescription>
                          Deixe vazio para sem limite
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxRetries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número Máximo de Tentativas</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            placeholder="3" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="allowRetry"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Permitir Nova Tentativa
                          </FormLabel>
                          <FormDescription>
                            Permite que o aluno refaça a prova
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shuffleQuestions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Embaralhar Questões
                          </FormLabel>
                          <FormDescription>
                            Questões aparecem em ordem aleatória
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showResults"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Mostrar Resultados
                          </FormLabel>
                          <FormDescription>
                            Exibe respostas corretas após a prova
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificateRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Obrigatório para Certificado
                          </FormLabel>
                          <FormDescription>
                            Aprovação necessária para receber certificado
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Questões */}
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <h4 className="font-medium">Questões</h4>
                  <Badge variant="secondary">{questions.length} questões</Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewQuestion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Questão
                </Button>
              </div>

              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma questão adicionada ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Questão" para começar.</p>
                </div>
              )}

              {questions.map((question, questionIndex) => (
                <Card key={question.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Questão {questionIndex + 1}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestionById(questionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pergunta</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Digite a pergunta..."
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel>Opções de Resposta</FormLabel>
                      {('options' in question && Array.isArray(question.options)) ? question.options.map((option: any, optionIndex: number) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant={option.isCorrect ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCorrectOption(questionIndex, optionIndex)}
                            className="w-8 h-8 p-0"
                          >
                            {option.isCorrect ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{String.fromCharCode(65 + optionIndex)}</span>
                            )}
                          </Button>
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                            placeholder={`Opção ${String.fromCharCode(65 + optionIndex)}`}
                            className="flex-1"
                          />
                          {option.isCorrect && (
                            <Badge variant="default" className="ml-2">
                              Correta
                            </Badge>
                          )}
                        </div>
                      )) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4" />
                <h4 className="font-medium">Resumo da Prova</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Questões:</span>
                  <span className="ml-2 font-medium">{questions.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nota mínima:</span>
                  <span className="ml-2 font-medium">{form.watch('passingScore')}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="ml-2 font-medium">{form.watch('weight')}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tentativas:</span>
                  <span className="ml-2 font-medium">
                    {form.watch('allowRetry') ? form.watch('maxRetries') : '1'}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 