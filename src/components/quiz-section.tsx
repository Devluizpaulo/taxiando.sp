
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getActiveQuiz } from '@/app/actions/quiz-actions';
import { type QuizData } from '@/lib/types';


export function QuizSection() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
        const activeQuiz = await getActiveQuiz();
        setQuiz(activeQuiz);
        setLoading(false);
    };
    fetchQuiz();
  }, []);

  if (loading) {
    return (
      <section id="quiz" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return null; // Don't render if no active quiz or quiz has no questions
  }
  
  const currentQuestion = quiz.questions[0]; // For simplicity, we'll show the first question
  const isCorrect = selectedAnswer === currentQuestion.correctOptionId;

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setShowResult(true);
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <section id="quiz" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
            {quiz.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Teste seus conhecimentos e veja se você está afiado com as regras e curiosidades da profissão.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer ?? undefined}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
              disabled={showResult}
            >
              {currentQuestion.options.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center gap-4 rounded-md border p-4 transition-colors hover:bg-accent/50",
                    "cursor-pointer",
                    showResult && option.id === currentQuestion.correctOptionId && "border-green-500 bg-green-500/10 text-green-800",
                    showResult && selectedAnswer === option.id && !isCorrect && "border-red-500 bg-red-500/10 text-red-800",
                    selectedAnswer === option.id && "border-primary"
                  )}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <span>{option.text}</span>
                </Label>
              ))}
            </RadioGroup>
            {showResult && (
              <div className={cn(
                  "mt-6 flex items-center justify-center gap-2 rounded-lg p-4 text-lg font-semibold",
                  isCorrect ? "bg-green-100/80 text-green-900" : "bg-red-100/80 text-red-900"
              )}>
                {isCorrect ? <CheckCircle2 className="h-6 w-6"/> : <XCircle className="h-6 w-6"/>}
                <span>{isCorrect ? "Resposta Correta!" : `Incorreto. A resposta certa era: ${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.text}`}</span>
              </div>
            )}
            <div className="mt-6">
              {showResult ? (
                <Button onClick={handleTryAgain} className="w-full" variant="outline">
                    Tentar Novamente
                </Button>
              ) : (
                <Button onClick={handleCheckAnswer} disabled={!selectedAnswer} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Verificar Resposta
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
