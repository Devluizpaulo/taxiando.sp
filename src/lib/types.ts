

import { type Timestamp } from "firebase/firestore";

export interface RelatedLink {
  id?: string;
  title: string;
  url: string;
}

export interface Review {
  id: string;
  rating: number; 
  comment: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserProfile['role'];
  revieweeId: string;
  revieweeRole: UserProfile['role'];
  relatedTo?: string; 
  relatedToName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp | string;
}

export interface WorkHistoryItem {
  id?: string;
  fleetName: string;
  period: string;
  reasonForLeaving?: string;
  hasOutstandingDebt?: boolean;
}

export interface UserProfile {
    uid: string;
    email: string;
    role: 'driver' | 'fleet' | 'admin' | 'provider';
    createdAt: Timestamp;
    profileStatus?: 'incomplete' | 'pending_review' | 'approved' | 'rejected' | 'N/A';
    
    name?: string;
    phone?: string;
    hasWhatsApp?: boolean;
    bio?: string;
    photoUrl?: string;

    cpf?: string;
    cnhNumber?: string;
    cnhCategory?: 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';
    cnhExpiration?: Timestamp;
    condutaxNumber?: string;
    condutaxExpiration?: Timestamp;
    cnhPoints?: number;

    // Structured Address
    address?: string;
    addressNumber?: string;
    addressComplement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;

    garageInfo?: 'covered' | 'uncovered' | 'building_garage' | 'none';

    workMode?: 'owner' | 'rental';
    alvaraExpiration?: Timestamp;
    vehicleLicensePlate?: string;
    
    workHistory?: WorkHistoryItem[];

    specializedCourses?: string[];
    languageLevel?: string;
    otherCourses?: string;
    
    earnedBadges?: Badge[];

    rentalPreferences?: {
      vehicleTypes?: string[];
      transmission?: 'automatic' | 'manual' | 'indifferent';
      fuelTypes?: string[];
      maxDailyRate?: number;
    };
    
    isSeekingRentals?: boolean;
    lastSeekingRentalsCheck?: Timestamp | string;
    
    isCurrentlyWorking?: boolean;
    hasParkingLot?: boolean;

    reference?: {
        name: string;
        relationship: string;
        phone: string;
    };

    hasCreditCardForDeposit?: boolean;
    financialConsent?: boolean;
    
    personType?: 'pf' | 'pj';
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    companyDescription?: string;
    amenities?: FleetAmenity[];
    otherAmenities?: string;
    galleryImages?: GalleryImage[];
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };

    credits?: number;
    loginCount?: number;
    lastNotificationCheck?: Timestamp;
    sessionValidSince?: Timestamp;

    averageRating?: number;
    reviewCount?: number;
    profileViewCount?: number;
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
  correctOptionId?: string; // Correct Option ID is used in the Marketing Quiz, while isCorrect is used in the Course Quiz. Both can coexist.
}

// Novo tipo para blocos de conteúdo de aula
export type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; style: 'bullet' | 'numbered'; items: string[] }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'exercise'; question: string; answer: string; hints?: string[] }
  | { type: 'quiz'; questions: QuizQuestion[] };

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'audio';
  duration: number;
  content?: string; // compatibilidade antiga
  contentBlocks?: ContentBlock[]; // novo modelo
  audioFile?: any;
  materials?: SupportingMaterial[];
  questions?: QuizQuestion[];
  passingScore?: number;
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
  totalDuration: number; 
  createdAt: Timestamp | string; 
  status?: 'Published' | 'Draft';
  students?: number;
  difficulty?: 'Iniciante' | 'Intermediário' | 'Avançado';
  investmentCost?: number;
  priceInCredits?: number;
  authorInfo?: string;
  legalNotice?: string;
  revenue?: number;
  coverImageUrl?: string; // Adicionando a propriedade que faltava
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
  startDate: Timestamp | string;
  createdAt: Timestamp | string;
}

export interface CityTipReview {
  id: string;
  tipId: string;
  rating: number; // 1-5 estrelas
  comment: string;
  reviewerName: string; // Obrigatório
  reviewerEmail?: string; // Opcional
  reviewerRole: 'driver' | 'client' | 'admin';
  createdAt: string; // Sempre string ISO
  isVerified?: boolean;
  isAnonymous?: boolean; // Se foi enviado sem cadastro
}

export interface CityTip {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  imageUrls: string[];
  mapUrl?: string;
  target: 'driver' | 'client';
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  createdAt: string; // Sempre string ISO
  updatedAt?: string; // Sempre string ISO
  // Sistema de avaliação
  averageRating?: number; // 0-5
  reviewCount?: number;
  reviews?: CityTipReview[];
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
  isZeroKm?: boolean;
  type: 'hatch' | 'sedan' | 'suv' | 'minivan' | 'other';
  condition: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'flex' | 'gnv' | 'hybrid' | 'electric';
  description: string;
  internalNotes?: string;
  status: 'Disponível' | 'Alugado' | 'Em Manutenção';
  moderationStatus?: 'Pendente' | 'Aprovado' | 'Rejeitado';
  dailyRate: number;
  imageUrls: string[];
  paymentInfo: PaymentInfo;
  perks: VehiclePerk[];
  createdAt: Timestamp | string;
  hasParkingLot?: boolean;
  parkingLotAddress?: string;
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
  priceId: string; 
  popular?: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'usage';
  createdAt: Timestamp | string;

