# 📚 Exemplo de Aulas com Múltiplas Páginas

## 🎯 Visão Geral

A nova estrutura de aulas permite criar **aulas complexas** divididas em múltiplas páginas/trechos, cada uma com diferentes tipos de mídia e conteúdo. Isso oferece flexibilidade total para criar experiências de aprendizado ricas e interativas.

## 🏗️ Estrutura da Aula

```typescript
interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'single' | 'multi_page'; // Tipo da aula
  totalDuration: number;
  
  // Nova estrutura para múltiplas páginas
  pages?: LessonPage[]; // Array de páginas/trechos
  
  // Configurações da aula
  settings?: {
    allowPageNavigation?: boolean; // Navegação livre entre páginas
    requireSequentialProgress?: boolean; // Progresso sequencial obrigatório
    showProgressBar?: boolean; // Mostrar barra de progresso
    autoAdvance?: boolean; // Avançar automaticamente
  };
}
```

## 📄 Tipos de Páginas Disponíveis

### 1. 📝 **Página de Texto**
```typescript
{
  type: 'text',
  title: 'Introdução ao Conteúdo',
  contentBlocks: [
    { type: 'heading', level: 1, text: 'Bem-vindo ao Curso' },
    { type: 'paragraph', text: 'Neste módulo você aprenderá...' },
    { type: 'observation', text: 'Dica importante: Mantenha foco!', icon: '💡' }
  ]
}
```

### 2. 🎥 **Página de Vídeo**
```typescript
{
  type: 'video',
  title: 'Demonstração Prática',
  videoUrl: 'https://youtube.com/watch?v=...',
  observations: 'Preste atenção nos detalhes da demonstração'
}
```

### 3. 🎵 **Página de Áudio**
```typescript
{
  type: 'audio',
  title: 'Podcast Explicativo',
  audioUrl: 'https://exemplo.com/audio.mp3',
  duration: 15
}
```

### 4. 📄 **Página de PDF**
```typescript
{
  type: 'pdf',
  title: 'Material de Apoio',
  pdfUrl: 'https://exemplo.com/material.pdf'
}
```

### 5. 🖼️ **Página de Galeria**
```typescript
{
  type: 'gallery',
  title: 'Exemplos Visuais',
  galleryImages: [
    { url: 'https://exemplo.com/img1.jpg', alt: 'Exemplo 1', caption: 'Primeiro exemplo' },
    { url: 'https://exemplo.com/img2.jpg', alt: 'Exemplo 2', caption: 'Segundo exemplo' }
  ]
}
```

### 6. ❓ **Página de Quiz**
```typescript
{
  type: 'quiz',
  title: 'Teste de Conhecimento',
  questions: [
    {
      id: '1',
      question: 'Qual é a resposta correta?',
      options: [
        { id: 'a', text: 'Opção A', isCorrect: false },
        { id: 'b', text: 'Opção B', isCorrect: true }
      ]
    }
  ]
}
```

### 7. 💡 **Página de Exercício**
```typescript
{
  type: 'exercise',
  title: 'Exercício Prático',
  exercise: {
    question: 'Como você aplicaria este conceito na prática?',
    answer: 'A resposta correta seria...',
    hints: ['Dica 1', 'Dica 2']
  }
}
```

### 8. 🔀 **Página Mista**
```typescript
{
  type: 'mixed',
  title: 'Conteúdo Multimídia',
  contentBlocks: [
    { type: 'heading', level: 2, text: 'Título da Seção' },
    { type: 'paragraph', text: 'Texto explicativo...' },
    { type: 'image', url: 'https://exemplo.com/img.jpg', alt: 'Imagem explicativa' },
    { type: 'observation', text: 'Observação importante', icon: '⚠️' }
  ]
}
```

## 🎮 Exemplo Completo de Aula

```typescript
const aulaExemplo: Lesson = {
  id: 'aula_001',
  title: 'Como Ser um Taxista de Sucesso',
  description: 'Aprenda as técnicas essenciais para se destacar como taxista',
  type: 'multi_page',
  totalDuration: 45,
  
  settings: {
    allowPageNavigation: true,
    requireSequentialProgress: false,
    showProgressBar: true,
    autoAdvance: false
  },
  
  pages: [
    {
      id: 'page_1',
      title: 'Introdução e Boas-vindas',
      type: 'text',
      order: 0,
      duration: 5,
      contentBlocks: [
        { type: 'heading', level: 1, text: 'Bem-vindo ao Curso!' },
        { type: 'paragraph', text: 'Neste curso você aprenderá técnicas essenciais para se tornar um taxista de sucesso.' },
        { type: 'observation', text: 'Este curso foi desenvolvido com base em experiências reais de taxistas bem-sucedidos.', icon: '🎯' }
      ]
    },
    
    {
      id: 'page_2',
      title: 'Vídeo: Histórias de Sucesso',
      type: 'video',
      order: 1,
      duration: 10,
      videoUrl: 'https://youtube.com/watch?v=exemplo',
      observations: 'Observe como esses taxistas aplicam as técnicas que você aprenderá'
    },
    
    {
      id: 'page_3',
      title: 'Técnicas de Atendimento',
      type: 'mixed',
      order: 2,
      duration: 15,
      contentBlocks: [
        { type: 'heading', level: 2, text: 'Técnicas Essenciais' },
        { type: 'paragraph', text: 'O atendimento ao cliente é fundamental para o sucesso.' },
        { type: 'list', style: 'bullet', items: [
          'Sempre cumprimente o passageiro',
          'Mantenha o carro limpo e organizado',
          'Conheça bem a cidade',
          'Seja pontual e confiável'
        ]},
        { type: 'image', url: 'https://exemplo.com/taxi-limpo.jpg', alt: 'Taxi limpo e organizado' }
      ]
    },
    
    {
      id: 'page_4',
      title: 'Material de Apoio',
      type: 'pdf',
      order: 3,
      duration: 5,
      pdfUrl: 'https://exemplo.com/guia-taxista.pdf'
    },
    
    {
      id: 'page_5',
      title: 'Galeria de Exemplos',
      type: 'gallery',
      order: 4,
      duration: 5,
      galleryImages: [
        { url: 'https://exemplo.com/exemplo1.jpg', alt: 'Exemplo 1', caption: 'Taxista atendendo cliente' },
        { url: 'https://exemplo.com/exemplo2.jpg', alt: 'Exemplo 2', caption: 'Carro bem organizado' },
        { url: 'https://exemplo.com/exemplo3.jpg', alt: 'Exemplo 3', caption: 'Mapa da cidade' }
      ]
    },
    
    {
      id: 'page_6',
      title: 'Teste de Conhecimento',
      type: 'quiz',
      order: 5,
      duration: 5,
      questions: [
        {
          id: '1',
          question: 'Qual é a primeira coisa que você deve fazer ao receber um passageiro?',
          options: [
            { id: 'a', text: 'Pedir o destino', isCorrect: false },
            { id: 'b', text: 'Cumprimentar educadamente', isCorrect: true },
            { id: 'c', text: 'Ligar o taxímetro', isCorrect: false }
          ]
        }
      ]
    }
  ]
};
```

