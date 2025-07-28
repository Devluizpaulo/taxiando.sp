'use client';

import { useState } from 'react';
import { type CityTip } from '@/lib/types';
import { TipFormDialog } from './tip-form';
import { CityTipCard } from '@/components/city-tip-card';
import { AIDemoSection } from './ai-demo-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Utensils, 
  Mountain, 
  Bed, 
  Camera, 
  Lightbulb,
  MapPin,
  Users,
  Star,
  Calendar,
  TrendingUp,
  BookOpen,
  Brain,
  Palette,
  Moon,
  Car,
  ShoppingBag,
  TreePine,
  Dog
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateTip, deleteTip, publishTip, unpublishTip } from '@/app/actions/city-guide-actions';

interface CityGuideCategoriesPageProps {
  initialTips: CityTip[];
}

const tipTypeConfig = {
  gastronomia: {
    icon: Utensils,
    label: 'Comer & Beber',
    description: 'Restaurantes, cafés, bares, padarias, lanchonetes',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    emoji: '🍽️'
  },
  'day-off': {
    icon: Mountain,
    label: 'Descanso & Bem-estar',
    description: 'Parques, spas, cafés calmos, locais para relaxar',
    color: 'bg-green-50 border-green-200 text-green-800',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    emoji: '🧘‍♂️'
  },
  pousada: {
    icon: Bed,
    label: 'Hospedagem',
    description: 'Hotéis, pousadas, hostels, resorts com parcerias',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    emoji: '🛏️'
  },
  turismo: {
    icon: Camera,
    label: 'Pontos Turísticos',
    description: 'Monumentos, atrações, pontos turísticos, mirantes',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    emoji: '📷'
  },
  cultura: {
    icon: Palette,
    label: 'Arte & Cultura',
    description: 'Museus, galerias, teatros, exposições, eventos culturais',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    emoji: '🎨'
  },
  nightlife: {
    icon: Moon,
    label: 'Vida Noturna',
    description: 'Bares, baladas, casas noturnas, eventos noturnos',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    emoji: '🌃'
  },
  roteiros: {
    icon: Car,
    label: 'Roteiros & Bate-volta',
    description: 'Passeios, roteiros turísticos, viagens de um dia',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    emoji: '🚘'
  },
  compras: {
    icon: ShoppingBag,
    label: 'Compras',
    description: 'Shoppings, feirinhas, outlets, lojas especiais',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    emoji: '🛍️'
  },
  aventura: {
    icon: TreePine,
    label: 'Aventura & Natureza',
    description: 'Trilhas, cachoeiras, parques naturais, ecoturismo',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    emoji: '🌳'
  },
  familia: {
    icon: Users,
    label: 'Com Crianças',
    description: 'Atrações family-friendly, parques infantis, atividades para família',
    color: 'bg-rose-50 border-rose-200 text-rose-800',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    emoji: '👨‍👩‍👧‍👦'
  },
  pet: {
    icon: Dog,
    label: 'Pet Friendly',
    description: 'Locais que aceitam pets, parques para cães, hotéis pet friendly',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    emoji: '🐶'
  },
  outro: {
    icon: Lightbulb,
    label: 'Outro',
    description: 'Outras categorias e locais especiais',
    color: 'bg-gray-50 border-gray-200 text-gray-800',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
    emoji: '✨'
  }
};

const regionOptions = [
  { value: 'zona-norte', label: 'Zona Norte' },
  { value: 'zona-sul', label: 'Zona Sul' },
  { value: 'zona-leste', label: 'Zona Leste' },
  { value: 'zona-oeste', label: 'Zona Oeste' },
  { value: 'centro', label: 'Centro' },
  { value: 'abc', label: 'ABC' },
  { value: 'litoral-sul', label: 'Litoral Sul' },
  { value: 'vale-paraiba', label: 'Vale do Paraíba' },
  { value: 'interior', label: 'Interior' },
  { value: 'serra-mantiqueira', label: 'Serra da Mantiqueira' },
  { value: 'circuito-aguas', label: 'Circuito das Águas' },
  { value: 'litoral-norte', label: 'Litoral Norte' },
  { value: 'oeste-paulista', label: 'Oeste Paulista' },
  { value: 'itu-indaiatuba-salto', label: 'Itu/Indaiatuba/Salto' },
];

