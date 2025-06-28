export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: number; // in minutes
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title:string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: Module[];
  totalLessons: number;
  totalDuration: number; // in minutes
}
