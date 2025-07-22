'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Clock, Calendar, Award, Zap } from 'lucide-react';
import { Course } from '@/lib/types';

// Definir tipos locais:
type UserAchievement = {
  id: string;
  name: string;
  description?: string;
  earnedAt: string;
};

type UserProgress = {
  completedLessons: string[];
  level?: number;
  experiencePoints?: number;
  achievements?: UserAchievement[];
  totalTimeSpent?: number;
  currentStreak?: number;
};

interface StudentProgressDashboardProps {
  userProgress: UserProgress;
  course: Course;
}

export function StudentProgressDashboard({ userProgress, course }: StudentProgressDashboardProps) {
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  useEffect(() => {
    // Calcular porcentagem de progresso
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = userProgress.completedLessons.length;
    const percentage = Math.round((completedLessons / totalLessons) * 100);
    setProgressPercentage(percentage);
  }, [userProgress, course]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Progresso do Curso</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col items-center p-3 bg-muted rounded-md">
                <div className="text-2xl font-bold">{userProgress.level || 1}</div>
                <div className="text-xs text-muted-foreground">Nível Atual</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-md">
                <div className="text-2xl font-bold">{userProgress.experiencePoints || 0}</div>
                <div className="text-xs text-muted-foreground">Pontos XP</div>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Conquistas ({userProgress.achievements?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProgress.achievements?.map((achievement: UserAchievement) => (
                  <Badge key={achievement.id} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {achievement.name}
                  </Badge>
                ))}
                {(!userProgress.achievements || userProgress.achievements.length === 0) && (
                  <span className="text-xs text-muted-foreground">Complete aulas para ganhar conquistas</span>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Estatísticas</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Tempo total: {userProgress.totalTimeSpent || 0} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Sequência atual: {userProgress.currentStreak || 0} dias</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Próximos Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressPercentage < 100 && (
              <div className="p-3 border rounded-md bg-background">
                <div className="font-medium">Completar o curso</div>
                <Progress value={progressPercentage} className="h-1.5 mt-2" />
              </div>
            )}
            
            {userProgress.level && userProgress.level < 5 && (
              <div className="p-3 border rounded-md bg-background">
                <div className="font-medium">Alcançar nível {userProgress.level + 1}</div>
                <div className="text-xs text-muted-foreground mt-1">Ganhe mais {100 - (userProgress.experiencePoints || 0) % 100} XP</div>
                <Progress value={(userProgress.experiencePoints || 0) % 100} className="h-1.5 mt-2" />
              </div>
            )}
            
            {(!userProgress.currentStreak || userProgress.currentStreak < 3) && (
              <div className="p-3 border rounded-md bg-background">
                <div className="font-medium">Sequência de 3 dias</div>
                <div className="text-xs text-muted-foreground mt-1">Estude por {3 - (userProgress.currentStreak || 0)} dias consecutivos</div>
                <Progress value={((userProgress.currentStreak || 0) / 3) * 100} className="h-1.5 mt-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}