const targetOptions = [
  { value: 'driver', label: 'Motoristas', icon: '🚖', desc: 'Locais para relaxar, comer bem ou curtir o day off' },
  { value: 'client', label: 'Passageiros', icon: '🧳', desc: 'Roteiros e dicas para quem visita ou mora na cidade' },
  { value: 'both', label: 'Ambos', icon: '🤝', desc: 'Locais úteis ou interessantes para os dois públicos' },
];

export function CityGuideCategoriesPage({ initialTips }: CityGuideCategoriesPageProps) {
  const { toast } = useToast();
  const [tips, setTips] = useState<CityTip[]>(initialTips);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<CityTip | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showAIDemo, setShowAIDemo] = useState(false);

  // Filtrar dicas
  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || tip.tipType === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || !selectedRegion || tip.region === selectedRegion;
    const matchesTarget = selectedTarget === 'all' || !selectedTarget || tip.target === selectedTarget;
    const matchesStatus = activeTab === 'all' || 
                         (activeTab === 'published' && tip.status === 'published') ||
                         (activeTab === 'drafts' && tip.status === 'draft');

    return matchesSearch && matchesCategory && matchesRegion && matchesTarget && matchesStatus;
  });

  // Agrupar dicas por categoria
  const tipsByCategory = filteredTips.reduce((acc, tip) => {
    if (!acc[tip.tipType]) {
      acc[tip.tipType] = [];
    }
    acc[tip.tipType].push(tip);
    return acc;
  }, {} as Record<string, CityTip[]>);

  // Estatísticas por categoria
  const categoryStats = Object.entries(tipTypeConfig).map(([key, config]) => {
    const categoryTips = tips.filter(tip => tip.tipType === key);
    const publishedTips = categoryTips.filter(tip => tip.status === 'published');
    const draftTips = categoryTips.filter(tip => tip.status === 'draft');
    
    return {
      key,
      config,
      total: categoryTips.length,
      published: publishedTips.length,
      drafts: draftTips.length,
      averageRating: categoryTips.length > 0 
        ? categoryTips.reduce((sum, tip) => sum + (tip.averageRating || 0), 0) / categoryTips.length 
        : 0
    };
  });

  const handleCreateTip = (category: string) => {
    setSelectedCategory(category);
    setEditingTip(null);
    setIsFormOpen(true);
  };

  const handleEditTip = (tip: CityTip) => {
    setEditingTip(tip);
    setSelectedCategory(tip.tipType);
    setIsFormOpen(true);
  };

  const handleDeleteTip = async (tip: CityTip) => {
    if (confirm('Tem certeza que deseja excluir esta dica?')) {
      const result = await deleteTip(tip.id);
      if (result.success) {
        setTips(tips.filter(t => t.id !== tip.id));
        toast({ title: 'Dica excluída!', description: 'A dica foi removida com sucesso.' });
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.error });
      }
    }
  };

  const handlePublishTip = async (tip: CityTip) => {
    const result = await publishTip(tip.id);
    if (result.success) {
      setTips(tips.map(t => t.id === tip.id ? { ...t, status: 'published' } : t));
      toast({ title: 'Dica publicada!', description: 'A dica está agora visível publicamente.' });
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    }
  };

  const handleUnpublishTip = async (tip: CityTip) => {
    const result = await unpublishTip(tip.id);
    if (result.success) {
      setTips(tips.map(t => t.id === tip.id ? { ...t, status: 'draft' } : t));
      toast({ title: 'Dica despublicada!', description: 'A dica voltou para rascunho.' });
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    }
  };

  const handleFormSubmit = async (tipData: any) => {
    const result = await createOrUpdateTip(tipData);
    if (result.success && result.tip) {
      if (editingTip) {
        setTips(tips.map(t => t.id === editingTip.id ? result.tip! : t));
        toast({ title: 'Dica atualizada!', description: 'As alterações foram salvas com sucesso.' });
      } else {
        setTips([result.tip, ...tips]);
        toast({ title: 'Dica criada!', description: 'A nova dica foi adicionada com sucesso.' });
      }
      setIsFormOpen(false);
      setEditingTip(null);
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    }
  };

  const handleAITipGenerated = (tipData: any) => {
    // Preencher o formulário com os dados gerados pela IA
    setSelectedCategory(tipData.tipType);
    setEditingTip(null);
    setIsFormOpen(true);
    // Os dados serão preenchidos automaticamente no formulário
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guia da Cidade</h1>
          <p className="text-gray-600 mt-1">Gerencie dicas organizadas por categoria</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAIDemo(!showAIDemo)} 
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
          >
            <Brain className="h-4 w-4 mr-2" />
            {showAIDemo ? 'Ocultar IA Real' : 'Usar IA Real'}
          </Button>
          <Button onClick={() => handleCreateTip('')} className="bg-gradient-to-r from-blue-500 to-purple-500">
            <Plus className="h-4 w-4 mr-2" />
            Nova Dica
          </Button>
        </div>
      </div>

      {/* Seção de IA */}
      {showAIDemo && (
        <AIDemoSection onTipGenerated={handleAITipGenerated} />
      )}

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Dicas</p>
                <p className="text-2xl font-bold text-gray-900">{tips.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {tips.filter(t => t.status === 'published').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tips.filter(t => t.status === 'draft').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tips.length > 0 
                    ? (tips.reduce((sum, tip) => sum + (tip.averageRating || 0), 0) / tips.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Título, descrição, localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(tipTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Região</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas as regiões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as regiões</SelectItem>
                  {regionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Público</label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os públicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os públicos</SelectItem>
                  {targetOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas ({filteredTips.length})</TabsTrigger>
          <TabsTrigger value="published">
            Publicadas ({filteredTips.filter(t => t.status === 'published').length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Rascunhos ({filteredTips.filter(t => t.status === 'draft').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Categorias */}
      <div className="space-y-8">
        {categoryStats.map(({ key, config, total, published, drafts, averageRating }) => {
          const categoryTips = tipsByCategory[key] || [];
          
          return (
            <Card key={key} className={config.color}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{config.emoji}</div>
                    <div>
                      <CardTitle className="text-xl">{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold">{total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Publicadas</p>
                      <p className="text-xl font-bold text-green-600">{published}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Rascunhos</p>
                      <p className="text-xl font-bold text-yellow-600">{drafts}</p>
                    </div>
                    {averageRating > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Avaliação</p>
                        <p className="text-xl font-bold text-purple-600">{averageRating.toFixed(1)}</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => handleCreateTip(key)}
                      variant="outline"
                      className="bg-white hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {categoryTips.length > 0 && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTips.map(tip => (
                      <CityTipCard
                        key={tip.id}
                        tip={tip}
                        showActions={true}
                        onEdit={() => handleEditTip(tip)}
                        onDelete={() => handleDeleteTip(tip)}
                        onPublish={() => handlePublishTip(tip)}
                        onUnpublish={() => handleUnpublishTip(tip)}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
              
              {categoryTips.length === 0 && (
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <config.icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma dica encontrada nesta categoria.</p>
                    <Button 
                      onClick={() => handleCreateTip(key)}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Dica
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Formulário Modal */}
      <TipFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        tip={editingTip}
        onFinished={handleFormSubmit}
      />
    </div>
  );
} 