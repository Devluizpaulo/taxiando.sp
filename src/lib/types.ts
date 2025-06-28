import { type Timestamp } from "firebase/firestore";

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
  supportingMaterials?: SupportingMaterial[];
  // isCompleted is now user-specific and stored in a different collection
}

export interface Module {
  id: string;
  title:string;
  lessons: Lesson[];
  badge?: Badge | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: Module[];
  totalLessons: number;
  totalDuration: number; // in minutes
  createdAt: Timestamp;
  status?: 'Published' | 'Draft';
  students?: number;
}
