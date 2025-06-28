'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

const quiz = {
  question: "De acordo com a legislação de São Paulo, qual a cor oficial predominante dos táxis na categoria comum?",
  options: [
    "Amarelo",
    "Branco",
    "Vermelho",
    "Prata",
  ],
  correctAnswer: "Branco",
};

export function QuizSection() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isCorrect = selectedAnswer === quiz.correctAnswer;

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
            Teste Seus Conhecimentos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Participe do nosso quiz rápido e veja se você está afiado com as regras e curiosidades da profissão.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{quiz.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer ?? undefined}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
              disabled={showResult}
            >
              {quiz.options.map((option) => (
                <Label
                  key={option}
                  htmlFor={option}
                  className={cn(
                    "flex items-center gap-4 rounded-md border p-4 transition-colors hover:bg-accent/50",
                    "cursor-pointer",
                    showResult && option === quiz.correctAnswer && "border-green-500 bg-green-500/10 text-green-800",
                    showResult && selectedAnswer === option && !isCorrect && "border-red-500 bg-red-500/10 text-red-800",
                    selectedAnswer === option && "border-primary"
                  )}
                >
                  <RadioGroupItem value={option} id={option} />
                  <span>{option}</span>
                </Label>
              ))}
            </RadioGroup>
            {showResult && (
              <div className={cn(
                  "mt-6 flex items-center justify-center gap-2 rounded-lg p-4 text-lg font-semibold",
                  isCorrect ? "bg-green-100/80 text-green-900" : "bg-red-100/80 text-red-900"
              )}>
                {isCorrect ? <CheckCircle2 className="h-6 w-6"/> : <XCircle className="h-6 w-6"/>}
                <span>{isCorrect ? "Resposta Correta! Os táxis de SP são brancos." : `Incorreto. A resposta certa é ${quiz.correctAnswer}.`}</span>
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
