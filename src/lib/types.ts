
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  role: 'driver' | 'fleet' | 'provider' | 'admin';
  name?: string; // Para motoristas e admin
  cpf?: string;
  nomeFantasia?: string; // Para frotas e prestadores PJ
  razaoSocial?: string; // Para frotas e prestadores PJ
  cnpj?: string; // Para frotas e prestadores PJ
  personType?: 'pf' | 'pj'; // Para frotas e prestadores
  companyDescription?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  photoUrl?: string;
  profileStatus: 'incomplete' | 'pending_review' | 'approved' | 'rejected';
  createdAt: string | Date | Timestamp;
  credits?: number;
  averageRating?: number;
  reviewCount?: number;
  // --- Campos de Motorista ---
  bio?: string;
  cnhNumber?: string;
  cnhCategory?: 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';
  cnhExpiration?: string | Date | Timestamp;
  condutaxNumber?: string;
  condutaxExpiration?: string | Date | Timestamp;
  alvaraExpiration?: string | Date | Timestamp;
  alvaraInspectionDate?: string | Date | Timestamp;
  ipemInspectionDate?: string | Date | Timestamp;
  licensingExpiration?: string | Date | Timestamp;
  hasWhatsApp?: boolean;
  garageInfo?: 'covered' | 'uncovered' | 'building_garage' | 'none';
  workMode?: 'owner' | 'rental';
  vehicleLicensePlate?: string; // Para motoristas proprietários
  isSeekingRentals?: boolean; // Motorista está procurando aluguel?
  lastSeekingRentalsCheck?: string | Date | Timestamp;
  financialConsent?: boolean;
  hasCreditCardForDeposit?: boolean;
  specializedCourses?: string[];
  languageLevel?: string;
  otherCourses?: string;
  workHistory?: {
    id?: string;
    fleetName: string;
    period: string;
    reasonForLeaving?: string;
    hasOutstandingDebt?: boolean;
  }[];
  rentalPreferences?: {
    vehicleTypes?: string[];
    transmission?: 'automatic' | 'manual' | 'indifferent';
    fuelTypes?: string[];
    maxDailyRate?: number;
  };
  reference?: {
    name: string;
    relationship: string;
    phone: string;
  };
  // --- Campos de Frota ---
  amenities?: { id: string; label: string; }[];
  otherAmenities?: string;
  galleryImages?: { url: string }[];
  // --- Campos de Prestador ---
  // (Campos comuns como nomeFantasia, cnpj, etc., já estão incluídos)
  // --- Campos de Admin/Sistema ---
  loginCount?: number;
  sessionValidSince?: string | Date | Timestamp;
  lastNotificationCheck?: string | Date | Timestamp;
  earnedBadges?: { name: string; date: string }[];
  profileViewCount?: number;
}

export type AdminUser = UserProfile & {
  vehicleCount?: number;
  serviceCount?: number;
};

export interface Vehicle {
  id: string;
  fleetId: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  type: 'hatch' | 'sedan' | 'suv' | 'minivan' | 'other';
  status: 'Disponível' | 'Alugado' | 'Em Manutenção';
  dailyRate: number;
  imageUrls: string[];
  condition: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'flex' | 'gnv' | 'hybrid' | 'electric';
  description: string;
  perks: VehiclePerk[];
  moderationStatus: 'Pendente' | 'Aprovado' | 'Rejeitado';
  createdAt: string | Date | Timestamp;
  updatedAt?: string | Date | Timestamp;
  isZeroKm?: boolean;
  hasParkingLot?: boolean;
  parkingLotAddress?: string;
  internalNotes?: string;
  paymentInfo: {
    terms: string;
    methods: string[];
  };
}

