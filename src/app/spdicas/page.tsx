'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Search, Filter, Heart, Share2, Clock, Phone, Globe, Car, Users, TrendingUp, Award, Zap, X, Calendar, Tag, DollarSign, ExternalLink, MessageSquare, Route as RouteIcon, Bath, Clock as ClockIcon, Star as StarIcon, Map, Coffee, Utensils, Navigation, Menu, ChevronRight, Plus, Bookmark, Grid, List, SlidersHorizontal, ArrowUpDown, Eye, ThumbsUp, Compass, Target, Layers, Settings } from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { PageViewTracker } from "@/components/page-view-tracker";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Import new components
import { GridDicas } from '@/components/dicas/grid-dicas';
import { BarraFiltrosSticky } from '@/components/dicas/barra-filtros-sticky';
import { FiltroRegiao } from '@/components/dicas/filtro-regiao';
import { FiltroTipoDica } from '@/components/dicas/filtro-tipo-dica';
import { FiltroPerfil } from '@/components/dicas/filtro-perfil';

// Import types and data
import { Dica, Regiao, TipoDica, Publico, FiltrosDicas } from '@/lib/dicas-types';
import { getAllTips } from '@/app/actions/city-guide-actions';
// Importar getGlobalSettings:
import { getGlobalSettings } from '@/app/actions/admin-actions';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'rating' | 'distance' | 'price' | 'newest';

