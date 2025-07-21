
import { type Vehicle, type VehicleApplication, type Course, type ServiceListing, type Testimonial } from './types';

export const mockVehicles: (Omit<Vehicle, 'fleetId' | 'createdAt'>)[] = [
  { id: 'v_mock_1', plate: 'BRA2E19', make: 'Chevrolet', model: 'Onix', year: 2022, status: 'Disponível', dailyRate: 120, imageUrls: ['https://placehold.co/600x400.png'], condition: 'Novo', description: 'Carro novo, completo, com ar, direção e som bluetooth.', paymentInfo: { terms: 'Diária (Seg-Sáb)', methods: ['Cartão de Crédito', 'PIX'] }, perks: [{ id: 'full_tank', label: 'Tanque Cheio' }, { id: 'car_wash', label: 'Lava-rápido' }], type: 'hatch', transmission: 'manual', fuelType: 'flex' },
  { id: 'v_mock_2', plate: 'XYZ1A23', make: 'Hyundai', model: 'HB20', year: 2023, status: 'Disponível', dailyRate: 135, imageUrls: ['https://placehold.co/600x400.png'], condition: 'Semi-novo', description: 'Modelo mais recente, super econômico. Ideal para o dia a dia.', paymentInfo: { terms: 'Semanal', methods: ['PIX', 'Boleto'] }, perks: [{ id: 'insurance', label: 'Seguro Passageiro' }], type: 'hatch', transmission: 'manual', fuelType: 'flex' },
  { id: 'v_mock_3', plate: 'FGH5I67', make: 'Fiat', model: 'Cronos', year: 2021, status: 'Disponível', dailyRate: 110, imageUrls: ['https://placehold.co/600x400.png'], condition: 'Usado', description: 'Porta-malas gigante, perfeito para viagens e aeroporto.', paymentInfo: { terms: 'Diária (Seg-Seg)', methods: ['Dinheiro'] }, perks: [], type: 'sedan', transmission: 'manual', fuelType: 'flex' },
  { id: 'v_mock_4', plate: 'JKL8M90', make: 'Renault', model: 'Kwid', year: 2023, status: 'Disponível', dailyRate: 95, imageUrls: ['https://placehold.co/600x400.png'], condition: 'Novo', description: 'O mais econômico da categoria, ideal para quem roda muito.', paymentInfo: { terms: 'Semanal', methods: ['PIX'] }, perks: [{ id: 'gvn', label: 'Kit GNV' }, {id: 'support', label: 'Suporte 24h'}], type: 'hatch', transmission: 'manual', fuelType: 'flex' },
];


