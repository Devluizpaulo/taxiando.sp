import { type Vehicle, type VehicleApplication, type Transaction } from './types';

export const mockVehicles: Omit<Vehicle, 'id' | 'fleetId' | 'createdAt'>[] = [
  { plate: 'BRA2E19', make: 'Chevrolet', model: 'Onix', year: 2022, status: 'Disponível', dailyRate: 120, imageUrl: 'https://placehold.co/600x400.png', condition: 'Novo', description: 'Carro novo, completo, com ar, direção e som bluetooth.', paymentInfo: { terms: 'Diária (Seg-Sáb)', methods: ['Cartão de Crédito', 'PIX'] }, perks: [{ id: 'full_tank', label: 'Tanque Cheio' }, { id: 'car_wash', label: 'Lava-rápido' }] },
  { plate: 'XYZ1A23', make: 'Hyundai', model: 'HB20', year: 2023, status: 'Alugado', dailyRate: 135, imageUrl: 'https://placehold.co/600x400.png', condition: 'Semi-novo', description: 'Modelo mais recente, super econômico. Ideal para o dia a dia.', paymentInfo: { terms: 'Semanal', methods: ['PIX', 'Boleto'] }, perks: [{ id: 'insurance', label: 'Seguro Passageiro' }] },
  { plate: 'FGH5I67', make: 'Fiat', model: 'Cronos', year: 2021, status: 'Em Manutenção', dailyRate: 110, imageUrl: 'https://placehold.co/600x400.png', condition: 'Usado', description: 'Porta-malas gigante, perfeito para viagens e aeroporto.', paymentInfo: { terms: 'Diária (Seg-Seg)', methods: ['Dinheiro'] }, perks: [] },
  { plate: 'JKL8M90', make: 'Renault', model: 'Kwid', year: 2023, status: 'Disponível', dailyRate: 95, imageUrl: 'https://placehold.co/600x400.png', condition: 'Novo', description: 'O mais econômico da categoria, ideal para quem roda muito.', paymentInfo: { terms: 'Semanal', methods: ['PIX'] }, perks: [{ id: 'gvn', label: 'GNV Instalado' }, {id: 'support', label: 'Suporte 24h'}] },
];


export const mockApplications: VehicleApplication[] = [
    { id: 'app_1', driverId: 'd_1', driverName: 'Carlos Pereira', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', appliedAt: new Date('2024-07-28T10:00:00Z'), status: 'Pendente' },
    { id: 'app_2', driverId: 'd_2', driverName: 'Ana Costa', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Pendente', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', appliedAt: new Date('2024-07-27T15:30:00Z'), status: 'Pendente' },
    { id: 'app_3', driverId: 'd_3', driverName: 'Ricardo Alves', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_4', vehicleName: 'Kwid (JKL8M90)', appliedAt: new Date('2024-07-26T09:00:00Z'), status: 'Aprovado' },
];


export const mockTransactions: Transaction[] = [
  { id: 't_1', date: '25/07/2024', description: 'Compra de 50 créditos', amount: '- R$ 44,90', type: 'debit' },
  { id: 't_2', date: '26/07/2024', description: 'Uso de 2 créditos - Anúncio em Destaque', amount: '- 2 créditos', type: 'credit_usage' },
  { id: 't_3', date: '28/07/2024', description: 'Uso de 1 crédito - Download de Certificado', amount: '- 1 crédito', type: 'credit_usage' },
];


export const mockJobOpportunities = [
  { id: 'job_1', title: "Motorista para Zona Sul (Turno Diurno)", company: "Frota Amarela", location: "Zona Sul", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Pontual", "Experiente"] },
  { id: 'job_2', title: "Vaga Urgente - Aeroporto de Congonhas", company: "SP AeroTaxi", location: "Zona Sul", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Inglês Básico"] },
  { id: 'job_3', title: "Motorista para Eventos Corporativos", company: "Executivo Black", location: "Centro", type: "Freelance", logo: "https://placehold.co/40x40.png", tags: ["Carro Próprio", "Traje Social"] },
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
    { id: 'opp_1', title: 'Motorista Turno da Noite', company: 'Frota Rápida SP', status: 'Aprovado' },
    { id: 'opp_2', title: 'Vaga para Aeroporto GUA', company: 'Cooperativa Alfa', status: 'Pendente' },
    { id: 'opp_3', title: 'Motorista Fim de Semana', company: 'Táxi Legal', status: 'Rejeitado' },
    { id: 'opp_4', title: 'Motorista Bilíngue (Eventos)', company: 'SP TuriTaxi', status: 'Pendente' },
];

export const mockCourses = [
    { id: 'crs_1', name: 'Legislação de Trânsito', enrolled: 152, completion: '85%' },
    { id: 'crs_2', name: 'Inglês para Atendimento', enrolled: 98, completion: '62%' },
    { id: 'crs_3', name: 'Direção Defensiva', enrolled: 210, completion: '91%' },
];