export interface VehicleApplication {
  id: string;
  driverId: string;
  driverName: string;
  driverPhotoUrl: string;
  driverProfileStatus: string;
  vehicleId: string;
  vehicleName: string;
  fleetId: string;
  company: string;
  appliedAt: string | Date | Timestamp;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface VehiclePerk {
  id: string;
  label: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  provider: string; // Nome do prestador
  title: string;
  category: string;
  description: string;
  price: string;
  imageUrls: string[];
  status: 'Ativo' | 'Pausado' | 'Pendente' | 'Rejeitado';
  createdAt: string | Date | Timestamp;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Draft' | 'Published' | 'Archived';
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  modules: Module[];
  totalLessons: number;
  totalDuration: number; // in minutes
  coverImageUrl?: string;
  students?: number;
  revenue?: number; // Receita gerada pelo curso
  investmentCost?: number; // Custo de produção/investimento
  createdAt: string | Date | Timestamp;
  updatedAt?: string | Date | Timestamp;
  isPublicListing?: boolean;
  // Campos da estrutura completa
  targetAudience?: string;
  contractType?: 'own_content' | 'partner_content';
  saleValue?: number;
  courseType?: 'own_course' | 'partner_course';
  partnerName?: string;
  paymentType?: 'fixed' | 'percentage' | 'free' | 'exchange';
  contractStatus?: 'negotiating' | 'signed' | 'expired';
  contractPdfUrl?: string;
  seoTags?: string[];
  enableComments?: boolean;
  autoCertification?: boolean;
  minimumPassingScore?: number;
  authorInfo?: string;
  legalNotice?: string;
  completionRate?: number;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
  createdBy?: string;
  createdByName?: string;
  priceInCredits?: number;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: Lesson[];
  badge?: { name: string; imageUrl: string };
}

export interface Lesson {
  id: string;
  title: string;
  type: 'single' | 'multi_page';
  content?: string;
  totalDuration: number;
  pages: LessonPage[];
  materials?: Material[];
  questions?: any[];
  exercises?: any[];
  summaries?: any[];
  exams?: any[];
  knowledgeTests?: any[];
  interactiveActivities?: any[];
  resources?: any[];
  passingScore?: number;
}

export interface LessonPage {
  id: string;
  title: string;
  type: 'text' | 'video' | 'audio' | 'pdf' | 'gallery' | 'quiz' | 'exercise' | 'mixed';
  order: number;
  duration: number; // in minutes
  contentBlocks?: ContentBlock[];
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  galleryImages?: { url: string; alt?: string; caption?: string }[];
  questions?: any[];
  exercise?: { question: string; answer: string; hints?: string[] };
  summary?: string;
  observations?: string;
  isCompleted?: boolean;
  feedback?: {
    thumbsUp: number;
    thumbsDown: number;
    comments: any[];
  };
}

export interface Material {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'audio' | 'document' | 'presentation' | 'spreadsheet' | 'image';
    url?: string;
    file?: string;
    size?: number;
    tags?: string[];
}

export interface CreditPackage {
    id: string;
    name: string;
    description: string;
    credits: number;
    price: number;
    priceId: string; // From Mercado Pago
    popular: boolean;
    createdAt?: string | Date | Timestamp;
    updatedAt?: string | Date | Timestamp;
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'purchase' | 'usage';
    creditsPurchased?: number;
    creditsUsed?: number;
    amountPaid?: number;
    usageReason?: string;
    packageName?: string;
    packageId?: string;
    paymentId?: string;
    createdAt: string | Date | Timestamp;
}

export interface PaymentGatewaySettings {
    activeGateway: 'mercadoPago' | 'stripe';
    mercadoPago?: {
        publicKey?: string;
        accessToken?: string;
    }
    stripe?: {
        publicKey?: string;
        secretKey?: string;
    }
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    targetAudience: 'all' | 'drivers' | 'fleets' | 'providers' | 'admins';
    icon?: string;
    link?: string;
    createdAt: string | Date | Timestamp;
}

export interface Partner {
    id: string;
    name: string;
    linkUrl: string;
    imageUrls: string[];
    size: 'small' | 'medium' | 'large';
    isActive: boolean;
    createdAt: string | Date | Timestamp;
    updatedAt?: string | Date | Timestamp;
}

export interface QuizData {
    id: string;
    title: string;
    status: 'Draft' | 'Active';
    questions: {
        id: string;
        question: string;
        options: { id: string; text: string; }[];
        correctOptionId: string;
    }[];
    createdAt: string | Date | Timestamp;
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
  startDate: string | Date | Timestamp;
  createdAt: string | Date | Timestamp;
  updatedAt?: string | Date | Timestamp;
  category?: 'show' | 'festa' | 'esporte' | 'corporativo' | 'outro';
  isRecurring?: boolean;
  recurrenceRule?: string;
  parentId?: string; // Para vincular eventos recorrentes
  status?: 'active' | 'cancelled' | 'archived';
}


export interface LibraryBook {
    id: string;
    title: string;
    author: string;
    category: string;
    description: string;
    coverImageUrl: string;
    pdfUrl: string;
    accessCount: number;
    averageRating: number;
    reviewCount: number;
    createdAt: string | Date | Timestamp;
}

export interface UserBookProgress {
    bookId: string;
    currentPage: number;
    totalPages: number;
    lastReadAt: string | Date | Timestamp;
}

export interface Review {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: UserProfile['role'];
    revieweeId: string;
    revieweeRole: UserProfile['role'];
    rating: number;
    comment: string;
    createdAt: string | Date | Timestamp;
    status: 'pending' | 'approved' | 'rejected';
    relatedTo?: string; // Ex: ID do aluguel ou serviço
    relatedToName?: string; // Ex: "Locação do Onix"
}

export interface GalleryImage {
    id: string;
    url: string;
    name: string;
    category: string;
    isPublic: boolean;
    ownerId: string;
    ownerName: string;
    createdAt: string | Date | Timestamp;
}

export interface AnalyticsData {
  pageViews?: Record<string, number>;
  logins?: { total: number };
  sales?: { totalRevenue: number, packagesSold: number };
  userGrowth?: { month: string, total: number }[];
  contentViews?: Record<string, number>;
  contentShares?: Record<string, number>;
  topContent?: {
    blog?: { id: string; title: string; views: number; shares: number; }[];
    events?: { id: string; title: string; views: number; shares: number; }[];
    courses?: { id: string; title: string; views: number; shares: number; }[];
    services?: { id: string; title: string; views: number; shares: number; }[];
  };
}

export interface MatchResult {
  driver: AdminUser;
  score: number;
  details: MatchDetails;
}

export interface MatchDetails {
  vehicleType: boolean;
  transmission: boolean;
  fuelType: boolean;
  price: boolean;
  profileCompleteness: boolean;
  rating: boolean;
  creditCard: boolean;
}

export type DossierFeature = 
  | 'basic_profile' 
  | 'financial_analysis' 
  | 'serasa_check' 
  | 'contact_validation'
  | 'address_validation'
  | 'work_history'
  | 'document_verification'
  | 'social_media_analysis'
  | 'criminal_record'
  | 'credit_score'
  | 'income_verification'
  | 'vehicle_preferences'
  | 'risk_assessment'
  | 'comprehensive_report';

export interface DriverDossierPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: DossierFeature[];
  isActive: boolean;
  popular: boolean;
  createdAt: string | Date | Timestamp;
}