  packageId?: string;
  packageName?: string;
  creditsPurchased?: number;
  amountPaid?: number;
  paymentId?: string;

  creditsUsed?: number;
  usageReason?: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  provider: string; 
  title: string;
  category: string;
  description: string;
  price: string;
  status: 'Ativo' | 'Pausado' | 'Pendente' | 'Rejeitado';
  imageUrls: string[];
  createdAt: Timestamp | string;
}

export interface PaymentGatewaySettings {
    activeGateway?: 'mercadoPago' | 'stripe';
    mercadoPago?: {
        publicKey?: string;
        accessToken?: string;
    };
    stripe?: {
        publicKey?: string;
        secretKey?: string;
    }
}

export interface AnalyticsData {
    pageViews?: {
        home?: number;
        blog?: number;
        events?: number;
        courses?: number;
        services?: number;
        rentals?: number;
        library?: number;
        spdicas?: number;
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
    contentViews?: {
        blog_total_views?: number;
        event_total_views?: number;
        course_total_views?: number;
        service_total_views?: number;
    };
    contentShares?: {
        blog_total_shares?: number;
        event_total_shares?: number;
        course_total_shares?: number;
        service_total_shares?: number;
        platform_shares?: {
            facebook?: number;
            twitter?: number;
            whatsapp?: number;
            linkedin?: number;
            copy_link?: number;
        };
    };
    topContent?: {
        blog?: Array<{ id: string; title: string; views: number; shares: number }>;
        events?: Array<{ id: string; title: string; views: number; shares: number }>;
        courses?: Array<{ id: string; title: string; views: number; shares: number }>;
        services?: Array<{ id: string; title: string; views: number; shares: number }>;
    };
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
    imageUrls: string[];
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
  content: string; 
  imageUrls: string[];
  category: string;
  authorId: string;
  authorName: string;
  status: 'Published' | 'Draft';
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  imageFile?: File; 
  source?: string;
  sourceUrl?: string;
  relatedLinks?: RelatedLink[];
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    imageUrls: string[];
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

export type AdminUser = Omit<UserProfile, 'createdAt' | 'cnhExpiration' | 'condutaxExpiration' | 'alvaraExpiration' | 'lastNotificationCheck' | 'lastSeekingRentalsCheck'> & {
    createdAt: string;
    cnhExpiration?: string;
    condutaxExpiration?: string;
    alvaraExpiration?: string;
    lastNotificationCheck?: string;
    lastSeekingRentalsCheck?: string;
    vehicleCount?: number;
    serviceCount?: number;
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
  ownerId: string; 
  ownerName: string;
  isPublic: boolean;
  createdAt: Timestamp | string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  coverImageUrl: string;
  pdfUrl: string;
  accessCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Timestamp | string;
}

export interface UserBookProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: Timestamp | string;
}

export interface Theme {
  id?: string;
  name: string;
  colors: {
    '--background': string;
    '--foreground': string;
    '--card': string;
    '--primary': string;
    '--primary-foreground': string;
    '--secondary': string;
    '--accent': string;
    '--destructive': string;
    '--border': string;
    '--input': string;
    '--ring': string;
  }
}

export interface GlobalSettings {
  siteName: string;
  logoUrl: string;
  contactEmail?: string;
  contactPhone?: string;
  
  activeGateway?: 'mercadoPago' | 'stripe';
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  
  activeThemeName: string;
  themes: Theme[];

  socialMedia?: {
    instagram: { url: string; enabled: boolean };
    facebook: { url: string; enabled: boolean };
    whatsapp: { url: string; enabled: boolean };
  };

  seo?: {
    metaDescription?: string;
    metaKeywords?: string;
  };
  
  homepage?: {
    showAgenda?: boolean;
    showTestimonials?: boolean;
    showPartners?: boolean;
  };
  
  user?: {
    allowPublicRegistration?: boolean;
    defaultNewUserCredits?: number;
  };

  legal?: {
    termsOfService?: string;
    privacyPolicy?: string;
  };
}

export type MatchDetails = {
  vehicleType: boolean;
  transmission: boolean;
  fuelType: boolean;
  price: boolean;
  profileCompleteness: boolean;
  rating: boolean;
  creditCard: boolean;
};

export interface MatchResult {
  driver: AdminUser;
  score: number;
  details: MatchDetails;
}

export type HomePageServiceListing = Pick<ServiceListing, 'id' | 'title' | 'provider' | 'category' | 'price' | 'status' | 'imageUrls'> & { imageHint: string };
