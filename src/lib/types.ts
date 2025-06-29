
import { type Timestamp } from "firebase/firestore";

// Note: When passing Timestamps from server components to client components,
// they should be converted to a serializable format like an ISO string or number.
// The client can then convert them back to Date objects.

export interface UserProfile {
    uid: string;
    email: string;
    role: 'driver' | 'fleet' | 'admin' | 'provider';
    createdAt: Timestamp;
    profileStatus?: 'incomplete' | 'pending_review' | 'approved' | 'rejected' | 'N/A';
    
    // Driver: Personal & Contact
    name?: string;
    phone?: string;
    hasWhatsApp?: boolean;
    bio?: string;
    photoUrl?: string;

    // Driver: Documents
    cnhNumber?: string;
    cnhCategory?: 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';
    cnhExpiration?: Timestamp;
    condutaxNumber?: string;
    condutaxExpiration?: Timestamp;
    alvaraExpiration?: Timestamp;
    vehicleLicensePlate?: string;
    cnhPoints?: number;

    // Driver: Qualifications
    specializedCourses?: string[];
    
    // Driver: Gamification
    earnedBadges?: Badge[];

    // Driver: Reference
    reference?: {
        name: string;
        relationship: string;
        phone: string;
    };

    // Driver: Consents
    financialConsent?: boolean;
    
    // Fleet/Provider: Business Info
    personType?: 'pf' | 'pj';
    cpf?: string;
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    companyDescription?: string;
    address?: string;
    amenities?: FleetAmenity[];
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };

    // Billing
    credits?: number;
}

export interface SupportingMaterial {
  name: string;
  url: string; 
}

export interface Badge {
    name: string;
    iconUrl: string; 
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
  createdAt: Timestamp | string; // Allow string for serialized data
  status?: 'Published' | 'Draft';
  students?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Timestamp | string; // Allow string for serialized data
  endDate: Timestamp | string; // Allow string for serialized data
  bestTime: string;
  trafficTips: string;
  mapUrl: string;
  createdAt: Timestamp | string; // Allow string for serialized data
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
  company: string;
  appliedAt: Date;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  priceId: string; // For Mercado Pago
  popular?: boolean;
  createdAt: Timestamp;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: 'debit' | 'credit_usage';
}

export interface ServiceListing {
  id: string;
  title: string;
  provider: string;
  category: string;
  price: string;
  status: 'Ativo' | 'Pausado' | 'Pendente' | 'Aprovado' | 'Rejeitado';
  imageUrl: string;
  imageHint: string;
}

export interface Opportunity {
  id: string;
  vehicle: string;
  provider: string;
  type: 'Frota' | 'Porta Branca';
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}