export interface DossierPurchase {
  id: string;
  fleetId: string;
  driverId: string;
  packageId: string;
  price: number;
  status: 'pending' | 'pending_payment' | 'pending_admin_review' | 'processing' | 'completed' | 'failed' | 'rejected';
  paymentId?: string;
  dossierId?: string;
  rejectionReason?: string;
  createdAt: string | Date | Timestamp;
  updatedAt?: string | Date | Timestamp;
  completedAt?: string | Date | Timestamp;
  rejectedAt?: string | Date | Timestamp;
  adminApprovedAt?: string | Date | Timestamp;
}

export interface DriverDossier {
  id: string;
  driverId: string;
  driverName: string;
  fleetId: string;
  fleetName: string;
  packageId: string;
  packageName: string;
  price: number;
  paymentId: string;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string | Date | Timestamp;
  updatedAt: string | Date | Timestamp;
  expiresAt: string | Date | Timestamp;
  
  // Seções baseadas nas features do pacote
  basicProfile: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    photoUrl?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  
  financialAnalysis?: {
    creditScore: number;
    creditLimit: number;
    outstandingDebts: number;
    paymentHistory: {
      onTime: number;
      late: number;
      defaulted: number;
    };
    bankAccounts: Array<{
      bank: string;
      accountType: 'checking' | 'savings';
      balance: number;
      status: 'active' | 'inactive';
    }>;
    incomeSources: Array<{
      type: 'salary' | 'rental' | 'investment';
      amount: number;
      frequency: 'monthly' | 'weekly' | 'daily';
      verified: boolean;
    }>;
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  serasaCheck?: {
    hasRestrictions: boolean;
    restrictionCount: number;
    totalDebt: number;
    lastUpdate: string;
    restrictions: Array<{
      creditor: string;
      amount: number;
      type: string;
      date: string;
    }>;
    score: number;
  };
  
  contactValidation?: {
    phone: {
      valid: boolean;
      carrier: string;
      type: 'mobile' | 'landline';
      lastSeen: string;
    };
    email: {
      valid: boolean;
      domain: string;
      lastActivity: string;
    };
    whatsapp: {
      hasWhatsApp: boolean;
      lastSeen: string;
    };
    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
      verified: boolean;
    }>;
  };
  
