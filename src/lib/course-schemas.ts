

import * as z from 'zod';

export const supportingMaterialSchema = z.union([
  z.object({
    name: z.string().min(1, "O nome do material é obrigatório."),
    url: z.string().url("URL inválida."),
  }),
  z.object({
    name: z.string(),
    size: z.number(),
    type: z.string().optional()
  })
]);

export const quizOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "O texto da opção é obrigatório."),
  isCorrect: z.boolean().default(false),
});

export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "A pergunta é obrigatória."),
  options: z.array(quizOptionSchema).min(2, "A questão deve ter pelo menos 2 opções."),
}).refine(data => data.options.filter(opt => opt.isCorrect).length === 1, {
  message: "Exatamente uma opção deve ser marcada como correta.",
  path: ['options'],
});

// Novos schemas para os tipos de conteúdo
export const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({ 
    type: z.literal('heading'), 
    level: z.number().min(1).max(4), 
    text: z.string().min(1, "O texto do cabeçalho é obrigatório.") 
  }),
  z.object({ 
    type: z.literal('paragraph'), 
    text: z.string().min(1, "O texto do parágrafo é obrigatório.") 
  }),
  z.object({ 
    type: z.literal('list'), 
    style: z.enum(['bullet', 'numbered']), 
    items: z.array(z.string().min(1, "Item da lista não pode estar vazio.")) 
  }),
  z.object({ 
    type: z.literal('image'), 
    url: z.string().url("URL da imagem inválida."), 
    alt: z.string().optional() 
  }),
  z.object({ 
    type: z.literal('video'), 
    url: z.string().url("URL do vídeo inválida."), 
    platform: z.enum(['youtube', 'vimeo', 'direct']).optional(),
    title: z.string().optional()
  }),
  z.object({ 
    type: z.literal('audio'), 
    url: z.string().url("URL do áudio inválida."), 
    title: z.string().optional(),
    duration: z.number().optional()
  }),
  z.object({ 
    type: z.literal('pdf'), 
    url: z.string().url("URL do PDF inválida."), 
    title: z.string().optional(),
    filename: z.string().optional()
  }),
  z.object({ 
    type: z.literal('gallery'), 
    images: z.array(z.object({
      url: z.string().url("URL da imagem inválida."),
      alt: z.string().optional(),
      caption: z.string().optional()
    })).min(1, "A galeria deve ter pelo menos uma imagem.")
  }),
  z.object({ 
    type: z.literal('exercise'), 
    question: z.string().min(1, "A pergunta do exercício é obrigatória."), 
    answer: z.string().min(1, "A resposta do exercício é obrigatória."), 
    hints: z.array(z.string()).optional() 
  }),
  z.object({ 
    type: z.literal('quiz'), 
    questions: z.array(quizQuestionSchema).min(1, "O quiz deve ter pelo menos uma questão.") 
  }),
  z.object({ 
    type: z.literal('observation'), 
    text: z.string().min(1, "O texto da observação é obrigatório."), 
    icon: z.string().optional() 
  }),
  // Novos elementos educativos
  z.object({ 
    type: z.literal('interactive_simulation'), 
    title: z.string().min(1, "O título da simulação é obrigatório."),
    description: z.string().optional(),
    scenario: z.string().min(1, "O cenário da simulação é obrigatório."),
    options: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "O texto da opção é obrigatório."),
      outcome: z.string().min(1, "O resultado da opção é obrigatório."),
      isCorrect: z.boolean().default(false)
    })).min(2, "A simulação deve ter pelo menos 2 opções."),
    feedback: z.string().optional()
  }),
  z.object({ 
    type: z.literal('case_study'), 
    title: z.string().min(1, "O título do caso é obrigatório."),
    description: z.string().min(1, "A descrição do caso é obrigatória."),
    background: z.string().min(1, "O contexto do caso é obrigatório."),
    challenge: z.string().min(1, "O desafio do caso é obrigatório."),
    questions: z.array(z.string().min(1, "A pergunta do caso é obrigatória.")).min(1, "O caso deve ter pelo menos uma pergunta."),
    solution: z.string().optional(),
    keyLearnings: z.array(z.string()).optional()
  }),
  z.object({ 
    type: z.literal('mind_map'), 
    title: z.string().min(1, "O título do mapa mental é obrigatório."),
    centralTopic: z.string().min(1, "O tópico central é obrigatório."),
    branches: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "O texto do ramo é obrigatório."),
      subBranches: z.array(z.object({
        id: z.string(),
        text: z.string().min(1, "O texto do sub-ramo é obrigatório.")
      })).optional()
    })).min(1, "O mapa mental deve ter pelo menos um ramo.")
  }),
  z.object({ 
    type: z.literal('flashcard'), 
    front: z.string().min(1, "O conteúdo da frente do cartão é obrigatório."),
    back: z.string().min(1, "O conteúdo do verso do cartão é obrigatório."),
    category: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
  }),
  z.object({ 
    type: z.literal('timeline'), 
    title: z.string().min(1, "O título da linha do tempo é obrigatório."),
    events: z.array(z.object({
      id: z.string(),
      date: z.string().min(1, "A data do evento é obrigatória."),
      title: z.string().min(1, "O título do evento é obrigatório."),
      description: z.string().min(1, "A descrição do evento é obrigatória."),
      imageUrl: z.string().url().optional()
    })).min(2, "A linha do tempo deve ter pelo menos 2 eventos.")
  }),
  z.object({ 
    type: z.literal('comparison_table'), 
    title: z.string().min(1, "O título da tabela é obrigatório."),
    columns: z.array(z.string().min(1, "O título da coluna é obrigatório.")).min(2, "A tabela deve ter pelo menos 2 colunas."),
    rows: z.array(z.object({
      id: z.string(),
      feature: z.string().min(1, "O nome da característica é obrigatório."),
      values: z.array(z.string().min(1, "O valor da célula é obrigatório."))
    })).min(1, "A tabela deve ter pelo menos uma linha.")
  }),
  z.object({ 
    type: z.literal('fill_blanks'), 
    title: z.string().min(1, "O título do exercício é obrigatório."),
    text: z.string().min(1, "O texto com lacunas é obrigatório."),
    blanks: z.array(z.object({
      id: z.string(),
      correctAnswer: z.string().min(1, "A resposta correta é obrigatória."),
      hints: z.array(z.string()).optional(),
      alternatives: z.array(z.string()).optional()
    })).min(1, "O exercício deve ter pelo menos uma lacuna.")
  }),
  z.object({ 
    type: z.literal('matching'), 
    title: z.string().min(1, "O título do exercício é obrigatório."),
    leftItems: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "O texto do item é obrigatório.")
    })).min(2, "O exercício deve ter pelo menos 2 itens."),
    rightItems: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "O texto do item é obrigatório."),
      correctMatch: z.string().min(1, "O ID do item correspondente é obrigatório.")
    })).min(2, "O exercício deve ter pelo menos 2 itens.")
  }),
  z.object({ 
    type: z.literal('drag_drop'), 
    title: z.string().min(1, "O título do exercício é obrigatório."),
    description: z.string().min(1, "A descrição do exercício é obrigatória."),
    items: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "O texto do item é obrigatório."),
      correctZone: z.string().min(1, "A zona correta é obrigatória.")
    })).min(2, "O exercício deve ter pelo menos 2 itens."),
    zones: z.array(z.object({
      id: z.string(),
      title: z.string().min(1, "O título da zona é obrigatório."),
      description: z.string().optional()
    })).min(2, "O exercício deve ter pelo menos 2 zonas.")
  }),
  z.object({ 
    type: z.literal('hotspot'), 
    title: z.string().min(1, "O título do exercício é obrigatório."),
    imageUrl: z.string().url("URL da imagem inválida."),
    hotspots: z.array(z.object({
      id: z.string(),
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
      radius: z.number().min(5).max(50).default(20),
      title: z.string().min(1, "O título do hotspot é obrigatório."),
      description: z.string().min(1, "A descrição do hotspot é obrigatória."),
      isCorrect: z.boolean().default(false)
    })).min(1, "O exercício deve ter pelo menos um hotspot.")
  }),
  z.object({ 
    type: z.literal('word_search'), 
    title: z.string().min(1, "O título do exercício é obrigatório."),
    grid: z.array(z.array(z.string().length(1))).min(5, "A grade deve ter pelo menos 5 linhas."),
    words: z.array(z.object({
      id: z.string(),
      word: z.string().min(2, "A palavra deve ter pelo menos 2 letras."),
      direction: z.enum(['horizontal', 'vertical', 'diagonal']).default('horizontal'),
      startX: z.number().min(0),
      startY: z.number().min(0)
    })).min(3, "O exercício deve ter pelo menos 3 palavras.")
  }),
  z.object({ 
    type: z.literal('crossword'), 
    title: z.string().min(1, "O título do exercício é obrigatório."),
    grid: z.array(z.array(z.object({
      letter: z.string().length(1).optional(),
      number: z.number().optional(),
      isBlack: z.boolean().default(false)
    }))).min(5, "A grade deve ter pelo menos 5 linhas."),
    clues: z.object({
      across: z.array(z.object({
        number: z.number(),
        clue: z.string().min(1, "A dica é obrigatória."),
        answer: z.string().min(1, "A resposta é obrigatória.")
      })),
      down: z.array(z.object({
        number: z.number(),
        clue: z.string().min(1, "A dica é obrigatória."),
        answer: z.string().min(1, "A resposta é obrigatória.")
      }))
    })
  }),
  z.object({ 
    type: z.literal('scenario_builder'), 
    title: z.string().min(1, "O título do cenário é obrigatório."),
    description: z.string().min(1, "A descrição do cenário é obrigatória."),
    variables: z.array(z.object({
      id: z.string(),
      name: z.string().min(1, "O nome da variável é obrigatório."),
      type: z.enum(['text', 'number', 'boolean', 'select']),
      options: z.array(z.string()).optional(),
      defaultValue: z.string().optional()
    })).optional(),
    outcomes: z.array(z.object({
      id: z.string(),
      condition: z.string().min(1, "A condição é obrigatória."),
      result: z.string().min(1, "O resultado é obrigatório."),
      feedback: z.string().optional()
    })).min(1, "O cenário deve ter pelo menos um resultado.")
  })
]);

