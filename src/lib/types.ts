
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
  createdAt: Timestamp | Date;
  status?: 'Published' | 'Draft';
  students?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Timestamp;
  endDate: Timestamp;
  bestTime: string;
  trafficTips: string;
  mapUrl: string;
  createdAt: Timestamp;
}

export interface VehiclePerk {
  id: string;
  label: string;
}

export interface PaymentInfo {
  terms: string;
  methods: string[];
}

export interface Vehicle {
  id: string;
  fleetId: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  condition: string;
  description: string;
  status: 'Disponível' | 'Alugado' | 'Em Manutenção';
  dailyRate: number;
  imageUrl: string;
  paymentInfo: PaymentInfo;
  perks: VehiclePerk[];
  createdAt: Timestamp | Date;
}

export interface FleetAmenity {
    id: string;
    label: string;
}

export interface VehicleApplication {
  id: string;
  driverId: string;
  driverName: string;
  driverPhotoUrl: string;
  driverProfileStatus: string;
  vehicleId: string;
  vehicleName: string;
  appliedAt: Date;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}
