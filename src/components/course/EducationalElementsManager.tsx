'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusCircle, Trash2, Edit3, Eye, BookOpen, Target, FileText, 
  CheckCircle, AlertCircle, Clock, Star, Zap, Brain, 
  GraduationCap, TestTube, Lightbulb, Bookmark, 
  Play, Pause, Volume2, Maximize, Minimize
} from 'lucide-react';
import { nanoid } from 'nanoid';

// Componente para criar questões de múltipla escolha
const MultipleChoiceQuestionCreator = ({ onSave, onCancel }: { onSave: (question: any) => void; onCancel: () => void }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { id: nanoid(), text: '', isCorrect: false, explanation: '' },
    { id: nanoid(), text: '', isCorrect: false, explanation: '' }
  ]);
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: nanoid(), text: '', isCorrect: false, explanation: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // Se marcou como correta, desmarca as outras
    if (field === 'isCorrect' && value) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }
    
    setOptions(newOptions);
  };

  const handleSave = () => {
    if (question.trim() && options.some(opt => opt.text.trim() && opt.isCorrect)) {
      onSave({
        id: nanoid(),
        type: 'multiple_choice',
        question: question.trim(),
        options: options.filter(opt => opt.text.trim()),
        points,
        difficulty,
        tags: []
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Nova Questão de Múltipla Escolha
        </CardTitle>
        <CardDescription>Crie uma questão com múltiplas opções</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pergunta</label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite a pergunta..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Opções</label>
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2 p-3 border rounded-lg">
              <input
                type="radio"
                name="correct"
                checked={option.isCorrect}
                onChange={() => updateOption(index, 'isCorrect', true)}
                className="mr-2"
              />
              <Input
                value={option.text}
                onChange={(e) => updateOption(index, 'text', e.target.value)}
                placeholder={`Opção ${index + 1}`}
                className="flex-1"
              />
              <Input
                value={option.explanation}
                onChange={(e) => updateOption(index, 'explanation', e.target.value)}
                placeholder="Explicação (opcional)"
                className="flex-1"
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <Button variant="outline" size="sm" onClick={addOption}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Opção
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pontos</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min="1"
              max="10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dificuldade</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Salvar Questão
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para criar exercícios práticos
const ExerciseCreator = ({ onSave, onCancel }: { onSave: (exercise: any) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [solution, setSolution] = useState('');
  const [hints, setHints] = useState(['']);

  const addHint = () => {
    setHints([...hints, '']);
  };

  const removeHint = (index: number) => {
    if (hints.length > 1) {
      setHints(hints.filter((_, i) => i !== index));
    }
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const handleSave = () => {
    if (title.trim() && description.trim() && instructions.trim()) {
      onSave({
        id: nanoid(),
        type: 'exercise',
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        difficulty,
        estimatedTime,
        materials: [],
        solution: solution.trim() || undefined,
        hints: hints.filter(h => h.trim()),
        tags: []
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Novo Exercício Prático
        </CardTitle>
        <CardDescription>Crie um exercício prático para os alunos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do exercício"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o exercício..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Instruções</label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instruções para o aluno..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dificuldade</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tempo Estimado (min)</label>
            <Input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(Number(e.target.value))}
              min="1"
              max="120"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Solução (opcional)</label>
          <Textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Solução ou resposta esperada..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Dicas</label>
          {hints.map((hint, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={hint}
                onChange={(e) => updateHint(index, e.target.value)}
                placeholder={`Dica ${index + 1}`}
                className="flex-1"
              />
              {hints.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHint(index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addHint}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Dica
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Salvar Exercício
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para criar resumos
const SummaryCreator = ({ onSave, onCancel }: { onSave: (summary: any) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [keyPoints, setKeyPoints] = useState(['']);
  const [difficulty, setDifficulty] = useState('intermediate');

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, '']);
  };

  const removeKeyPoint = (index: number) => {
    if (keyPoints.length > 1) {
      setKeyPoints(keyPoints.filter((_, i) => i !== index));
    }
  };

  const updateKeyPoint = (index: number, value: string) => {
    const newKeyPoints = [...keyPoints];
    newKeyPoints[index] = value;
    setKeyPoints(newKeyPoints);
  };

  const handleSave = () => {
    if (title.trim() && content.trim() && keyPoints.some(kp => kp.trim())) {
      onSave({
        id: nanoid(),
        type: 'summary',
        title: title.trim(),
        content: content.trim(),
        keyPoints: keyPoints.filter(kp => kp.trim()),
        difficulty,
        tags: []
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Novo Resumo
        </CardTitle>
        <CardDescription>Crie um resumo dos pontos principais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do resumo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conteúdo</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conteúdo do resumo..."
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pontos Chave</label>
          {keyPoints.map((point, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={point}
                onChange={(e) => updateKeyPoint(index, e.target.value)}
                placeholder={`Ponto chave ${index + 1}`}
                className="flex-1"
              />
              {keyPoints.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKeyPoint(index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addKeyPoint}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Ponto Chave
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Dificuldade</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Salvar Resumo
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para criar provas/avaliações
const ExamCreator = ({ onSave, onCancel }: { onSave: (exam: any) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuestionCreator, setShowQuestionCreator] = useState(false);

  const addQuestion = (question: any) => {
    setQuestions([...questions, question]);
    setShowQuestionCreator(false);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (title.trim() && description.trim() && questions.length > 0) {
      onSave({
        id: nanoid(),
        type: 'exam',
        title: title.trim(),
        description: description.trim(),
        timeLimit,
        passingScore,
        questions,
        shuffleQuestions: false,
        showResults: true,
        allowRetake: false,
        maxAttempts: 3
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Nova Prova/Avaliação
        </CardTitle>
        <CardDescription>Crie uma prova completa com múltiplas questões</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da prova"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tempo Limite (min)</label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min="5"
              max="180"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da prova..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nota Mínima para Aprovação (%)</label>
          <Input
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            min="50"
            max="100"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questões ({questions.length})</h3>
            <Button onClick={() => setShowQuestionCreator(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Questão
            </Button>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Questão {index + 1}</Badge>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{question.points} pts</Badge>
                  <Badge variant="outline">{question.difficulty}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{question.question}</p>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma questão adicionada ainda</p>
              <p className="text-sm">Clique em "Adicionar Questão" para começar</p>
            </div>
          )}
        </div>

        {showQuestionCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <MultipleChoiceQuestionCreator
                onSave={addQuestion}
                onCancel={() => setShowQuestionCreator(false)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1" disabled={questions.length === 0}>
            Salvar Prova
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal para gerenciar elementos educacionais
export function EducationalElementsManager({ 
  form, 
  moduleIndex, 
  lessonIndex 
}: { 
  form: any; 
  moduleIndex: number; 
  lessonIndex: number; 
}) {
  const [activeTab, setActiveTab] = useState('questions');
  const [showCreator, setShowCreator] = useState(false);
  const [creatorType, setCreatorType] = useState<string>('');

  const lesson = form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}`);
  const questions = lesson?.questions || [];
  const exercises = lesson?.exercises || [];
  const summaries = lesson?.summaries || [];
  const exams = lesson?.exams || [];
  const knowledgeTests = lesson?.knowledgeTests || [];

  const addElement = useCallback((element: any) => {
    const currentElements = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.${creatorType}s`) || [];
    const updatedElements = currentElements.concat([element]);
    form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.${creatorType}s`, updatedElements);
    setShowCreator(false);
    setCreatorType('');
  }, [form, moduleIndex, lessonIndex, creatorType]);

  const removeElement = useCallback((type: string, index: number) => {
    const currentElements = form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.${type}s`) || [];
    const updatedElements = currentElements.filter((_: any, i: number) => i !== index);
    form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.${type}s`, updatedElements);
  }, [form, moduleIndex, lessonIndex]);

  const openCreator = (type: string) => {
    setCreatorType(type);
    setShowCreator(true);
  };

  const renderCreator = () => {
    switch (creatorType) {
      case 'question':
        return <MultipleChoiceQuestionCreator onSave={addElement} onCancel={() => setShowCreator(false)} />;
      case 'exercise':
        return <ExerciseCreator onSave={addElement} onCancel={() => setShowCreator(false)} />;
      case 'summary':
        return <SummaryCreator onSave={addElement} onCancel={() => setShowCreator(false)} />;
      case 'exam':
        return <ExamCreator onSave={addElement} onCancel={() => setShowCreator(false)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Elementos Educacionais</h2>
        <div className="flex gap-2">
          <Button onClick={() => openCreator('question')} variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Questão
          </Button>
          <Button onClick={() => openCreator('exercise')} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            Exercício
          </Button>
          <Button onClick={() => openCreator('summary')} variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Resumo
          </Button>
          <Button onClick={() => openCreator('exam')} variant="outline">
            <GraduationCap className="h-4 w-4 mr-2" />
            Prova
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="questions">Questões ({questions.length})</TabsTrigger>
          <TabsTrigger value="exercises">Exercícios ({exercises.length})</TabsTrigger>
          <TabsTrigger value="summaries">Resumos ({summaries.length})</TabsTrigger>
          <TabsTrigger value="exams">Provas ({exams.length})</TabsTrigger>
          <TabsTrigger value="tests">Testes ({knowledgeTests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {questions.map((question: any, index: number) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{question.question}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{question.points} pts</Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <Badge variant="outline">{question.type}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement('question', index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma questão criada</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          {exercises.map((exercise: any, index: number) => (
            <Card key={exercise.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{exercise.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{exercise.estimatedTime} min</Badge>
                    <Badge variant="outline">{exercise.difficulty}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement('exercise', index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {exercises.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum exercício criado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summaries" className="space-y-4">
          {summaries.map((summary: any, index: number) => (
            <Card key={summary.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{summary.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{summary.content.substring(0, 100)}...</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{summary.difficulty}</Badge>
                    <Badge variant="secondary">{summary.keyPoints.length} pontos</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement('summary', index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {summaries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum resumo criado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          {exams.map((exam: any, index: number) => (
            <Card key={exam.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{exam.timeLimit} min</Badge>
                    <Badge variant="outline">{exam.passingScore}% aprovação</Badge>
                    <Badge variant="outline">{exam.questions.length} questões</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement('exam', index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {exams.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma prova criada</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          {knowledgeTests.map((test: any, index: number) => (
            <Card key={test.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{test.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{test.timeLimit} min</Badge>
                    <Badge variant="outline">{test.passingScore}% aprovação</Badge>
                    <Badge variant="outline">{test.questions.length} questões</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement('knowledgeTest', index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {knowledgeTests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum teste criado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {renderCreator()}
          </div>
        </div>
      )}
    </div>
  );
} 