// Schema para páginas de aula
export const lessonPageSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "O título da página é obrigatório."),
  type: z.enum(['text', 'video', 'audio', 'pdf', 'gallery', 'quiz', 'exercise', 'mixed'], {
    required_error: "Selecione o tipo de página."
  }),
  order: z.number().min(0, "A ordem deve ser um número positivo."),
  duration: z.number().min(1, "A duração deve ser de pelo menos 1 minuto.").optional(),
  
  // Conteúdo específico por tipo
  contentBlocks: z.array(contentBlockSchema).optional(),
  videoUrl: z.string().url("URL do vídeo inválida.").optional(),
  audioUrl: z.string().url("URL do áudio inválida.").optional(),
  pdfUrl: z.string().url("URL do PDF inválida.").optional(),
  galleryImages: z.array(z.object({
    url: z.string().url("URL da imagem inválida."),
    alt: z.string().optional(),
    caption: z.string().optional()
  })).optional(),
  questions: z.array(quizQuestionSchema).optional(),
  individualQuiz: z.object({
    id: z.string().optional(),
    title: z.string().min(3, "O título do quiz é obrigatório."),
    description: z.string().optional(),
    questions: z.array(quizQuestionSchema).min(1, "O quiz deve ter pelo menos uma questão."),
    passingScore: z.coerce.number().min(0).max(100).default(70),
    timeLimit: z.coerce.number().min(1).optional(), // em minutos
    allowRetry: z.boolean().default(true),
    maxRetries: z.coerce.number().min(1).default(3),
    shuffleQuestions: z.boolean().default(false),
    showResults: z.boolean().default(true),
    certificateRequired: z.boolean().default(false),
    weight: z.coerce.number().min(1).max(100).default(100), // peso da prova no curso
  }).optional(),
  exercise: z.object({
    question: z.string().min(1, "A pergunta do exercício é obrigatória."),
    answer: z.string().min(1, "A resposta do exercício é obrigatória."),
    hints: z.array(z.string()).optional()
  }).optional(),
  
  // Campos adicionais
  summary: z.string().optional(),
  observations: z.string().optional(),
  isCompleted: z.boolean().optional(),
  
  // Feedback
  feedback: z.object({
    thumbsUp: z.number().default(0),
    thumbsDown: z.number().default(0),
    comments: z.array(z.object({
      id: z.string(),
      userId: z.string(),
      userName: z.string(),
      comment: z.string(),
      createdAt: z.union([z.string(), z.date()])
    })).default([])
  }).optional(),
  
  // Arquivos anexados
  files: z.array(z.union([
    z.object({
      name: z.string(),
      url: z.string().url("URL do arquivo inválida.")
    }),
    z.object({
      name: z.string(),
      size: z.number(),
      type: z.string().optional()
    })
  ])).optional()
}).superRefine((data, ctx) => {
  // Validação específica por tipo de página
  switch (data.type) {
    case 'text':
    case 'mixed':
      if (!data.contentBlocks || data.contentBlocks.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Páginas de texto devem ter pelo menos um bloco de conteúdo.",
          path: ['contentBlocks']
        });
      }
      break;
      
    case 'video':
      if (!data.videoUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Páginas de vídeo devem ter uma URL válida.",
          path: ['videoUrl']
        });
      }
      break;
      
    case 'audio':
      if (!data.audioUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Páginas de áudio devem ter uma URL válida.",
          path: ['audioUrl']
        });
      }
      break;
      
    case 'pdf':
      if (!data.pdfUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Páginas de PDF devem ter uma URL válida.",
          path: ['pdfUrl']
        });
      }
      break;
      
    case 'gallery':
      if (!data.galleryImages || data.galleryImages.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Galerias devem ter pelo menos uma imagem.",
          path: ['galleryImages']
        });
      }
      break;
      
    case 'quiz':
      if (!data.questions || data.questions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quizzes devem ter pelo menos uma questão.",
          path: ['questions']
        });
      }
      break;
      
    case 'exercise':
      if (!data.exercise) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Exercícios devem ter pergunta e resposta.",
          path: ['exercise']
        });
      }
      break;
  }
});

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "O título da aula é obrigatório."),
  description: z.string().optional(),
  type: z.enum(['single', 'multi_page'], { required_error: "Selecione o tipo de aula." }),
  totalDuration: z.coerce.number().min(1, "A duração total deve ser de pelo menos 1 minuto."),
  
  // Estrutura antiga (para compatibilidade)
  content: z.string().optional(),
  contentBlocks: z.array(contentBlockSchema).optional(),
  audioFile: z.union([
    z.object({
      name: z.string(),
      size: z.number(),
      type: z.string().optional()
    }), 
    z.string()
  ]).optional(),
  materials: z.array(supportingMaterialSchema).optional(),
  questions: z.array(quizQuestionSchema).optional(),
  passingScore: z.coerce.number().min(0).max(100).optional(),
  
  // Nova estrutura para múltiplas páginas
  pages: z.array(lessonPageSchema).optional(),
  
  // Campos gerais
  summary: z.string().optional(),
  observations: z.string().optional(),
  order: z.number().optional(),
  isCompleted: z.boolean().optional(),
  
  // Feedback geral
  feedback: z.object({
    thumbsUp: z.number().default(0),
    thumbsDown: z.number().default(0),
    comments: z.array(z.object({
      id: z.string(),
      userId: z.string(),
      userName: z.string(),
      comment: z.string(),
      createdAt: z.union([z.string(), z.date()])
    })).default([])
  }).optional(),
  
  // Configurações
  settings: z.object({
    allowPageNavigation: z.boolean().default(true),
    requireSequentialProgress: z.boolean().default(false),
    showProgressBar: z.boolean().default(true),
    autoAdvance: z.boolean().default(false)
  }).optional()
}).superRefine((data, ctx) => {
  // Validação baseada no tipo de aula
  if (data.type === 'single') {
    // Para aulas únicas, requer conteúdo tradicional
    if (!data.content && (!data.contentBlocks || data.contentBlocks.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aulas únicas devem ter conteúdo ou blocos de conteúdo.",
        path: ['content']
      });
    }
  } else if (data.type === 'multi_page') {
    // Para aulas com múltiplas páginas, requer pelo menos uma página
    if (!data.pages || data.pages.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aulas com múltiplas páginas devem ter pelo menos uma página.",
        path: ['pages']
      });
    }
    
    // Validar se as páginas estão ordenadas corretamente
    if (data.pages && data.pages.length > 0) {
      const orders = data.pages.map(p => p.order).sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "As páginas devem estar ordenadas sequencialmente (0, 1, 2, ...).",
            path: ['pages']
          });
          break;
        }
      }
    }
  }
});