export default function SpDicasPage() {
  // State management
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [filteredDicas, setFilteredDicas] = useState<Dica[]>([]);
  const [selectedDica, setSelectedDica] = useState<Dica | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter states
  const [selectedRegioes, setSelectedRegioes] = useState<Regiao[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<TipoDica[]>([]);
  const [selectedPerfis, setSelectedPerfis] = useState<Publico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para categorias/regiões globais:
  const [globalCategories, setGlobalCategories] = useState<string[]>([]);
  const [globalRegions, setGlobalRegions] = useState<string[]>([]);

  const { toast } = useToast();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Defina os labels amigáveis e emojis para categorias e regiões:
  const categoriaLabels: Record<string, string> = {
    'comer-beber': 'Comer & Beber 🍽️',
    'arte-cultura': 'Arte & Cultura 🎨',
    'pontos-turisticos': 'Pontos Turísticos 📷',
    'vida-noturna': 'Vida Noturna 🌃',
    'descanso-bemestar': 'Descanso & Bem-estar 🧘‍♂️',
    'roteiros-batevolta': 'Roteiros & Bate-volta 🚘',
    'compras': 'Compras 🛍️',
    'aventura-natureza': 'Aventura & Natureza 🌳',
    'com-criancas': 'Com Crianças 👨‍👩‍👧‍👦',
    'pet-friendly': 'Pet Friendly 🐶',
  };
  const regiaoLabels: Record<string, string> = {
    'zona-norte': 'Zona Norte',
    'zona-sul': 'Zona Sul',
    'zona-leste': 'Zona Leste',
    'zona-oeste': 'Zona Oeste',
    'centro': 'Centro',
    'abc': 'ABC',
    'litoral-sul': 'Litoral Sul',
    'vale-paraiba': 'Vale do Paraíba',
    'interior': 'Interior',
    'serra-mantiqueira': 'Serra da Mantiqueira',
    'circuito-aguas': 'Circuito das Águas',
    'litoral-norte': 'Litoral Norte',
    'oeste-paulista': 'Oeste Paulista',
    'itu-indaiatuba-salto': 'Itu/Indaiatuba/Salto',
  };

  // Substitua o array de stats/cards do hero por:
  const perfilCards = [
    { key: 'motorista', icon: '🚖', label: 'Motorista', color: 'from-yellow-300 to-yellow-500' },
    { key: 'passageiro', icon: '🧳', label: 'Passageiro', color: 'from-blue-200 to-blue-400' },
    { key: 'ambos', icon: '🤝', label: 'Ambos', color: 'from-pink-200 to-pink-400' },
  ];

  // Filter dicas based on all criteria
  const filteredDicasMemo = useMemo(() => {
    let filtered = dicas.filter(dica => {
      const matchesRegion = selectedRegioes.length === 0 || selectedRegioes.includes(dica.regiao);
      const matchesType = selectedTipos.length === 0 || selectedTipos.includes(dica.tipo);
      const matchesPublic = selectedPerfis.length === 0 || selectedPerfis.includes(dica.publico);
      const matchesSearch = !searchTerm || 
        dica.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dica.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dica.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dica.regiao.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesRegion && matchesType && matchesPublic && matchesSearch;
    });

    // Sort filtered results
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.avaliacao || 0) - (a.avaliacao || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.ultimaAtualizacao || 0).getTime() - new Date(a.ultimaAtualizacao || 0).getTime());
        break;
      case 'price':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
          const priceB = parseFloat(b.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
          return priceA - priceB;
        });
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [dicas, selectedRegioes, selectedTipos, selectedPerfis, searchTerm, sortBy]);

  // Update filtered dicas when filters change
  useEffect(() => {
    async function fetchDicas() {
      const tips = await getAllTips();
      setDicas(tips as any); // adapte o tipo se necessário
      setFilteredDicas(tips as any);
    }
    fetchDicas();
  }, []);

  // Buscar listas globais ao carregar:
  useEffect(() => {
    async function fetchGlobals() {
      const settings = await getGlobalSettings();
      if ((settings as any).cityGuideCategories) setGlobalCategories((settings as any).cityGuideCategories);
      if ((settings as any).cityGuideRegions) setGlobalRegions((settings as any).cityGuideRegions);
    }
    fetchGlobals();
  }, []);

  // Handle favorite
  const handleFavorite = (dicaId: string) => {
    setFavoritedIds(prev => 
      prev.includes(dicaId) 
        ? prev.filter(id => id !== dicaId)
        : [...prev, dicaId]
    );
    toast({ 
      title: favoritedIds.includes(dicaId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: "Sua lista foi atualizada."
    });
  };

  // Handle save
  const handleSave = (dicaId: string) => {
    setSavedIds(prev => 
      prev.includes(dicaId) 
        ? prev.filter(id => id !== dicaId)
        : [...prev, dicaId]
    );
    toast({ 
      title: savedIds.includes(dicaId) ? "Removido dos salvos" : "Salvo para depois",
      description: "Sua lista foi atualizada."
    });
  };

  // Handle share
  const handleShare = async (dica: Dica) => {
    const shareData = {
      title: dica.titulo,
      text: dica.descricaoCurta,
      url: `${window.location.origin}/spdicas`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Compartilhado!", description: "Dica compartilhada com sucesso." });
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link copiado!", description: "Link copiado para a área de transferência." });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível compartilhar." });
    }
  };

  // Handle view details
  const handleViewDetails = (dica: Dica) => {
    setSelectedDica(dica);
    setIsDetailOpen(true);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSelectedRegioes([]);
    setSelectedTipos([]);
    setSelectedPerfis([]);
    setSearchTerm('');
    toast({ title: "Filtros limpos", description: "Todos os filtros foram removidos." });
  };

  // Get tab content
  const getTabContent = () => {
    switch (activeTab) {
      case 'favorites':
        return dicas.filter(dica => favoritedIds.includes(dica.id));
      case 'saved':
        return dicas.filter(dica => savedIds.includes(dica.id));
      case 'trending':
        return dicas.filter(dica => dica.avaliacao && dica.avaliacao >= 4.5);
      case 'nearby':
        return dicas.filter(dica => dica.regiao === 'centro');
      default:
        return filteredDicas;
    }
  };

  const currentDicas = getTabContent();
  const dicasDestaque = dicas.filter(d => d.destaque);

  return (
    <>
      <PageViewTracker page="spdicas" />
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <PublicHeader />
          
        {/* Enhanced Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-8 lg:py-12 px-2 overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-black/20"></div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute top-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            className="absolute bottom-10 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"
          ></motion.div>
          
          <div className="relative container mx-auto max-w-7xl text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="flex items-center justify-center gap-6 mb-8"
            >
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <Compass className="h-12 w-12" />
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                SP Dicas
              </h1>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <Target className="h-12 w-12" />
            </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base md:text-lg lg:text-xl mb-6 opacity-95 max-w-4xl mx-auto leading-relaxed font-light"
            >
              Descubra os segredos de São Paulo com nossa curadoria exclusiva
            </motion.p>
            
            {/* Enhanced Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-2xl mx-auto relative group mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
              <Input 
                      placeholder="🔍 Buscar lugares, restaurantes, bares, shoppings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-6 py-4 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none"
              />
            </div>
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-8 shadow-lg">
                    <Search className="h-5 w-5 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Enhanced Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 max-w-5xl mx-auto"
            >
              {[
                { icon: MapPin, label: 'Dicas', value: dicas.length, color: 'from-blue-400 to-blue-600', onClick: () => {/* scroll to dicas section */} },
                { icon: Layers, label: 'Regiões', value: globalRegions.length, color: 'from-purple-400 to-purple-600', onClick: () => {/* abrir filtro região */} },
                { icon: Tag, label: 'Categorias', value: globalCategories.length, color: 'from-pink-400 to-pink-600', onClick: () => {/* abrir filtro categoria */} },
                ...perfilCards.map(perfil => ({
                  icon: () => <span className="text-2xl">{perfil.icon}</span>,
                  label: perfil.label,
                  value: '',
                  color: perfil.color,
                  isPerfil: true,
                  perfilKey: perfil.key as Publico,
                  onClick: () => {
                    if (selectedPerfis.includes(perfil.key as Publico)) {
                      setSelectedPerfis(selectedPerfis.filter(p => p !== perfil.key));
                    } else {
                      setSelectedPerfis([perfil.key as Publico]);
                    }
                  }
                })),
                { icon: Award, label: 'Verificadas', value: '100%', color: 'from-green-400 to-green-600', onClick: () => {/* abrir modal/verificadas */} }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  onClick={stat.onClick}
                  className={`cursor-pointer bg-gradient-to-br ${stat.color} rounded-xl p-4 border border-white/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center min-h-[90px] select-none
                    ${'isPerfil' in stat && stat.isPerfil && selectedPerfis.includes(stat.perfilKey) ? 'ring-4 ring-yellow-300 border-yellow-400 scale-105' : ''}`}
                  style={{ outline: 'none' }}
                  tabIndex={0}
                >
                  {stat.icon && <stat.icon className="h-7 w-7 mb-2 mx-auto" />}
                  <div className="text-xl lg:text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs lg:text-sm opacity-90 font-medium text-center">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {dicasDestaque.length > 0 && (
          <section className="max-w-6xl mx-auto mt-6 mb-10 px-2">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 flex items-center gap-2">
              <Star className="text-yellow-400 h-7 w-7" /> Destaques
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {dicasDestaque.map((dica) => (
                <motion.div key={dica.id} whileHover={{ scale: 1.04 }} className="min-w-[320px] max-w-xs bg-white rounded-2xl shadow-xl border-2 border-yellow-100 p-4 flex flex-col relative">
                  <span className="absolute top-3 right-3 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Destaque</span>
                  <img src={dica.imagemUrl || '/public/txsp.png'} alt={dica.titulo} className="rounded-xl h-40 w-full object-cover mb-3" />
                  <h3 className="text-lg font-bold mb-1 text-gray-900">{dica.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dica.descricaoCurta || dica.descricaoCompleta}</p>
                  <div className="flex gap-2 flex-wrap mt-auto">
                    <Badge className="bg-pink-100 text-pink-700">{categoriaLabels[dica.tipo] ?? dica.tipo}</Badge>
                    <Badge className="bg-blue-100 text-blue-700">{regiaoLabels[dica.regiao] ?? dica.regiao}</Badge>
                  </div>
                </motion.div>
              ))}
          </div>
        </section>
        )}

        <main className="flex-1">
          <div className="container mx-auto max-w-7xl py-8 px-4">
            
            {/* Enhanced Navigation Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  Explore São Paulo
                </h2>
                <p className="text-gray-600 text-lg">Encontre experiências únicas na cidade que nunca dorme</p>
            </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
                  <TabsList className="grid grid-cols-2 lg:grid-cols-5 bg-white shadow-lg rounded-2xl p-2 border border-gray-200">
                    {[
                      { value: 'discover', icon: Compass, label: 'Descobrir', count: filteredDicas.length },
                      { value: 'trending', icon: TrendingUp, label: 'Em Alta', count: dicas.filter(d => d.avaliacao && d.avaliacao >= 4.5).length },
                      { value: 'nearby', icon: Navigation, label: 'Próximos', count: dicas.filter(d => d.regiao === 'centro').length },
                      { value: 'favorites', icon: Heart, label: 'Favoritos', count: favoritedIds.length },
                      { value: 'saved', icon: Bookmark, label: 'Salvos', count: savedIds.length }
                    ].map((tab) => (
                      <TabsTrigger 
                        key={tab.value}
                        value={tab.value} 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 px-4 py-3"
                      >
                        <tab.icon className="h-4 w-4" />
                        <span className="font-semibold hidden sm:inline">{tab.label}</span>
                        <Badge variant="secondary" className="ml-1 text-xs bg-white/20 text-current border-0">
                          {tab.count}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Enhanced Controls */}
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-white rounded-xl shadow-md border border-gray-200 p-1">
                            <Button 
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                              size="sm" 
                        onClick={() => setViewMode('grid')}
                        className={`rounded-lg ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600'}`}
                      >
                        <Grid className="h-4 w-4" />
                            </Button>
                            <Button 
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                              size="sm" 
                        onClick={() => setViewMode('list')}
                        className={`rounded-lg ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-600'}`}
                      >
                        <List className="h-4 w-4" />
                            </Button>
                </div>

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger className="w-48 bg-white shadow-md border-gray-200 rounded-xl">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                        <SelectItem value="relevance">Relevância</SelectItem>
                        <SelectItem value="rating">Avaliação</SelectItem>
                        <SelectItem value="distance">Distância</SelectItem>
                        <SelectItem value="price">Preço</SelectItem>
                        <SelectItem value="newest">Mais Recentes</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Mobile Filters */}
                    <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="lg:hidden bg-white shadow-md border-gray-200 rounded-xl">
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          Filtros
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-80">
                        <SheetHeader>
                          <SheetTitle>Filtros</SheetTitle>
                          <SheetDescription>
                            Refine sua busca por dicas
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          <FiltroRegiao
                            regioes={globalRegions.map(r => ({
                              id: r,
                              value: r,
                              label: r,
                              nome: r,
                              icone: 'MapPin',
                              cor: 'blue',
                              descricao: r
                            }))}
                            selectedRegioes={selectedRegioes}
                            onRegioesChange={setSelectedRegioes}
                          />
                          <FiltroTipoDica
                            categorias={globalCategories.map(c => ({
                              id: c,
                              value: c,
                              label: c,
                              nome: c,
                              icone: 'Tag',
                              cor: 'pink',
                              descricao: c
                            }))}
                            selectedTipos={selectedTipos}
                            onTiposChange={setSelectedTipos}
                          />
                          <FiltroPerfil
                            selectedPerfis={selectedPerfis}
                            onPerfisChange={setSelectedPerfis}
                          />
                            <Button 
                            variant="outline" 
                            onClick={handleClearAllFilters}
                            className="w-full"
                            >
                            <X className="h-4 w-4 mr-2" />
                            Limpar Filtros
                            </Button>
                          </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* Desktop Filters */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="hidden lg:block mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                        <SlidersHorizontal className="h-5 w-5 text-white" />
              </div>
                      <h3 className="font-semibold text-gray-800 text-lg">Filtros Avançados</h3>
          </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearAllFilters}
                      className="text-sm border-gray-200 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FiltroRegiao
                      regioes={globalRegions.map(r => ({
                        id: r,
                        value: r,
                        label: r,
                        nome: r,
                        icone: 'MapPin',
                        cor: 'blue',
                        descricao: r
                      }))}
                      selectedRegioes={selectedRegioes}
                      onRegioesChange={setSelectedRegioes}
                    />
                    <FiltroTipoDica
                      categorias={globalCategories.map(c => ({
                        id: c,
                        value: c,
                        label: c,
                        nome: c,
                        icone: 'Tag',
                        cor: 'pink',
                        descricao: c
                      }))}
                      selectedTipos={selectedTipos}
                      onTiposChange={setSelectedTipos}
                    />
                    <FiltroPerfil
                      selectedPerfis={selectedPerfis}
                      onPerfisChange={setSelectedPerfis}
                    />
                  </div>
                </motion.div>

                {/* Results Summary */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Eye className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {currentDicas.length} {currentDicas.length === 1 ? 'dica encontrada' : 'dicas encontradas'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activeTab === 'discover' ? 'Mostrando todas as dicas disponíveis' : 
                         activeTab === 'favorites' ? 'Suas dicas favoritas' :
                         activeTab === 'saved' ? 'Dicas salvas para depois' :
                         activeTab === 'trending' ? 'Dicas mais populares' :
                         'Dicas próximas a você'}
                      </p>
                    </div>
                  </div>
                  
                  {(selectedRegioes.length > 0 || selectedTipos.length > 0 || selectedPerfis.length > 0 || searchTerm) && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white border border-gray-200">
                        Filtros ativos
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                </motion.div>

                {/* Content Tabs */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value={activeTab} className="space-y-6 mt-0">
                      {['trending', 'nearby'].includes(activeTab) ? (
                        <div className="overflow-x-auto flex gap-6 py-4 snap-x snap-mandatory">
                          {currentDicas.map((dica, idx) => (
                            <div key={dica.id} className="min-w-[340px] max-w-xs snap-center">
                              {/* Card grande estilo Reels */}
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleViewDetails(dica)}
                              >
                                {/* Imagem de capa */}
                                <div className="h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                  <span className="text-7xl">{categoriaLabels[dica.tipo] ? categoriaLabels[dica.tipo].split(' ').pop() : '📍'}</span>
                                </div>
                                {/* Overlay info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 flex flex-col gap-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-white/80 text-gray-800 border-0">{categoriaLabels[dica.tipo] || dica.tipo}</Badge>
                                    <Badge className="bg-white/80 text-gray-800 border-0">{regiaoLabels[dica.regiao] || dica.regiao}</Badge>
                                    {dica.preco && <Badge className="bg-orange-100 text-orange-700 border-0">{dica.preco}</Badge>}
                                  </div>
                                  <h3 className="text-lg font-bold text-white line-clamp-2">{dica.titulo}</h3>
                                  <p className="text-xs text-white/90 line-clamp-2">{dica.descricaoCurta}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button size="icon" variant="ghost" className="bg-white/80 hover:bg-white/90 text-orange-600 rounded-full" onClick={e => {e.stopPropagation(); handleFavorite(dica.id);}}><Heart className={favoritedIds.includes(dica.id) ? 'fill-orange-500' : ''} /></Button>
                                    <Button size="icon" variant="ghost" className="bg-white/80 hover:bg-white/90 text-indigo-600 rounded-full" onClick={e => {e.stopPropagation(); handleSave(dica.id);}}><Bookmark className={savedIds.includes(dica.id) ? 'fill-indigo-500' : ''} /></Button>
                                    <Button size="icon" variant="ghost" className="bg-white/80 hover:bg-white/90 text-pink-600 rounded-full" onClick={e => {e.stopPropagation(); handleShare(dica);}}><Share2 /></Button>
                                  </div>
                                  {/* Tags */}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {dica.tags?.slice(0, 3).map((tag, i) => (
                                      <Badge key={i} className="bg-indigo-50 text-indigo-700 border-0 text-xs">#{tag}</Badge>
                                    ))}
                                    {dica.tags?.length > 3 && <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs">+{dica.tags.length - 3}</Badge>}
                </div>
          </div>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <GridDicas
                          dicas={currentDicas}
                          onFavorite={handleFavorite}
                          onShare={handleShare}
                          onViewDetails={handleViewDetails}
                          onSave={handleSave}
                          favoritedIds={favoritedIds}
                          savedIds={savedIds}
                          loading={loading}
                          showFilters={false}
                          totalResults={currentDicas.length}
                        />
                      )}
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </motion.div>
      </div>
      </main>
        
        {/* Enhanced Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
            {selectedDica && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative p-6 h-full flex flex-col justify-end">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            {selectedDica.preco}
                          </Badge>
                          <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            {selectedDica.tipo}
                    </Badge>
                        </div>
                        <DialogTitle className="text-3xl font-bold mb-2">
                          {selectedDica.titulo}
                  </DialogTitle>
                        <DialogDescription className="text-white/90 text-lg">
                          {selectedDica.endereco}
                  </DialogDescription>
                      </div>
                  
                    <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFavorite(selectedDica.id)}
                          className="text-white hover:bg-white/20 backdrop-blur-sm"
                        >
                          <Heart className={`h-5 w-5 ${favoritedIds.includes(selectedDica.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(selectedDica.id)}
                          className="text-white hover:bg-white/20 backdrop-blur-sm"
                        >
                          <Bookmark className={`h-5 w-5 ${savedIds.includes(selectedDica.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(selectedDica)}
                          className="text-white hover:bg-white/20 backdrop-blur-sm"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-white/90">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{selectedDica.regiao}</span>
                    </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{selectedDica.horarioFuncionamento || 'Consultar horário'}</span>
                      </div>
                      {selectedDica.avaliacao && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">{selectedDica.avaliacao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Description */}
                      <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        Sobre este lugar
                        </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedDica.descricaoCompleta || selectedDica.descricaoCurta}
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-indigo-600" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDica.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(selectedDica.telefone || selectedDica.website) && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Phone className="h-5 w-5 text-indigo-600" />
                          Contato
                        </h4>
                        <div className="space-y-2">
                          {selectedDica.telefone && (
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">{selectedDica.telefone}</span>
                      </div>
                          )}
                          {selectedDica.website && (
                            <div className="flex items-center gap-3">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <a 
                                href={selectedDica.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 hover:underline"
                              >
                                Visitar website
                                <ExternalLink className="h-3 w-3 ml-1 inline" />
                              </a>
                        </div>
                      )}
                    </div>
                  </div>
                    )}

                    {/* Navigation */}
                  <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-indigo-600" />
                        Como chegar
                      </h4>
                      <div className="flex gap-3">
                    <Button 
                          onClick={() => {
                            if (selectedDica.wazeUrl) {
                              window.open(selectedDica.wazeUrl, '_blank');
                            } else {
                              const url = `https://waze.com/ul?q=${encodeURIComponent(selectedDica.endereco)}&navigate=yes`;
                              window.open(url, '_blank');
                            }
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Abrir no Waze
                    </Button>
                    <Button 
                      variant="outline" 
                          onClick={() => {
                            if (selectedDica.googleMapsUrl) {
                              window.open(selectedDica.googleMapsUrl, '_blank');
                            } else {
                              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDica.endereco)}`;
                              window.open(url, '_blank');
                            }
                          }}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Map className="h-4 w-4 mr-2" />
                          Google Maps
                      </Button>
                  </div>
                          </div>
                  </div>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
        
      <PublicFooter />
    </div>
    </>
  );
} 