export type TipoDica =
  | 'comer-beber'
  | 'arte-cultura'
  | 'pontos-turisticos'
  | 'vida-noturna'
  | 'descanso-bemestar'
  | 'roteiros-batevolta'
  | 'compras'
  | 'aventura-natureza'
  | 'com-criancas'
  | 'pet-friendly';

export type Publico = 'Motorista' | 'Passageiro' | 'Ambos';

export type Regiao =
  | 'zona-norte'
  | 'zona-sul'
  | 'zona-leste'
  | 'zona-oeste'
  | 'centro'
  | 'abc'
  | 'litoral-sul'
  | 'vale-paraiba'
  | 'interior'
  | 'serra-mantiqueira'
  | 'circuito-aguas'
  | 'litoral-norte'
  | 'oeste-paulista'
  | 'itu-indaiatuba-salto';

export interface Dica {
  id: string;
  titulo: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  imagemUrl: string;
  tipo: TipoDica;
  publico: Publico;
  regiao: Regiao;
  tags: string[];
  endereco: string;
  horarioFuncionamento?: string;
  preco: 'Gratuito' | 'Barato' | 'Médio' | 'Caro';
  estacionamento?: {
    disponivel: boolean;
    tipo: 'Gratuito' | 'Pago' | 'Valet';
    descricao?: string;
  };
  banheiros?: {
    disponivel: boolean;
    limpo: boolean;
    descricao?: string;
  };
  coordenadas?: {
    lat: number;
    lng: number;
  };
  wazeUrl?: string;
  googleMapsUrl?: string;
  telefone?: string;
  website?: string;
  redesSociais?: {
    instagram?: string;
    facebook?: string;
  };
  dicasMotorista: string[];
  dicasPassageiro: string[];
  avaliacao?: number;
  popularidade: number;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  destaque?: boolean; // Se a dica é destaque/recomendada
}

export interface FiltrosDicas {
  regioes: Regiao[];
  tipos: TipoDica[];
  publicos: Publico[];
  preco?: 'Gratuito' | 'Barato' | 'Médio' | 'Caro';
  estacionamento?: boolean;
  banheiros?: boolean;
  busca: string;
}

export interface CategoriaFiltro {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  descricao: string;
}

export interface RegiaoFiltro {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  descricao: string;
} 