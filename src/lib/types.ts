
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

    // Billing, Analytics & Notifications
    credits?: number;
    loginCount?: number;
    lastNotificationCheck?: Timestamp;
}

export interface SupportingMaterial {
  name: string;
  url: string; 
}

export interface Badge {
    name: string;
    iconUrl: string; 
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: number; // in minutes
  content?: string;
  materials?: SupportingMaterial[];
  questions?: QuizQuestion[];
  passingScore?: number; // As a percentage, e.g., 70
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
  location: string;
  description: string;
  driverSummary: string;
  peakTimes: string;
  trafficTips: string;
  pickupPoints: string;
  mapUrl: string;
  imageUrl?: string;
  startDate: Timestamp | string;
  endDate: Timestamp | string;
  createdAt: Timestamp | string;
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
  createdAt: Timestamp | string;
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
  fleetId: string;
  vehicleName: string;
  company: string;
  appliedAt: Timestamp | string;
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
  providerId: string;
  provider: string; // nomeFantasia or name
  title: string;
  category: string;
  description: string;
  price: string;
  status: 'Ativo' | 'Pausado' | 'Pendente';
  imageUrl?: string;
  createdAt: Timestamp | string;
}

export interface Opportunity {
  id: string;
  vehicle: string;
  provider: string;
  type: 'Frota' | 'Porta Branca';
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface PaymentGatewaySettings {
    mercadoPago: {
        publicKey?: string;
        accessToken?: string;
        enabledMethods?: ('pix' | 'credit_card' | 'debit_card' | 'account_money')[];
    }
}

export interface AnalyticsData {
    pageViews?: {
        home?: number;
    };
    logins?: {
        total?: number;
    };
    sales?: {
        totalRevenue?: number;
        packagesSold?: number;
    }
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses?: number;
    uses: number;
    isActive: boolean;
    expiresAt?: Timestamp | string;
    createdAt: Timestamp | string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    targetAudience: 'all' | 'drivers' | 'fleets' | 'providers' | 'admins';
    icon?: string;
    link?: string;
    createdAt: Timestamp | string;
}

export interface Partner {
    id: string;
    name: string;
    imageUrl: string;
    linkUrl: string;
    size: 'small' | 'medium' | 'large';
    isActive: boolean;
    createdAt: Timestamp | string;
}
