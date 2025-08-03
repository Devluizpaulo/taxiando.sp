'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, XCircle, AlertCircle, Lightbulb, Clock, 
  MapPin, Search, Puzzle, BookOpen, Brain, Calendar,
  BarChart3, Edit3, Link, MousePointer, Target
} from 'lucide-react';
import { type ContentBlock } from '@/lib/types';

interface InteractiveElementsViewerProps {
  block: ContentBlock;
  onComplete?: (result: any) => void;
}

export function InteractiveElementsViewer({ block, onComplete }: InteractiveElementsViewerProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleComplete = (result: any) => {
    setIsCompleted(true);
    onComplete?.(result);
  };

  const renderInteractiveSimulation = () => {
    if (block.type !== 'interactive_simulation') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🎮</span>
            {block.title}
          </CardTitle>
          <CardDescription>{block.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Cenário:</h4>
            <p className="text-sm">{block.scenario}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Escolha uma opção:</h4>
            {block.options.map((option) => (
              <Button
                key={option.id}
                variant={selectedOptions[option.id] ? "default" : "outline"}
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  setSelectedOptions({ [option.id]: true });
                  handleComplete({ selectedOption: option, isCorrect: option.isCorrect });
                }}
                disabled={isCompleted}
              >
                <div className="text-left">
                  <div className="font-medium">{option.text}</div>
                  {selectedOptions[option.id] && (
                    <div className="mt-2 p-2 bg-background rounded text-sm">
                      <strong>Resultado:</strong> {option.outcome}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {isCompleted && block.feedback && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>{block.feedback}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCaseStudy = () => {
    if (block.type !== 'case_study') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            {block.title}
          </CardTitle>
          <CardDescription>{block.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contexto:</h4>
              <p className="text-sm bg-muted/50 p-3 rounded">{block.background}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Desafio:</h4>
              <p className="text-sm bg-muted/50 p-3 rounded">{block.challenge}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Perguntas para Reflexão:</h4>
              <ul className="space-y-2">
                {block.questions.map((question, index) => (
                  <li key={index} className="text-sm bg-muted/50 p-3 rounded">
                    {index + 1}. {question}
                  </li>
                ))}
              </ul>
            </div>

            {showResults && block.solution && (
              <div>
                <h4 className="font-medium mb-2">Solução Sugerida:</h4>
                <p className="text-sm bg-green-50 p-3 rounded border border-green-200">
                  {block.solution}
                </p>
              </div>
            )}

            {showResults && block.keyLearnings && block.keyLearnings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Principais Aprendizados:</h4>
                <ul className="space-y-1">
                  {block.keyLearnings.map((learning, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {learning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResults(!showResults)}
            >
              {showResults ? 'Ocultar' : 'Mostrar'} Solução
            </Button>
            <Button onClick={() => handleComplete({ completed: true })}>
              Marcar como Concluído
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMindMap = () => {
    if (block.type !== 'mind_map') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            {block.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-lg">{block.centralTopic}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {block.branches.map((branch) => (
                <div key={branch.id} className="space-y-2">
                  <div className="bg-secondary p-3 rounded-lg">
                    <h4 className="font-medium">{branch.text}</h4>
                    {branch.subBranches && branch.subBranches.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {branch.subBranches.map((subBranch) => (
                          <li key={subBranch.id} className="text-sm bg-background p-2 rounded">
                            {subBranch.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFlashcard = () => {
    if (block.type !== 'flashcard') return null;

    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🃏</span>
            Flashcard
            {block.category && (
              <Badge variant="secondary">{block.category}</Badge>
            )}
            <Badge variant="outline">{block.difficulty}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="relative h-48 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              {/* Frente */}
              <div className="absolute inset-0 bg-card border rounded-lg p-6 flex items-center justify-center backface-hidden">
                <div className="text-center">
                  <h3 className="text-lg font-medium">{block.front}</h3>
                  <p className="text-sm text-muted-foreground mt-2">Clique para virar</p>
                </div>
              </div>

              {/* Verso */}
              <div className="absolute inset-0 bg-card border rounded-lg p-6 flex items-center justify-center backface-hidden rotate-y-180">
                <div className="text-center">
                  <h3 className="text-lg font-medium">{block.back}</h3>
                  <p className="text-sm text-muted-foreground mt-2">Clique para virar de volta</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTimeline = () => {
    if (block.type !== 'timeline') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            {block.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-6">
              {block.events.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className="absolute left-2 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
                  <div className="ml-8 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{event.date}</Badge>
                      <h4 className="font-medium">{event.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="mt-2 w-full max-w-xs rounded"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComparisonTable = () => {
    if (block.type !== 'comparison_table') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            {block.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left bg-muted">Característica</th>
                  {block.columns.map((column, index) => (
                    <th key={index} className="border p-2 text-center bg-muted">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="border p-2 font-medium">{row.feature}</td>
                    {row.values.map((value, index) => (
                      <td key={index} className="border p-2 text-center">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFillBlanks = () => {
    if (block.type !== 'fill_blanks') return null;

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);

    const handleSubmit = () => {
      const correctAnswers = block.blanks.reduce((count, blank) => {
        const userAnswer = answers[blank.id]?.toLowerCase().trim();
        const correctAnswer = blank.correctAnswer.toLowerCase().trim();
        return count + (userAnswer === correctAnswer ? 1 : 0);
      }, 0);

      const score = Math.round((correctAnswers / block.blanks.length) * 100);
      handleComplete({ score, answers, correctAnswers, total: block.blanks.length });
      setShowResults(true);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">✏️</span>
            {block.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {block.blanks.map((blank, index) => (
              <div key={blank.id} className="space-y-2">
                <label className="text-sm font-medium">
                  Lacuna {index + 1}:
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Digite sua resposta..."
                  value={answers[blank.id] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [blank.id]: e.target.value
                  }))}
                  disabled={showResults}
                />
                {showResults && (
                  <div className="text-sm">
                    {answers[blank.id]?.toLowerCase().trim() === blank.correctAnswer.toLowerCase().trim() ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Correto!
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Resposta correta: {blank.correctAnswer}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={showResults}>
              Verificar Respostas
            </Button>
            {showResults && (
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Tentar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar baseado no tipo
  switch (block.type) {
    case 'interactive_simulation':
      return renderInteractiveSimulation();
    case 'case_study':
      return renderCaseStudy();
    case 'mind_map':
      return renderMindMap();
    case 'flashcard':
      return renderFlashcard();
    case 'timeline':
      return renderTimeline();
    case 'comparison_table':
      return renderComparisonTable();
    case 'fill_blanks':
      return renderFillBlanks();
    default:
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Elemento interativo não suportado: {block.type}</p>
            </div>
          </CardContent>
        </Card>
      );
  }
} 