  addressValidation?: {
    valid: boolean;
    coordinates: {
      lat: number;
      lng: number;
    };
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    addressType: 'residential' | 'commercial';
    timeAtAddress: string;
    previousAddresses: string[];
    mapUrl: string;
  };
  
  workHistory?: {
    currentJob: {
      company: string;
      position: string;
      startDate: string;
      salary: number;
      verified: boolean;
    };
    previousJobs: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      reason: string;
      reference: string;
      verified: boolean;
    }>;
    totalExperience: number;
    stabilityScore: number;
  };
  
  documentVerification?: {
    cnh: {
      valid: boolean;
      number: string;
      category: string;
      expiration: string;
      points: number;
      restrictions: string[];
      status: 'valid' | 'expired' | 'suspended';
    };
    condutax: {
      valid: boolean;
      number: string;
      expiration: string;
      status: 'valid' | 'expired';
    };
    cpf: {
      valid: boolean;
      status: 'active' | 'suspended' | 'cancelled';
      lastUpdate: string;
    };
    rg: {
      valid: boolean;
      number: string;
      issuingAuthority: string;
      issueDate: string;
    };
  };
  
  socialMediaAnalysis?: {
    linkedin: {
      exists: boolean;
      profileUrl?: string;
      connections: number;
      lastActivity: string;
      professionalScore: number;
    };
    facebook: {
      exists: boolean;
      profileUrl?: string;
      friends: number;
      lastActivity: string;
    };
    instagram: {
      exists: boolean;
      profileUrl?: string;
      followers: number;
      lastActivity: string;
    };
    overallSocialScore: number;
  };
  
  criminalRecord?: {
    hasRecord: boolean;
    records: string[];
    riskLevel: 'low' | 'medium' | 'high';
    lastCheck: string;
  };
  
  vehiclePreferences?: {
    preferredTypes: string[];
    preferredTransmission: 'automatic' | 'manual' | 'indifferent';
    preferredFuelTypes: string[];
    maxDailyRate: number;
    preferredFeatures: string[];
    drivingStyle: 'aggressive' | 'moderate' | 'cautious';
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
  };
  
  riskAssessment?: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    factors: Array<{
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      weight: number;
      description: string;
    }>;
    recommendations: string[];
    insuranceRisk: 'low' | 'medium' | 'high';
  };
  
  comprehensiveReport?: {
    summary: string;
    keyFindings: string[];
    redFlags: string[];
    greenFlags: string[];
    recommendations: string[];
    conclusion: string;
    generatedAt: string;
    validUntil: string;
  };
}

