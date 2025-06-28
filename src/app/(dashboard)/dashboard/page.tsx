'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const courses = [
  { id: 1, title: "Legislação de Trânsito para Taxistas", progress: 75, description: "Domine as leis e regulamentos essenciais para operar em SP." },
  { id: 2, title: "Inglês para Atendimento ao Turista", progress: 40, description: "Aprenda frases e vocabulário para se comunicar com estrangeiros." },
  { id: 3, title: "Direção Defensiva e Primeiros Socorros", progress: 95, description: "Técnicas avançadas para uma condução mais segura e primeiros socorros." },
  { id: 4, title: "Gestão Financeira para Autônomos", progress: 20, description: "Organize suas finanças e maximize seus lucros." },
];

const chartData = [
  { month: "Jan", hours: 10 },
  { month: "Fev", hours: 15 },
  { month: "Mar", hours: 12 },
  { month: "Abr", hours: 20 },
  { month: "Mai", hours: 18 },
  { month: "Jun", hours: 25 },
];


export default function DashboardPage() {
  const completedCourses = courses.filter(c => c.progress > 90).length;
  const inProgressCourses = courses.length - completedCourses;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Painel de Cursos</h1>
        <p className="text-muted-foreground">Seu progresso de aprendizado em um só lugar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Cursos Totais</CardTitle>
            <CardDescription>Cursos matriculados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Em Andamento</CardTitle>
            <CardDescription>Continue de onde parou</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{inProgressCourses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Concluídos</CardTitle>
            <CardDescription>Certificados obtidos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{completedCourses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Horas de Estudo</CardTitle>
            <CardDescription>Total de horas dedicadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{chartData.reduce((acc, cur) => acc + cur.hours, 0)}h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h2 className="font-headline text-2xl font-semibold mb-4">Meus Cursos</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {courses.map((course) => (
                <Card key={course.id}>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={course.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">{course.progress}% completo</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {course.progress > 90 ? 'Revisar' : 'Continuar Curso'}
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Atividade de Aprendizagem</CardTitle>
              <CardDescription>Horas de estudo por mês</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