export const badgeSchema = z.object({
    name: z.string().min(3, "O nome da medalha é obrigatório.").optional().or(z.literal('')),
});

export const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "O título do módulo é obrigatório."),
  lessons: z.array(lessonSchema).min(1, "Cada módulo precisa de ao menos uma aula."),
  badge: badgeSchema.optional(),
});

export const courseFormSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }),
  modules: z.array(moduleSchema).optional(),
  difficulty: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  investmentCost: z.coerce.number().min(0).default(0).optional(),
  priceInCredits: z.coerce.number().min(0).default(0).optional(),
  authorInfo: z.string().optional().or(z.literal('')),
  legalNotice: z.string().optional().or(z.literal('')),
  coverImageUrl: z.union([z.string(), z.instanceof(File)]).optional().or(z.literal('')),
  
  // Novos campos da estrutura solicitada
  targetAudience: z.string().optional().or(z.literal('')),
  estimatedDuration: z.coerce.number().min(1, "A duração estimada deve ser de pelo menos 1 minuto.").optional(),
  isPublicListing: z.boolean().default(false),
  
  // Tipo de contrato
  contractType: z.enum(['own_content', 'partner_content']).optional(),
  saleValue: z.coerce.number().min(0).optional(),
  
  // Controle financeiro
  courseType: z.enum(['own_course', 'partner_course']).optional(),
  partnerName: z.string().optional().or(z.literal('')),
  paymentType: z.enum(['fixed', 'percentage', 'free', 'exchange']).optional(),
  contractStatus: z.enum(['negotiating', 'signed', 'expired']).optional(),
  contractPdfUrl: z.string().url().optional().or(z.literal('')),
  
  // SEO e tags
  seoTags: z.array(z.string()).optional(),
  
  // Configurações de avaliação
  enableComments: z.boolean().default(true),
  autoCertification: z.boolean().default(true),
  minimumPassingScore: z.coerce.number().min(0).max(100).default(70).optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

// Schema para quiz individual com configurações específicas
export const individualQuizSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "O título do quiz é obrigatório."),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1, "O quiz deve ter pelo menos uma questão."),
  passingScore: z.coerce.number().min(0).max(100).default(70),
  timeLimit: z.coerce.number().min(1).optional(), // em minutos
  allowRetry: z.boolean().default(true),
  maxRetries: z.coerce.number().min(1).default(3),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  certificateRequired: z.boolean().default(false),
  weight: z.coerce.number().min(1).max(100).default(100), // peso da prova no curso
});

export type IndividualQuizSchema = z.infer<typeof individualQuizSchema>;
