'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, Save, Eye, Edit3, Puzzle, Loader2
} from 'lucide-react';
import { type ContentBlock } from '@/lib/types';
import { EducationalImageUpload } from '@/components/ui/educational-image-upload';
import { useToast } from '@/hooks/use-toast';
import { 
  createEducationalElement, 
  updateEducationalElement,
  type EducationalElement 
} from '@/app/actions/educational-elements-actions';

interface EducationalElementEditorProps {
  courseId: string;
  lessonId: string;
  userId: string;
  element?: EducationalElement;
  onSave?: (elementId: string) => void;
  onCancel?: () => void;
}

export function EducationalElementEditor({
  courseId,
  lessonId,
  userId,
  element,
  onSave,
  onCancel
}: EducationalElementEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const [elementType, setElementType] = useState<ContentBlock['type']>(
    element?.type || 'interactive_simulation'
  );

  const form = useForm<ContentBlock>({
    defaultValues: element?.data || {
      type: elementType,
      title: '',
      description: '',
    } as ContentBlock,
  });

  const { fields: options, append: addOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: 'options' as any,
  });

  const { fields: questions, append: addQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions' as any,
  });

  const { fields: events, append: addEvent, remove: removeEvent } = useFieldArray({
    control: form.control,
    name: 'events' as any,
  });

  const { fields: blanks, append: addBlank, remove: removeBlank } = useFieldArray({
    control: form.control,
    name: 'blanks' as any,
  });

  const handleSave = async (data: ContentBlock) => {
    setIsSaving(true);
    try {
      const metadata = {
        difficulty: 'medium' as const,
        estimatedTime: 5,
        tags: [],
        category: 'interactive'
      };

      let result;
      if (element) {
        result = await updateEducationalElement(element.id, data, metadata);
      } else {
        result = await createEducationalElement(courseId, lessonId, data, userId, metadata);
      }

      if (result.success) {
        toast({
          title: "Elemento salvo com sucesso!",
          description: "O elemento educativo foi salvo e está pronto para uso.",
        });
        onSave?.(element?.id || '');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderInteractiveSimulationEditor = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Simulação</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Simulação de Emergência no Trânsito" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Descreva brevemente o objetivo desta simulação..."
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scenario"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cenário</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Descreva o cenário que o aluno irá enfrentar..."
                rows={4}
              />
            </FormControl>
            <FormDescription>
              Descreva a situação que o aluno deve resolver
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Opções de Resposta</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addOption({
              id: nanoid(),
              text: '',
              outcome: '',
              isCorrect: false
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Opção
          </Button>
        </div>

        {options.map((option, index) => (
          <Card key={option.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Opção {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`options.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto da Opção</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite a opção..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`options.${index}.outcome`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva o que acontece quando esta opção é escolhida..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`options.${index}.isCorrect`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Esta é a resposta correta</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </Card>
        ))}
      </div>

      <FormField
        control={form.control}
        name="feedback"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Feedback Geral</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Mensagem de feedback após a simulação..."
                rows={3}
              />
            </FormControl>
            <FormDescription>
              Mensagem que será exibida após o aluno completar a simulação
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderCaseStudyEditor = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título do Estudo de Caso</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Acidente de Trânsito - Análise de Responsabilidade" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Breve descrição do caso..."
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="background"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Descreva o contexto e situação inicial..."
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="challenge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desafio</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Qual é o problema ou desafio a ser resolvido?"
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Perguntas para Reflexão</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addQuestion('')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pergunta
          </Button>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`questions.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      value={typeof field.value === 'string' ? field.value : ''} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={`Pergunta ${index + 1}...`} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name="solution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Solução Sugerida</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Descreva a solução ou análise recomendada..."
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderTimelineEditor = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Linha do Tempo</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Evolução da Legislação de Trânsito" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Eventos</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addEvent({
              id: nanoid(),
              date: '',
              title: '',
              description: ''
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Evento
          </Button>
        </div>

        {events.map((event, index) => (
          <Card key={event.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Evento {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`events.${index}.date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 1997" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`events.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título do evento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`events.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva o evento..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EducationalImageUpload
                courseId={courseId}
                elementType="timeline"
                onImageUploaded={(url) => {
                  form.setValue(`events.${index}.imageUrl`, url);
                }}
                currentImageUrl={'imageUrl' in event ? (event.imageUrl as string) : ''}
                label="Imagem do Evento"
                description="Imagem opcional para ilustrar o evento"
                required={false}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFillBlanksEditor = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título do Exercício</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Complete as Lacunas sobre Direção Defensiva" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto com Lacunas</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Digite o texto usando ___ para indicar lacunas. Ex: A direção defensiva é ___ para evitar acidentes."
                rows={6}
              />
            </FormControl>
            <FormDescription>
              Use ___ (três underscores) para indicar onde ficam as lacunas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Respostas das Lacunas</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlank({
              id: nanoid(),
              correctAnswer: '',
              hints: [],
              alternatives: []
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Lacuna
          </Button>
        </div>

        {blanks.map((blank, index) => (
          <Card key={blank.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Lacuna {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlank(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`blanks.${index}.correctAnswer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resposta Correta</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Resposta correta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Dicas (opcional)</Label>
                  <div className="space-y-2 mt-2">
                    {('hints' in blank && Array.isArray(blank.hints)) ? blank.hints.map((hint: string, hintIndex: number) => (
                      <div key={hintIndex} className="flex gap-2">
                        <Input
                          value={hint}
                          onChange={(e) => {
                            const newHints = [...(('hints' in blank && Array.isArray(blank.hints)) ? blank.hints : [])];
                            newHints[hintIndex] = e.target.value;
                            form.setValue(`blanks.${index}.hints`, newHints);
                          }}
                          placeholder="Dica..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newHints = (('hints' in blank && Array.isArray(blank.hints)) ? blank.hints : []).filter((_: string, i: number) => i !== hintIndex);
                            form.setValue(`blanks.${index}.hints`, newHints);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newHints = [...(('hints' in blank && Array.isArray(blank.hints)) ? blank.hints : []), ''];
                        form.setValue(`blanks.${index}.hints`, newHints);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Dica
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Alternativas (opcional)</Label>
                  <div className="space-y-2 mt-2">
                    {('alternatives' in blank && Array.isArray(blank.alternatives)) ? blank.alternatives.map((alt: string, altIndex: number) => (
                      <div key={altIndex} className="flex gap-2">
                        <Input
                          value={alt}
                          onChange={(e) => {
                            const newAlts = [...(('alternatives' in blank && Array.isArray(blank.alternatives)) ? blank.alternatives : [])];
                            newAlts[altIndex] = e.target.value;
                            form.setValue(`blanks.${index}.alternatives`, newAlts);
                          }}
                          placeholder="Alternativa..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAlts = (('alternatives' in blank && Array.isArray(blank.alternatives)) ? blank.alternatives : []).filter((_: string, i: number) => i !== altIndex);
                            form.setValue(`blanks.${index}.alternatives`, newAlts);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAlts = [...(('alternatives' in blank && Array.isArray(blank.alternatives)) ? blank.alternatives : []), ''];
                        form.setValue(`blanks.${index}.alternatives`, newAlts);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Alternativa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEditorByType = () => {
    switch (elementType) {
      case 'interactive_simulation':
        return renderInteractiveSimulationEditor();
      case 'case_study':
        return renderCaseStudyEditor();
      case 'timeline':
        return renderTimelineEditor();
      case 'fill_blanks':
        return renderFillBlanksEditor();
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Editor para este tipo de elemento ainda não foi implementado.</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {element ? 'Editar' : 'Criar'} Elemento Educativo
            </CardTitle>
            <CardDescription>
              Configure um elemento interativo para enriquecer o aprendizado
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewMode ? 'Editar' : 'Visualizar'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {!previewMode && (
              <>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Elemento</FormLabel>
                      <Select
                        value={elementType}
                        onValueChange={(value: ContentBlock['type']) => {
                          setElementType(value);
                          form.setValue('type', value);
                        }}
                        disabled={!!element}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="interactive_simulation">🎮 Simulação Interativa</SelectItem>
                          <SelectItem value="case_study">📋 Estudo de Caso</SelectItem>
                          <SelectItem value="timeline">📅 Linha do Tempo</SelectItem>
                          <SelectItem value="fill_blanks">✏️ Preencher Lacunas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {renderEditorByType()}
              </>
            )}

            {previewMode && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Preview do Elemento</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualização do elemento como será exibido para os alunos
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {element ? 'Atualizar' : 'Criar'} Elemento
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 