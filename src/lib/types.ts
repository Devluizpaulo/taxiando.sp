export interface SupportingMaterial {
  name: string;
  url: string; // URL to the file in Firebase Storage
}

export interface Badge {
    name: string;
    iconUrl: string; // URL to the badge icon
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: number; // in minutes
  isCompleted: boolean;
  supportingMaterials?: SupportingMaterial[];
}

export interface Module {
  id: string;
  title:string;
  lessons: Lesson[];
  badge?: Badge;
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