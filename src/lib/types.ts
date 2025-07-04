

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
    cnhPoints?: number;

    // Driver: Work Mode and Vehicle
    workMode?: 'owner' | 'rental';
    alvaraExpiration?: Timestamp;
    vehicleLicensePlate?: string;

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
    uploadCredits?: number;
    loginCount?: number;
    lastNotificationCheck?: Timestamp;
}

export interface Enrollment {
    courseId: string;
    enrolledAt: Timestamp | string;
    status: 'active' | 'completed';
    source: 'purchase' | 'admin_grant';
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
  moderationStatus?: 'Pendente' | 'Aprovado' | 'Rejeitado';
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
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'usage';
  createdAt: Timestamp | string;

  // Purchase-specific fields
  packageId?: string;
  packageName?: string;
  creditsPurchased?: number;
  amountPaid?: number;
  paymentId?: string;

  // Usage-specific fields
  creditsUsed?: number;
  usageReason?: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  provider: string; // nomeFantasia or name
  title: string;
  category: string;
  description: string;
  price: string;
  status: 'Ativo' | 'Pausado' | 'Pendente' | 'Rejeitado';
  imageUrl?: string;
  createdAt: Timestamp | string;
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
    },
    userGrowth?: {
        month: string;
        total: number;
    }[];
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
    updatedAt?: Timestamp | string;
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
    updatedAt?: Timestamp | string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown content
  imageUrl: string;
  authorId: string;
  authorName: string;
  status: 'Published' | 'Draft';
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  imageFile?: File; // For upload
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    imageUrl: string;
}

export interface QuizQuestionData {
    id: string;
    question: string;
    options: { id: string; text: string; }[];
    correctOptionId: string;
    explanation?: string;
}

export interface QuizData {
    id: string;
    title: string;
    status: 'Draft' | 'Active';
    questions: QuizQuestionData[];
    createdAt: Timestamp | string;
}


// Represents a user object with Timestamps converted to ISO strings for client-side use
export type AdminUser = Omit<UserProfile, 'createdAt' | 'cnhExpiration' | 'condutaxExpiration' | 'alvaraExpiration' | 'lastNotificationCheck'> & {
    createdAt: string;
    cnhExpiration?: string;
    condutaxExpiration?: string;
    alvaraExpiration?: string;
    lastNotificationCheck?: string;
};

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: Timestamp | string;
  resolvedAt?: Timestamp | string;
}

export interface GalleryImage {
  id: string;
  url: string;
  name: string;
  category: string;
  ownerId: string; // 'admin' for public or userId for private
  ownerName: string;
  isPublic: boolean;
  createdAt: Timestamp | string;
}
