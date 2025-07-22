"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Layers, Zap, Send } from "lucide-react";
import { type Course } from "@/lib/types";
import { getAllCourses } from "@/app/actions/course-actions";

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getAllCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const handleSuggestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSuggestion({ ...suggestion, [e.target.name]: e.target.value });
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setSuggestion({ name: '', email: '', message: '' });
    // Aqui você pode integrar com backend/email se desejar
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <section className="mb-12 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Cursos para Motoristas Profissionais
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-6">
            Qualifique-se, conquiste mais corridas e aumente sua renda! Nossos cursos são pensados para quem quer se destacar no volante em São Paulo.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-md hover:from-amber-500 hover:to-orange-600 transition-all">
            <Link href="/register">
              Quero ser um motorista de sucesso <Zap className="ml-2 h-5 w-5 animate-bounce" />
            </Link>
          </Button>
        </section>
        <section>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-lg text-muted-foreground">Carregando cursos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {courses.map((course) => (
                <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-amber-200 transition-shadow group">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={course.coverImageUrl || "/logo.png"}
                      alt={course.title}
                      fill
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="font-headline text-lg line-clamp-2 mb-2">{course.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Layers className="h-4 w-4" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Award className="h-4 w-4" />
                      <span>{course.difficulty}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{course.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.totalLessons} aulas</span>
                    </div>
                    <Button asChild size="sm" className="mt-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold w-full">
                      <Link href={`/courses/${course.id}`}>Saiba mais</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
        <section className="mt-20 max-w-xl mx-auto bg-white/80 rounded-2xl shadow-lg p-8 border border-amber-100">
          <h2 className="font-headline text-2xl font-bold mb-4 text-amber-700 flex items-center gap-2">
            <Send className="h-6 w-6 text-amber-500" /> Sugira um Curso ou Tema
          </h2>
          <p className="text-muted-foreground mb-4">Não encontrou o curso que procura? Envie sua sugestão e ajude a construir uma plataforma cada vez mais completa para motoristas!</p>
          {sent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium">
              Obrigado pela sugestão! Nossa equipe irá analisar com carinho.
            </div>
          )}
          <form onSubmit={handleSuggestionSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              value={suggestion.name}
              onChange={handleSuggestionChange}
              placeholder="Seu nome"
              required
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <input
              type="email"
              name="email"
              value={suggestion.email}
              onChange={handleSuggestionChange}
              placeholder="Seu e-mail"
              required
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <textarea
              name="message"
              value={suggestion.message}
              onChange={handleSuggestionChange}
              placeholder="Descreva o curso ou tema que gostaria de ver aqui..."
              required
              rows={4}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none resize-none"
            />
            <Button type="submit" size="lg" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold mt-2">
              Enviar Sugestão <Send className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}