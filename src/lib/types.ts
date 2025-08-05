

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
    alvaraInspectionDate?: Timestamp;
    ipemInspectionDate?: Timestamp;
    licensingExpiration?: Timestamp;
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

export interface SupportingMaterialFile {
  name: string;
  size: number;
  type?: string;
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
  // Elementos básicos de texto
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string; style?: 'default' | 'accent' | 'gradient' | 'outline' }
  | { type: 'paragraph'; text: string; style?: 'default' | 'quote' | 'highlight' | 'code' }
  | { type: 'list'; style: 'bullet' | 'numbered' | 'checklist' | 'timeline'; items: string[]; icon?: string }
  | { type: 'quote'; text: string; author?: string; source?: string; style?: 'default' | 'accent' | 'bordered' }
  | { type: 'code'; code: string; language?: string; title?: string; showLineNumbers?: boolean }
  | { type: 'callout'; text: string; calloutType: 'info' | 'warning' | 'success' | 'error'; icon?: string }
  | { type: 'divider'; style?: 'solid' | 'dashed' | 'dotted' | 'gradient' }
  
  // Elementos de mídia
  | { type: 'image'; url: string; alt?: string; caption?: string; style?: 'default' | 'rounded' | 'bordered' | 'shadow' | 'overlay'; size?: 'small' | 'medium' | 'large' | 'full' }
  | { type: 'video'; url: string; platform?: 'youtube' | 'vimeo' | 'direct'; title?: string; autoplay?: boolean; controls?: boolean; loop?: boolean }
  | { type: 'audio'; url: string; title?: string; duration?: number; showWaveform?: boolean; autoplay?: boolean }
  | { type: 'pdf'; url: string; title?: string; filename?: string; showPreview?: boolean }
  | { type: 'gallery'; images: Array<{ url: string; alt?: string; caption?: string }>; layout?: 'grid' | 'carousel' | 'masonry'; columns?: number }
  | { type: 'slideshow'; slides: Array<{ imageUrl: string; title?: string; description?: string }>; autoplay?: boolean; interval?: number }
  | { type: 'embed'; url: string; title?: string; height?: number; allowFullscreen?: boolean }
  
  // Elementos de layout
  | { type: 'columns'; columns: Array<{ content: ContentBlock[]; width?: number }>; gap?: number }
  | { type: 'card'; title?: string; content: ContentBlock[]; style?: 'default' | 'elevated' | 'outlined' | 'filled'; color?: string }
  | { type: 'container'; content: ContentBlock[]; background?: string; padding?: number; border?: string }
  | { type: 'grid'; items: Array<{ content: ContentBlock[]; span?: number }>; columns?: number; gap?: number }
  | { type: 'tabs'; tabs: Array<{ title: string; content: ContentBlock[]; icon?: string }>; style?: 'default' | 'pills' | 'underline' }
  | { type: 'accordion'; items: Array<{ title: string; content: ContentBlock[]; icon?: string; defaultOpen?: boolean }> }
  | { type: 'carousel'; slides: Array<{ content: ContentBlock[]; title?: string }>; autoplay?: boolean; showIndicators?: boolean }
  
  // Elementos de dados e tabelas
  | { type: 'table'; headers: string[]; rows: string[][]; style?: 'default' | 'striped' | 'bordered' | 'compact' }
  | { type: 'comparison_table'; title: string; columns: string[]; rows: Array<{ id: string; feature: string; values: string[] }>; highlight?: string }
  | { type: 'chart'; chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'; data: any; options?: any; title?: string }
  | { type: 'progress'; value: number; max: number; label?: string; style?: 'default' | 'gradient' | 'animated' }
  | { type: 'stats'; items: Array<{ label: string; value: string | number; icon?: string; color?: string }>; layout?: 'horizontal' | 'vertical' | 'grid' }
  | { type: 'timeline'; title: string; events: Array<{ id: string; date: string; title: string; description: string; imageUrl?: string; color?: string }>; style?: 'default' | 'vertical' | 'horizontal' }
  
  // Elementos interativos educativos
  | { type: 'exercise'; question: string; answer: string; hints?: string[]; exerciseType?: 'text' | 'multiple_choice' | 'true_false' }
  | { type: 'quiz'; questions: QuizQuestion[]; timeLimit?: number; passingScore?: number; showResults?: boolean }
  | { type: 'observation'; text: string; icon?: string; observationType?: 'tip' | 'warning' | 'note' | 'example' }
  | { type: 'interactive_simulation'; title: string; description?: string; scenario: string; options: Array<{ id: string; text: string; outcome: string; isCorrect: boolean }>; feedback?: string }
  | { type: 'case_study'; title: string; description: string; background: string; challenge: string; questions: string[]; solution?: string; keyLearnings?: string[] }
  | { type: 'mind_map'; title: string; centralTopic: string; branches: Array<{ id: string; text: string; subBranches?: Array<{ id: string; text: string }> }>; style?: 'radial' | 'tree' | 'flowchart' }
  | { type: 'flashcard'; front: string; back: string; category?: string; difficulty: 'easy' | 'medium' | 'hard'; showHint?: boolean }
  | { type: 'fill_blanks'; title: string; text: string; blanks: Array<{ id: string; correctAnswer: string; hints?: string[]; alternatives?: string[] }>; caseSensitive?: boolean }
  | { type: 'matching'; title: string; leftItems: Array<{ id: string; text: string }>; rightItems: Array<{ id: string; text: string; correctMatch: string }>; shuffle?: boolean }
  | { type: 'drag_drop'; title: string; description: string; items: Array<{ id: string; text: string; correctZone: string }>; zones: Array<{ id: string; title: string; description?: string }>; feedback?: string }
  | { type: 'hotspot'; title: string; imageUrl: string; hotspots: Array<{ id: string; x: number; y: number; radius: number; title: string; description: string; isCorrect: boolean }>; showLabels?: boolean }
  | { type: 'word_search'; title: string; grid: string[][]; words: Array<{ id: string; word: string; direction: 'horizontal' | 'vertical' | 'diagonal'; startX: number; startY: number }>; showHints?: boolean }
  | { type: 'crossword'; title: string; grid: Array<Array<{ letter?: string; number?: number; isBlack: boolean }>>; clues: { across: Array<{ number: number; clue: string; answer: string }>; down: Array<{ number: number; clue: string; answer: string }> } }
  | { type: 'scenario_builder'; title: string; description: string; variables?: Array<{ id: string; name: string; variableType: 'text' | 'number' | 'boolean' | 'select'; options?: string[]; defaultValue?: string }>; outcomes: Array<{ id: string; condition: string; result: string; feedback?: string }> }
  
  // Elementos de apresentação (estilo PowerPoint)
  | { type: 'slide_title'; title: string; subtitle?: string; background?: string; textColor?: string; alignment?: 'left' | 'center' | 'right' }
  | { type: 'bullet_points'; title?: string; points: string[]; style?: 'default' | 'numbered' | 'icons' | 'animated'; icon?: string }
  | { type: 'feature_comparison'; title: string; features: Array<{ name: string; values: string[] }>; highlight?: string }
  | { type: 'process_flow'; title: string; steps: Array<{ title: string; description: string; icon?: string }>; style?: 'horizontal' | 'vertical' | 'circular' }
  | { type: 'before_after'; title: string; before: { image: string; label: string }; after: { image: string; label: string }; description?: string }
  | { type: 'testimonial'; quote: string; author: string; role?: string; company?: string; avatar?: string; rating?: number }
  | { type: 'pricing_table'; title: string; plans: Array<{ name: string; price: string; features: string[]; highlighted?: boolean; buttonText?: string }> }
  | { type: 'team_members'; title: string; members: Array<{ name: string; role: string; avatar?: string; bio?: string; social?: { linkedin?: string; twitter?: string } }> }
  | { type: 'contact_info'; title: string; items: Array<{ contactType: 'email' | 'phone' | 'address' | 'website'; value: string; icon?: string }> }
  
  // Elementos de navegação
  | { type: 'navigation_menu'; items: Array<{ title: string; url: string; icon?: string; external?: boolean }>; style?: 'horizontal' | 'vertical' | 'dropdown' }
  | { type: 'breadcrumb'; items: Array<{ title: string; url?: string }> }
  | { type: 'pagination'; currentPage: number; totalPages: number; onPageChange?: (page: number) => void }
  
  // Elementos de formulário
  | { type: 'form'; fields: Array<{ fieldType: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'; name: string; label: string; required?: boolean; options?: string[] }>; submitText?: string }
  | { type: 'poll'; question: string; options: Array<{ id: string; text: string; votes: number }>; allowMultiple?: boolean; showResults?: boolean }
  | { type: 'rating'; title: string; maxRating: number; currentRating?: number; showLabels?: boolean }
  
  // Elementos de mídia avançados
  | { type: 'video_playlist'; title: string; videos: Array<{ url: string; title: string; duration?: number; thumbnail?: string }>; autoplay?: boolean }
  | { type: 'audio_playlist'; title: string; tracks: Array<{ url: string; title: string; artist?: string; duration?: number }>; autoplay?: boolean }
  | { type: '360_view'; imageUrl: string; title?: string; hotspots?: Array<{ x: number; y: number; title: string; description: string }> }
  | { type: 'virtual_tour'; title: string; scenes: Array<{ imageUrl: string; title: string; description?: string; hotspots?: Array<{ x: number; y: number; targetScene: number }> }> }
  
  // Elementos de gamificação
  | { type: 'achievement'; title: string; description: string; icon: string; unlocked?: boolean; progress?: number }
  | { type: 'leaderboard'; title: string; participants: Array<{ name: string; score: number; rank: number; avatar?: string }>; showTop?: number }
  | { type: 'badge'; title: string; description: string; icon: string; earned?: boolean; earnedAt?: string }
  
  // Elementos de comunicação
  | { type: 'chat_widget'; title: string; messages: Array<{ id: string; text: string; sender: 'user' | 'bot'; timestamp: string }>; placeholder?: string }
  | { type: 'comment_section'; title: string; comments: Array<{ id: string; author: string; text: string; timestamp: string; avatar?: string }>; allowReplies?: boolean }
  | { type: 'social_feed'; title: string; posts: Array<{ id: string; author: string; content: string; timestamp: string; likes: number; avatar?: string }> }
  
  // Elementos de notificação
  | { type: 'notification'; title: string; message: string; notificationType: 'info' | 'success' | 'warning' | 'error'; dismissible?: boolean; autoHide?: boolean }
  | { type: 'alert_banner'; title: string; message: string; alertType: 'info' | 'success' | 'warning' | 'error'; actionText?: string; actionUrl?: string }
  
  // Elementos de calendário
  | { type: 'calendar'; title: string; events: Array<{ id: string; title: string; date: string; time?: string; description?: string; color?: string }>; view?: 'month' | 'week' | 'day' }
  | { type: 'countdown'; title: string; targetDate: string; showDays?: boolean; showHours?: boolean; showMinutes?: boolean; showSeconds?: boolean }
  
  // Elementos de mapa
  | { type: 'map'; title: string; center: { lat: number; lng: number }; markers: Array<{ lat: number; lng: number; title: string; description?: string }>; zoom?: number }
  | { type: 'location_picker'; title: string; defaultLocation?: { lat: number; lng: number }; onLocationSelect?: (lat: number, lng: number) => void }
  
  // Elementos de código e desenvolvimento
  | { type: 'code_editor'; title: string; language: string; initialCode: string; theme?: 'light' | 'dark'; readOnly?: boolean }
  | { type: 'api_documentation'; title: string; endpoints: Array<{ method: string; path: string; description: string; parameters?: Array<{ name: string; parameterType: string; required: boolean }> }> }
  
  // Elementos de análise e métricas
  | { type: 'analytics_dashboard'; title: string; metrics: Array<{ name: string; value: string | number; change?: number; trend?: 'up' | 'down' | 'stable' }>; period?: string }
  | { type: 'data_table'; title: string; columns: Array<{ key: string; label: string; sortable?: boolean }>; data: any[]; pagination?: boolean; search?: boolean }
  
  // Elementos de acessibilidade
  | { type: 'accessibility_tools'; includeHighContrast?: boolean; includeScreenReader?: boolean; includeKeyboardNavigation?: boolean }
  | { type: 'language_selector'; languages: Array<{ code: string; name: string; flag?: string }>; currentLanguage: string }
  
  // Elementos de personalização
  | { type: 'theme_selector'; themes: Array<{ name: string; colors: { primary: string; secondary: string; background: string } }>; currentTheme: string }
  | { type: 'font_selector'; fonts: Array<{ name: string; family: string; preview?: string }>; currentFont: string }
  
  // Elementos de backup e sincronização
  | { type: 'auto_save_indicator'; lastSaved?: string; saving?: boolean; error?: string }
  | { type: 'version_history'; versions: Array<{ id: string; timestamp: string; author: string; description: string }>; currentVersion: string }
  
  // Elementos de colaboração
  | { type: 'collaboration_tools'; allowComments?: boolean; allowEditing?: boolean; showCollaborators?: boolean; maxCollaborators?: number }
  | { type: 'revision_history'; revisions: Array<{ id: string; timestamp: string; author: string; changes: string[] }> }
  
  // Elementos de exportação e compartilhamento
  | { type: 'export_options'; formats: Array<'pdf' | 'ppt' | 'doc' | 'html'>; includeMetadata?: boolean; watermark?: string }
  | { type: 'share_panel'; title: string; url: string; platforms: Array<'email' | 'whatsapp' | 'linkedin' | 'twitter' | 'facebook'>; embedCode?: string };

// Nova interface para páginas/trechos de aula
export interface LessonPage {
  id: string;
  title: string;
  type: 'text' | 'video' | 'audio' | 'pdf' | 'gallery' | 'quiz' | 'exercise' | 'mixed';
  order: number; // Para ordenação das páginas
  duration?: number; // Duração estimada da página em minutos
  
  // Conteúdo específico por tipo
  contentBlocks?: ContentBlock[]; // Para páginas de texto/mixed
  videoUrl?: string; // Para páginas de vídeo
  audioUrl?: string; // Para páginas de áudio
  pdfUrl?: string; // Para páginas de PDF
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }>; // Para galerias
  questions?: QuizQuestion[]; // Para quizzes
  individualQuiz?: any; // Para quiz individual configurado - tipo temporário
  exercise?: { question: string; answer: string; hints?: string[] }; // Para exercícios
  
  // Campos adicionais
  summary?: string; // Resumo da página
  observations?: string; // Observações importantes
  isCompleted?: boolean; // Para tracking de progresso por página
  
  // Feedback específico da página
  feedback?: {
    thumbsUp: number;
    thumbsDown: number;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      comment: string;
      createdAt: Timestamp | string;
    }>;
  };
  
  // Arquivos anexados
  files?: Array<{
    name: string;
    url: string;
  } | {
    name: string;
    size: number;
    type?: string;
  }>;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string; // Descrição geral da aula
  type: 'single' | 'multi_page'; // Tipo de aula: única ou múltiplas páginas
  totalDuration: number; // Duração total da aula
  
  // Estrutura antiga (para compatibilidade)
  content?: string; // compatibilidade antiga
  contentBlocks?: ContentBlock[]; // novo modelo
  audioFile?: string | SupportingMaterialFile;
  materials?: (SupportingMaterial | SupportingMaterialFile)[];
  questions?: QuizQuestion[];
  passingScore?: number;
  
  // Nova estrutura para múltiplas páginas
  pages?: LessonPage[]; // Array de páginas/trechos da aula
  
  // Campos gerais da aula
  summary?: string;
  observations?: string; // Campo de observações importantes
  order?: number; // Para ordenação drag-and-drop
  isCompleted?: boolean; // Para tracking de progresso geral
  
  // Feedback geral da aula
  feedback?: {
    thumbsUp: number;
    thumbsDown: number;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      comment: string;
      createdAt: Timestamp | string;
    }>;
  };
  
  // Configurações da aula
  settings?: {
    allowPageNavigation?: boolean; // Se permite navegar entre páginas livremente
    requireSequentialProgress?: boolean; // Se requer progresso sequencial
    showProgressBar?: boolean; // Se mostra barra de progresso
    autoAdvance?: boolean; // Se avança automaticamente
  };
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
  status?: 'Published' | 'Draft' | 'Archived';
  students?: number;
  difficulty?: 'Iniciante' | 'Intermediário' | 'Avançado';
  investmentCost?: number;
  priceInCredits?: number;
  authorInfo?: string;
  legalNotice?: string;
  revenue?: number;
  coverImageUrl?: string;
  
  // Novos campos da estrutura solicitada
  targetAudience?: string;
  estimatedDuration?: number; // em minutos
  isPublicListing?: boolean; // checkbox para listagem pública
  
  // Tipo de contrato
  contractType?: 'own_content' | 'partner_content';
  saleValue?: number;
  
  // Controle financeiro
  courseType?: 'own_course' | 'partner_course';
  partnerName?: string;
  paymentType?: 'fixed' | 'percentage' | 'free' | 'exchange';
  contractStatus?: 'negotiating' | 'signed' | 'expired';
  contractPdfUrl?: string;
  
  // SEO e tags
  seoTags?: string[];
  
  // Configurações de avaliação
  enableComments?: boolean;
  autoCertification?: boolean;
  minimumPassingScore?: number;
  
  // Métricas de desempenho
  completionRate?: number;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
  
  // Campos de criação
  createdBy?: string;
  createdByName?: string;
  updatedAt?: Timestamp | string;
  updatedBy?: string;
  updatedByName?: string;
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
  description: string;
  location: string;
  region: string;
  imageUrls?: string[];
  mapUrl?: string;
  target: 'driver' | 'client' | 'both';
  tags: string[];
  comment?: string;
  tipType: 'gastronomia' | 'day-off' | 'pousada' | 'turismo' | 'cultura' | 'nightlife' | 'roteiros' | 'compras' | 'aventura' | 'familia' | 'pet' | 'outro';
  
  // Campos específicos por categoria
  gastronomia?: {
    priceRange: '$' | '$$' | '$$$' | '$$$$';
    cuisineType: string;
    openingHours: string;
    menuUrl?: string;
  };
  
  dayOff?: {
    travelTime: string;
    estimatedCost: string;
    positivePoints: string[];
    nearbyFood?: string;
    idealFor: string[];
    bonusTip?: string;
  };
  
  pousada?: {
    partnershipType: 'discount' | 'gift' | 'other';
    couponCode?: string;
    validUntil?: string;
    bookingUrl?: string;
    whatsapp?: string;
    averagePrice: string;
  };
  
  turismo?: {
    bestTime: string;
    needsTicket: boolean;
    ticketUrl?: string;
    hasLocalGuide: boolean;
    accessibilityLevel: 'low' | 'medium' | 'high';
  };

  cultura?: {
    eventType: string;
    entryFee: string;
    schedule: string;
    website?: string;
    hasGuidedTour: boolean;
    suitableForChildren: boolean;
  };

  nightlife?: {
    musicType: string;
    dressCode?: string;
    ageRestriction?: string;
    coverCharge?: string;
    parkingAvailable: boolean;
    foodAvailable: boolean;
  };

  roteiros?: {
    duration: string;
    distance: string;
    transportation: string;
    bestSeason: string;
    difficulty: 'easy' | 'medium' | 'hard';
    includesGuide: boolean;
  };

  compras?: {
    storeType: string;
    priceRange: '$' | '$$' | '$$$' | '$$$$';
    specialties: string[];
    parking: boolean;
    foodCourt: boolean;
    openingHours: string;
  };

  aventura?: {
    activityType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: string;
    equipmentNeeded: boolean;
    guideRequired: boolean;
    bestSeason: string;
    safetyLevel: 'low' | 'medium' | 'high';
  };

  familia?: {
    ageRange: string;
    activities: string[];
    hasPlayground: boolean;
    hasFood: boolean;
    hasBathroom: boolean;
    strollerFriendly: boolean;
    priceRange: '$' | '$$' | '$$$' | '$$$$';
  };

  pet?: {
    petTypes: string[];
    hasPetArea: boolean;
    hasPetMenu: boolean;
    requiresLeash: boolean;
    hasVetNearby: boolean;
    petFee?: string;
  };
  
  // Campos adicionais
  contributorName?: string;
  status: 'draft' | 'published' | 'pending';
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviewCount?: number;
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

// Tipos para o Guia Premium de Locais e Roteiros
export interface Location {
  id: string;
  name: string;
  description: string;
  category: LocationCategory;
  region: Region;
  subRegion?: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  features: LocationFeature[];
  tips: string[];
  taxiTips: string[];
  parkingInfo: ParkingInfo;
  bathroomInfo: BathroomInfo;
  averageFare?: number;
  openingHours?: string;
  phone?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  theme: RouteTheme;
  duration: number; // em minutos
  distance: number; // em km
  estimatedFare: number;
  stops: RouteStop[];
  tips: string[];
  targetAudience: 'driver' | 'client' | 'both';
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStop {
  locationId: string;
  location: Location;
  order: number;
  duration: number; // tempo de parada em minutos
  description: string;
  tips: string[];
}

export type LocationCategory = 
  | 'comida-boa-barata'
  | 'bares-baladas'
  | 'banheiros-limpos'
  | 'cafes-padarias-24h'
  | 'parques-pracas'
  | 'postos-estrutura'
  | 'estacionamento-facil'
  | 'espacos-kids'
  | 'pontos-turisticos'
  | 'shoppings-centros'
  | 'mercadões-feiras'
  | 'hospedagem-rapida';

export type Region = 
  | 'zona-norte'
  | 'zona-sul'
  | 'zona-leste'
  | 'zona-oeste'
  | 'centro-expandido'
  | 'abc-paulista'
  | 'osasco-barueri'
  | 'guarulhos'
  | 'taboao-embu'
  | 'baixada-santista'
  | 'litoral-norte'
  | 'litoral-sul'
  | 'campinas'
  | 'sorocaba'
  | 'vale-paraiba'
  | 'ribeirao-preto'
  | 'sao-jose-rio-preto';

export type RouteTheme = 
  | 'day-off-motorista'
  | 'rota-turistica'
  | 'gastronomia'
  | 'cultura-arte'
  | 'natureza-parques'
  | 'compras-shoppings'
  | 'vida-noturna'
  | 'familia-kids'
  | 'romantico'
  | 'aventura';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface LocationFeature {
  type: 'wifi' | 'parking' | 'bathroom' | 'food' | 'drinks' | 'kids' | 'pet-friendly' | 'accessible' | '24h' | 'delivery';
  available: boolean;
  description?: string;
}

export interface ParkingInfo {
  available: boolean;
  type: 'free' | 'paid' | 'street' | 'none';
  description?: string;
  price?: string;
}

export interface BathroomInfo {
  available: boolean;
  clean: boolean;
  rating: number; // 1-5
  description?: string;
}

export interface LocationReview {
  id: string;
  locationId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerType: 'driver' | 'client';
  createdAt: Date;
}

// ===== SISTEMA DE DOSSIÊ DO MOTORISTA =====

export interface DriverDossierPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: DossierFeature[];
  popular?: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
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

export interface DriverDossier {
  id: string;
  driverId: string;
  driverName: string;
  fleetId: string;
  fleetName: string;
  packageId: string;
  packageName: string;
  status: 'processing' | 'completed' | 'failed';
  price: number;
  paymentId: string;
  
  // Dados básicos do motorista
  basicProfile: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    photoUrl?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Análise financeira
  financialAnalysis: {
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
      accountType: string;
      balance: number;
      status: 'active' | 'inactive' | 'blocked';
    }>;
    incomeSources: Array<{
      type: 'salary' | 'freelance' | 'business' | 'other';
      amount: number;
      frequency: 'monthly' | 'weekly' | 'daily';
      verified: boolean;
    }>;
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Verificação Serasa
  serasaCheck: {
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
  
  // Validação de contatos
  contactValidation: {
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
  
  // Validação de endereço
  addressValidation: {
    valid: boolean;
    coordinates: {
      lat: number;
      lng: number;
    };
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    addressType: 'residential' | 'commercial' | 'mixed';
    timeAtAddress: string;
    previousAddresses: Array<{
      address: string;
      period: string;
      reason: string;
    }>;
    mapUrl: string;
  };
  
  // Histórico de trabalho
  workHistory: {
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
    totalExperience: number; // em anos
    stabilityScore: number; // 1-10
  };
  
  // Verificação de documentos
  documentVerification: {
    cnh: {
      valid: boolean;
      number: string;
      category: string;
      expiration: string;
      points: number;
      restrictions: string[];
      status: 'valid' | 'expired' | 'suspended' | 'cancelled';
    };
    condutax: {
      valid: boolean;
      number: string;
      expiration: string;
      status: 'valid' | 'expired' | 'suspended';
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
  
  // Análise de redes sociais
  socialMediaAnalysis: {
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
  
  // Verificação de antecedentes criminais
  criminalRecord: {
    hasRecord: boolean;
    records: Array<{
      type: string;
      date: string;
      status: string;
      description: string;
    }>;
    riskLevel: 'low' | 'medium' | 'high';
    lastCheck: string;
  };
  
  // Preferências de veículos
  vehiclePreferences: {
    preferredTypes: string[];
    preferredTransmission: 'automatic' | 'manual' | 'indifferent';
    preferredFuelTypes: string[];
    maxDailyRate: number;
    preferredFeatures: string[];
    drivingStyle: 'conservative' | 'moderate' | 'aggressive';
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
  };
  
  // Avaliação de risco
  riskAssessment: {
    overallScore: number; // 1-100
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
  
  // Relatório abrangente
  comprehensiveReport: {
    summary: string;
    keyFindings: string[];
    redFlags: string[];
    greenFlags: string[];
    recommendations: string[];
    conclusion: string;
    generatedAt: string;
    validUntil: string;
  };
  
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  expiresAt: Timestamp | string;
}

export interface CourseSuggestion {
  id: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  suggestion: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  adminNotes?: string;
}

export interface DossierPurchase {
  id: string;
  fleetId: string;
  driverId: string;
  packageId: string;
  status: 'pending' | 'pending_admin_review' | 'processing' | 'completed' | 'failed' | 'rejected';
  price: number;
  paymentId?: string;
  dossierId?: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  completedAt?: Timestamp | string;
  adminApprovedAt?: Timestamp | string;
  rejectedAt?: Timestamp | string;
  rejectionReason?: string;
  error?: string;
}
