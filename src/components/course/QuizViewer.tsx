'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, HelpCircle, 
  RefreshCw, Award, Timer, Eye, EyeOff 
} from 'lucide-react';
import { type IndividualQuizSchema } from '@/lib/course-schemas';

interface QuizViewerProps {
  quiz: IndividualQuizSchema;
  onComplete: (score: number, answers: Record<string, string>) => void;
  onRetry?: () => void;
  initialAnswers?: Record<string, string>;
  isCompleted?: boolean;
  showResults?: boolean;
}

export function QuizViewer({ 
  quiz, 
  onComplete, 
  onRetry, 
  initialAnswers = {}, 
  isCompleted = false,
  showResults = true 
}: QuizViewerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(isCompleted);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (quiz.timeLimit && !isCompleted && !isSubmitted) {
      setTimeLeft(quiz.timeLimit * 60); // Convert to seconds
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz.timeLimit, isCompleted, isSubmitted]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const totalQuestions = quiz.questions.length;
    const correctAnswers = quiz.questions.reduce((count: number, question: any) => {
      const selectedOption = answers[question.id || ''];
      const correctOption = question.options.find((opt: any) => opt.isCorrect);
      
      if (selectedOption === correctOption?.id) {
        return count + 1;
      }
      return count;
    }, 0);

    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    onComplete(calculatedScore, answers);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma questão encontrada neste quiz.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {quiz.timeLimit && timeLeft !== null && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
              <Badge variant="secondary">
                {currentQuestionIndex + 1} de {quiz.questions.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progresso: {Math.round(progress)}%</span>
            <span>Respondidas: {answeredQuestions}/{quiz.questions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timer Warning */}
      {quiz.timeLimit && timeLeft !== null && timeLeft <= 60 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Atenção! Restam apenas {formatTime(timeLeft)} para finalizar o quiz.
          </AlertDescription>
        </Alert>
      )}

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                Questão {currentQuestionIndex + 1}
              </Badge>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">
                  {currentQuestion.question}
                </h3>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option: any, index: number) => {
                    const isSelected = answers[currentQuestion.id || ''] === option.id;
                    const isCorrect = option.isCorrect;
                    const showAnswer = isSubmitted && showResults;
                    
                    let variant: "default" | "secondary" | "outline" = "outline";
                    if (isSelected) {
                      variant = showAnswer && isCorrect ? "default" : "secondary";
                    }
                    
                    return (
                      <Button
                        key={option.id}
                        variant={variant}
                        className={`w-full justify-start h-auto p-4 ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } ${
                          showAnswer && isCorrect ? 'bg-green-100 border-green-500 text-green-900' : ''
                        } ${
                          showAnswer && isSelected && !isCorrect ? 'bg-red-100 border-red-500 text-red-900' : ''
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestion.id || '', option.id || '')}
                        disabled={isSubmitted}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-sm font-medium w-6">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1 text-left">{option.text}</span>
                          {showAnswer && isCorrect && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {showAnswer && isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
              >
                Próxima
              </Button>
              
              {currentQuestionIndex === quiz.questions.length - 1 && (
                <Button onClick={handleSubmit} disabled={answeredQuestions < quiz.questions.length}>
                  Finalizar Quiz
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              {showResults && (
                <Button
                  variant="outline"
                  onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
                >
                  {showCorrectAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showCorrectAnswers ? 'Ocultar' : 'Mostrar'} Respostas
                </Button>
              )}
              
              {quiz.allowRetry && onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nova Tentativa
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {isSubmitted && score !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resultado do Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {score}%
                </div>
                <div className="text-lg">
                  {score >= quiz.passingScore ? (
                    <span className="text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Aprovado!
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center justify-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Reprovado
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Nota mínima para aprovação: {quiz.passingScore}%
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Questões corretas:</span>
                  <span className="ml-2 font-medium">
                    {Math.round((score / 100) * quiz.questions.length)} de {quiz.questions.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Peso da prova:</span>
                  <span className="ml-2 font-medium">{quiz.weight}%</span>
                </div>
              </div>

              {quiz.certificateRequired && score >= quiz.passingScore && (
                <Alert>
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    Esta prova é obrigatória para receber o certificado. Parabéns pela aprovação!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 