export const mockApplications: VehicleApplication[] = [
    { id: 'app_1', driverId: 'd_1', fleetId: 'mockFleet', driverName: 'Carlos Pereira', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', company: 'Frota Rápida SP', appliedAt: new Date('2024-07-28T10:00:00Z').toISOString(), status: 'Pendente' },
    { id: 'app_2', driverId: 'd_2', fleetId: 'mockFleet', driverName: 'Ana Costa', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Pendente', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', company: 'Frota Rápida SP', appliedAt: new Date('2024-07-27T15:30:00Z').toISOString(), status: 'Pendente' },
    { id: 'app_3', driverId: 'd_3', fleetId: 'mockFleet', driverName: 'Ricardo Alves', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_4', vehicleName: 'Kwid (JKL8M90)', company: 'Porta Branca', appliedAt: new Date('2024-07-26T09:00:00Z').toISOString(), status: 'Aprovado' },
];

type HomePageServiceListing = Pick<ServiceListing, 'id' | 'title' | 'provider' | 'category' | 'price' | 'status' | 'imageUrls'> & { imageHint: string };

export const mockServiceListings: HomePageServiceListing[] = [
    { id: 'serv_mock_1', title: 'Despachante Veicular Completo', provider: 'Despachante Legal', category: 'Despachante', price: 'R$ 550,00', status: 'Ativo', imageUrls: ['https://placehold.co/600x400.png'], imageHint: 'documents stamps' },
    { id: 'serv_mock_2', title: 'Curso de Reciclagem para Taxistas', provider: 'Autoescola Futuro', category: 'Autoescola', price: 'R$ 300,00', status: 'Ativo', imageUrls: ['https://placehold.co/600x400.png'], imageHint: 'classroom students' },
    { id: 'serv_mock_3', title: 'Instalação de GNV 5ª Geração', provider: 'GNV Master', category: 'Instaladora GNV', price: 'Sob Consulta', status: 'Ativo', imageUrls: ['https://placehold.co/600x400.png'], imageHint: 'car engine' },
    { id: 'serv_mock_4', title: 'Troca de Óleo e Filtro', provider: 'Oficina do Zé', status: 'Pausado', category: 'Oficina Mecânica', price: 'R$ 180,00', imageUrls: ['https://placehold.co/600x400.png'], imageHint: 'car oil change' },
];

export const mockUsers = [
    { id: 'usr_1', name: 'João da Silva', email: 'joao.silva@example.com', role: 'Motorista', profileStatus: 'Aprovado' },
    { id: 'usr_2', name: 'Frota Rápida SP', email: 'contato@frotarapida.com', role: 'Frota', profileStatus: 'N/A' },
    { id: 'usr_3', name: 'Maria Oliveira', email: 'maria.o@example.com', role: 'Motorista', profileStatus: 'Pendente' },
    { id: 'usr_4', name: 'Carlos Souza', email: 'carlos.souza@example.com', role: 'Motorista', profileStatus: 'Rejeitado' },
    { id: 'usr_5', name: 'Ana Pereira', email: 'ana.p@example.com', role: 'Motorista', profileStatus: 'Aprovado' },
    { id: 'usr_6', name: 'Pedro Martins', email: 'pedro.m@example.com', role: 'Motorista', profileStatus: 'Pendente' },
];

export const mockOpportunities = [
    { id: 'opp_1', vehicle: 'Chevrolet Onix 2023', provider: 'Frota Rápida SP', type: 'Frota', status: 'Pendente' },
    { id: 'opp_2', vehicle: 'Fiat Cronos 2022', provider: 'Sérgio L. (Porta Branca)', type: 'Porta Branca', status: 'Aprovado' },
    { id: 'opp_3', vehicle: 'VW Virtus 2021', provider: 'Frota Central', type: 'Frota', status: 'Rejeitado' },
];

export const mockTestimonials: Testimonial[] = [
    {
        id: 'test_1',
        name: 'Carlos Alberto',
        role: 'Motorista',
        quote: 'Desde que comecei a usar a plataforma, consegui um carro muito melhor e minhas corridas aumentaram. Os cursos também fizeram toda a diferença no meu atendimento.',
        imageUrls: ['https://placehold.co/100x100.png']
    },
    {
        id: 'test_2',
        name: 'Mariana Costa',
        role: 'Dona de Frota',
        quote: 'A Táxiando SP simplificou a gestão dos meus veículos. Encontro motoristas qualificados e com o perfil certo para minha frota em tempo recorde. Recomendo!',
        imageUrls: ['https://placehold.co/100x100.png']
    },
    {
        id: 'test_3',
        name: 'Sérgio Lima',
        role: 'Prestador de Serviço',
        quote: 'Minha oficina ganhou muita visibilidade com o marketplace. O número de clientes taxistas aumentou e o retorno foi imediato. É uma parceria de sucesso.',
        imageUrls: ['https://placehold.co/100x100.png']
    }
];

export const mockCourse: Course = {
  id: 'mock_course_1',
  title: 'Exemplo: Legislação para Taxistas',
  description: 'Um curso de exemplo demonstrando as funcionalidades da plataforma, como aulas em texto, vídeo e provas (quiz).',
  category: 'Legislação',
  status: 'Draft',
  totalLessons: 3,
  totalDuration: 40,
  createdAt: new Date().toISOString(),
  modules: [
    {
      id: 'mock_module_1',
      title: 'Módulo 1: Introdução à Legislação',
      badge: {
        name: 'Iniciado em Leis',
        iconUrl: '',
      },
      lessons: [
        {
          id: 'mock_lesson_1',
          title: 'Aula em Vídeo: Entendendo o CTB',
          type: 'video',
          duration: 15,
          content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // A classic placeholder
          materials: [
            { name: 'Resumo do CTB.pdf', url: '#' }
          ]
        },
        {
          id: 'mock_lesson_2',
          title: 'Aula em Texto: Principais Infrações',
          type: 'text',
          duration: 10,
          content: `
## As 5 Infrações Mais Comuns e Como Evitá-las

Manter-se atualizado com o Código de Trânsito Brasileiro (CTB) é fundamental. Abaixo, listamos algumas das infrações mais comuns que podem ser facilmente evitadas com um pouco de atenção.

### 1. Excesso de Velocidade
É a infração mais comum no Brasil. Fique sempre atento aos limites de velocidade da via, indicados por placas. Use apps de GPS com alertas de velocidade.

### 2. Estacionar em Local Proibido
Parar em locais não permitidos, como em frente a garagens, em esquinas ou em vagas para idosos/deficientes sem a credencial, gera multas e pontos na carteira.

### 3. Uso do Celular ao Volante
Utilizar o celular, mesmo que seja para verificar o GPS, é uma infração gravíssima se o aparelho não estiver fixado em um suporte.

**Dica:** Configure seu trajeto antes de iniciar a corrida.

### 4. Avançar o Sinal Vermelho
Além de perigosa, é uma infração gravíssima. A atenção deve ser redobrada, principalmente durante a noite.

### 5. Não Usar o Cinto de Segurança
Regra básica de segurança para o motorista e todos os passageiros. É uma infração grave e a responsabilidade é do condutor.

Lembre-se: dirigir com segurança não só evita multas, mas também protege a sua vida e a de seus passageiros.
          `
        },
        {
          id: 'mock_lesson_3',
          title: 'Prova: Teste seus Conhecimentos',
          type: 'quiz',
          duration: 15,
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              question: 'Qual a penalidade por usar o celular enquanto dirige, sem o uso de suporte?',
              options: [
                { id: 'q1o1', text: 'Leve', isCorrect: false },
                { id: 'q1o2', text: 'Média', isCorrect: false },
                { id: 'q1o3', text: 'Grave', isCorrect: false },
                { id: 'q1o4', text: 'Gravíssima', isCorrect: true },
              ]
            },
            {
              id: 'q2',
              question: 'Onde o certificado do curso de formação para taxistas deve ser obtido?',
              options: [
                { id: 'q2o1', text: 'Diretamente na prefeitura', isCorrect: false },
                { id: 'q2o2', text: 'Em um Centro de Formação de Condutores (CFC) credenciado', isCorrect: true },
                { id: 'q2o3', text: 'Online, em qualquer site de cursos', isCorrect: false },
              ]
            }
          ]
        }
      ]
    }
  ]
};
