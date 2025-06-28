'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Briefcase, Car, FileCheck, UserCircle } from "lucide-react";
import Link from "next/link";

const courses = [
  { id: 1, title: "Legislação de Trânsito para Taxistas", progress: 75, description: "Domine as leis e regulamentos essenciais para operar em SP." },
  { id: 2, title: "Inglês para Atendimento ao Turista", progress: 40, description: "Aprenda frases e vocabulário para se comunicar com estrangeiros." },
  { id: 3, title: "Direção Defensiva e Primeiros Socorros", progress: 95, description: "Técnicas avançadas para uma condução mais segura e primeiros socorros." },
];

export default function DashboardPage() {
  const completedCourses = courses.filter(c => c.progress > 90).length;
  const inProgressCourses = courses.filter(c => c.progress < 100).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Painel do Motorista</h1>
        <p className="text-muted-foreground">Sua central de controle para acelerar sua carreira.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos em Andamento</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{inProgressCourses}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Concluídos</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{completedCourses}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">4</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Veículo</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">OK</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h2 className="font-headline text-2xl font-semibold mb-4">Meus Cursos em Andamento</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {courses.filter(c => c.progress < 100).map((course) => (
                <Card key={course.id}>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">{course.title}</CardTitle>
                    <CardDescription className="pt-1 text-xs">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={course.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">{course.progress}% completo</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Continuar Curso
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Links úteis para o seu dia a dia.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button asChild variant="outline" className="justify-start">
                  <Link href="/opportunities"><Briefcase className="mr-2"/> Buscar Oportunidades</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                  <Link href="/applications"><FileCheck className="mr-2"/> Minhas Candidaturas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
