import { type Vehicle, type VehicleApplication, type Transaction, type Course } from './types';

export const mockVehicles: Omit<Vehicle, 'id' | 'fleetId' | 'createdAt'>[] = [
  { plate: 'BRA2E19', make: 'Chevrolet', model: 'Onix', year: 2022, status: 'Disponível', dailyRate: 120, imageUrl: 'https://placehold.co/600x400.png', condition: 'Novo', description: 'Carro novo, completo, com ar, direção e som bluetooth.', paymentInfo: { terms: 'Diária (Seg-Sáb)', methods: ['Cartão de Crédito', 'PIX'] }, perks: [{ id: 'full_tank', label: 'Tanque Cheio' }, { id: 'car_wash', label: 'Lava-rápido' }] },
  { plate: 'XYZ1A23', make: 'Hyundai', model: 'HB20', year: 2023, status: 'Disponível', dailyRate: 135, imageUrl: 'https://placehold.co/600x400.png', condition: 'Semi-novo', description: 'Modelo mais recente, super econômico. Ideal para o dia a dia.', paymentInfo: { terms: 'Semanal', methods: ['PIX', 'Boleto'] }, perks: [{ id: 'insurance', label: 'Seguro Passageiro' }] },
  { plate: 'FGH5I67', make: 'Fiat', model: 'Cronos', year: 2021, status: 'Disponível', dailyRate: 110, imageUrl: 'https://placehold.co/600x400.png', condition: 'Usado', description: 'Porta-malas gigante, perfeito para viagens e aeroporto.', paymentInfo: { terms: 'Diária (Seg-Seg)', methods: ['Dinheiro'] }, perks: [] },
  { plate: 'JKL8M90', make: 'Renault', model: 'Kwid', year: 2023, status: 'Disponível', dailyRate: 95, imageUrl: 'https://placehold.co/600x400.png', condition: 'Novo', description: 'O mais econômico da categoria, ideal para quem roda muito.', paymentInfo: { terms: 'Semanal', methods: ['PIX'] }, perks: [{ id: 'gvn', label: 'Kit GNV' }, {id: 'support', label: 'Suporte 24h'}] },
];


export const mockApplications: VehicleApplication[] = [
    { id: 'app_1', driverId: 'd_1', driverName: 'Carlos Pereira', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', company: 'Frota Rápida SP', appliedAt: new Date('2024-07-28T10:00:00Z'), status: 'Pendente' },
    { id: 'app_2', driverId: 'd_2', driverName: 'Ana Costa', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Pendente', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', company: 'Frota Rápida SP', appliedAt: new Date('2024-07-27T15:30:00Z'), status: 'Pendente' },
    { id: 'app_3', driverId: 'd_3', driverName: 'Ricardo Alves', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_4', vehicleName: 'Kwid (JKL8M90)', company: 'Porta Branca', appliedAt: new Date('2024-07-26T09:00:00Z'), status: 'Aprovado' },
];


export const mockTransactions: Transaction[] = [
  { id: 't_1', date: '25/07/2024', description: 'Compra de 50 créditos', amount: '- R$ 44,90', type: 'debit' },
  { id: 't_2', date: '26/07/2024', description: 'Uso de 2 créditos - Anúncio em Destaque', amount: '- 2 créditos', type: 'credit_usage' },
  { id: 't_3', date: '28/07/2024', description: 'Uso de 1 crédito - Download de Certificado', amount: '- 1 crédito', type: 'credit_usage' },
];

export const mockServiceListings = [
    { id: 'srv_1', title: 'Despachante Veicular Completo', provider: 'Despachante Legal', category: 'Despachante', price: 'R$ 550,00', status: 'Ativo', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'documents stamp' },
    { id: 'srv_2', title: 'Curso de Reciclagem para Taxistas', provider: 'Autoescola Futuro', category: 'Autoescola', price: 'R$ 300,00', status: 'Ativo', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'classroom training' },
    { id: 'srv_3', title: 'Instalação de GNV 5ª Geração', provider: 'GNV Master', category: 'Instaladora GNV', price: 'Sob Consulta', status: 'Ativo', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'car engine' },
    { id: 'srv_4', title: 'Troca de Óleo e Filtro', provider: 'Oficina do Zé', status: 'Pausado', category: 'Oficina Mecânica', price: 'R$ 180,00', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'car engine' },
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

export const mockCourses: Omit<Course, 'id'| 'description'| 'category'|'modules'|'totalLessons'|'totalDuration'| 'createdAt' | 'completion'>[] = [
    { title: 'Legislação de Trânsito', students: 152, status: 'Published' },
    { title: 'Inglês para Atendimento', students: 98, status: 'Published' },
    { title: 'Direção Defensiva', students: 210, status: 'Published' },
];