export type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string; style?: 'default' | 'accent' | 'quote' }
  | { type: 'paragraph'; text: string; style?: 'default' | 'lead' | 'quote' | 'highlight' }
  | { type: 'list'; style: 'bullet' | 'numbered' | 'checklist' | 'timeline'; items: string[] }
  | { type: 'image'; url: string; alt?: string; caption?: string; style?: 'default' | 'rounded' | 'full' | 'shadow'; size?: 'small' | 'medium' | 'large' }
  | { type: 'video'; url: string; platform?: 'youtube' | 'vimeo' | 'direct'; title?: string; autoplay?: boolean }
  | { type: 'audio'; url: string; title?: string; duration?: number }
  | { type: 'pdf'; url: string; title?: string; filename?: string }
  | { type: 'gallery'; images: Array<{ url: string; alt?: string; caption?: string }>; style?: 'grid' | 'carousel' | 'masonry' }
  | { type: 'exercise'; question: string; answer: string; hints?: string[] }
  | { type: 'quiz'; questions: any[] } // Pode ser mais detalhado
  | { type: 'observation'; text: string; icon?: string }
  | { type: 'interactive_simulation'; title: string; description: string; scenario: string; options: Array<{ id: string; text: string; outcome: string; isCorrect: boolean }>; feedback?: string }
  | { type: 'case_study'; title: string; description: string; background: string; challenge: string; questions: string[]; solution: string; keyLearnings: string[] }
  | { type: 'mind_map'; title: string; centralTopic: string; branches: Array<{ id: string; text: string; subBranches: Array<{ id: string; text: string }> }> }
  | { type: 'flashcard'; front: string; back: string; category?: string; difficulty?: 'easy' | 'medium' | 'hard' }
  | { type: 'timeline'; title: string; events: Array<{ id: string; date: string; title: string; description: string; imageUrl?: string }> }
  | { type: 'comparison_table'; title: string; columns: string[]; rows: Array<{ id: string; feature: string; values: string[] }> }
  | { type: 'fill_blanks'; title: string; text: string; blanks: Array<{ id: string; correctAnswer: string; hints?: string[]; alternatives?: string[] }> }
  | { type: 'matching'; title: string; leftItems: Array<{ id: string; text: string }>; rightItems: Array<{ id: string; text: string; correctMatch: string }> }
  | { type: 'drag_drop'; title: string; description: string; items: Array<{ id: string; text: string; correctZone: string }>; zones: Array<{ id: string; title: string; description: string }> }
  | { type: 'hotspot'; title: string; imageUrl: string; hotspots: Array<{ id: string; x: number; y: number; radius: number; title: string; description: string; isCorrect: boolean }> }
  | { type: 'word_search'; title: string; grid: string[][]; words: Array<{ id: string; word: string; direction: 'horizontal' | 'vertical' | 'diagonal'; startX: number; startY: number }> }
  | { type: 'crossword'; title: string; grid: Array<Array<{ letter: string; number?: number; isBlack: boolean }>>; clues: { across: Array<{ number: number; clue: string }>; down: Array<{ number: number; clue: string }> } }
  | { type: 'scenario_builder'; title: string; description: string; variables: Array<{ id: string; name: string; initialValue: any }>; outcomes: Array<{ id: string; condition: string; result: string; feedback?: string }> }
  | { type: 'columns'; columns: Array<{ content: ContentBlock[] }> }
  | { type: 'card'; title: string; content: ContentBlock[]; style?: 'default' | 'outlined' | 'gradient' }
  | { type: 'container'; background?: string; content: ContentBlock[] }
  | { type: 'grid'; items: Array<{ content: ContentBlock[] }> }
  | { type: 'tabs'; tabs: Array<{ title: string; content: ContentBlock[] }> }
  | { type: 'accordion'; items: Array<{ title: string; content: ContentBlock[] }> }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'chart'; chartType: 'bar' | 'line' | 'pie'; data: any; title: string }
  | { type: 'progress'; value: number; label: string }
  | { type: 'stats'; items: Array<{ value: string; label: string; icon?: string }> }
  | { type: 'slide_title'; title: string; subtitle?: string; background?: string; textColor?: string; alignment?: 'left' | 'center' | 'right' }
  | { type: 'bullet_points'; title?: string; points: string[]; style?: 'default' | 'numbered' | 'icons' | 'animated'; icon?: string }
  | { type: 'feature_comparison'; title: string; items: Array<{ feature: string; option1: string; option2: string }> }
  | { type: 'process_flow'; title: string; steps: Array<{ title: string; description: string }> }
  | { type: 'before_after'; before: { url: string; label: string }; after: { url: string; label: string } }
  | { type: 'testimonial'; quote: string; author: string; role: string; avatarUrl?: string }
  | { type: 'quote'; text: string; author?: string; source?: string }
  | { type: 'callout'; text: string; type?: 'info' | 'warning' | 'success' | 'danger'; icon?: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'map'; lat: number; lng: number; zoom: number; markers?: Array<{ lat: number; lng: number; title: string }> }
  | { type: 'calendar'; events: any[] }
  | { type: 'code_editor'; initialCode: string; language: string }
  | { type: 'chat_widget'; title: string; initialMessages: any[] }
  | { type: '360_view'; imageUrl: string };