## 🛠️ Como Usar no Código

### 1. **Criando uma Aula com Múltiplas Páginas**

```typescript
import { LessonPagesEditor } from '@/components/course/LessonPagesEditor';

function CreateLessonForm() {
  const [pages, setPages] = useState<LessonPage[]>([]);
  
  return (
    <div>
      <h2>Criar Nova Aula</h2>
      
      {/* Seletor de tipo de aula */}
      <Select onValueChange={(value) => setLessonType(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de aula" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Aula Única</SelectItem>
          <SelectItem value="multi_page">Múltiplas Páginas</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Editor de páginas (apenas para multi_page) */}
      {lessonType === 'multi_page' && (
        <LessonPagesEditor
          pages={pages}
          onChange={setPages}
        />
      )}
    </div>
  );
}
```

### 2. **Visualizando uma Aula com Múltiplas Páginas**

```typescript
import { MultiPageLessonViewer } from '@/components/course/MultiPageLessonViewer';

function LessonViewer({ lesson }: { lesson: Lesson }) {
  const handlePageComplete = (pageIndex: number) => {
    console.log(`Página ${pageIndex} concluída`);
  };
  
  const handleLessonComplete = () => {
    console.log('Aula concluída!');
  };
  
  const handleFeedback = (pageIndex: number, type: 'thumbsUp' | 'thumbsDown' | 'comment', value?: string) => {
    console.log(`Feedback na página ${pageIndex}:`, type, value);
  };
  
  return (
    <MultiPageLessonViewer
      lesson={lesson}
      onPageComplete={handlePageComplete}
      onLessonComplete={handleLessonComplete}
      onFeedback={handleFeedback}
    />
  );
}
```

## 🎨 Interface do Usuário

### **Editor de Páginas**
- ✅ **Interface moderna** com cards para cada página
- ✅ **Drag & Drop** para reordenar páginas
- ✅ **Preview em tempo real** do conteúdo
- ✅ **Validação robusta** por tipo de página
- ✅ **Ícones específicos** para cada tipo de mídia

### **Visualizador de Aulas**
- ✅ **Navegação intuitiva** entre páginas
- ✅ **Barra de progresso** visual
- ✅ **Controles de mídia** avançados
- ✅ **Sistema de feedback** por página
- ✅ **Marcação de conclusão** individual

## 🔧 Configurações Avançadas

### **Controle de Navegação**
```typescript
settings: {
  allowPageNavigation: true,     // Permite navegar livremente
  requireSequentialProgress: false, // Não requer progresso sequencial
  showProgressBar: true,         // Mostra barra de progresso
  autoAdvance: false            // Não avança automaticamente
}
```

### **Tracking de Progresso**
- ✅ **Progresso por página** individual
- ✅ **Progresso geral** da aula
- ✅ **Marcação de conclusão** com timestamp
- ✅ **Estatísticas** de tempo gasto

## 🚀 Benefícios da Nova Estrutura

1. **📚 Flexibilidade Total**: Misture diferentes tipos de mídia em uma aula
2. **🎯 Foco no Conteúdo**: Cada página tem um propósito específico
3. **📱 Experiência Responsiva**: Interface adaptada para mobile e desktop
4. **📊 Analytics Detalhados**: Métricas por página e por aula
5. **🔄 Reutilização**: Páginas podem ser reutilizadas em outras aulas
6. **⚡ Performance**: Carregamento otimizado por página
7. **🎨 Interface Moderna**: Design consistente e intuitivo

## 🔮 Próximos Passos

- [ ] **Drag & Drop** para reordenar páginas
- [ ] **Templates** de páginas pré-definidos
- [ ] **Importação/Exportação** de páginas
- [ ] **Colaboração** em tempo real
- [ ] **Versionamento** de páginas
- [ ] **A/B Testing** de diferentes estruturas

---

Esta nova estrutura transforma completamente a experiência de criação e consumo de aulas, oferecendo uma plataforma moderna e flexível para educação digital! 🎓✨ 