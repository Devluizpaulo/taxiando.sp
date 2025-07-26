'use client';

import { Star, MapPin, Search, Filter, Heart, Share2, Clock, Phone, Globe, Car, Users, TrendingUp, Award, Zap, X, Calendar, Tag, DollarSign, ExternalLink, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { type CityTip, type CityTipReview } from '@/lib/types';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { PageViewTracker } from "@/components/page-view-tracker";
import { getAllTips, addTipReview, getTipReviews } from '@/app/actions/city-guide-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating, ReviewForm, ReviewList } from '@/components/ui/star-rating';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SpDicasPage() {
  const [tips, setTips] = useState<CityTip[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTip, setSelectedTip] = useState<CityTip | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [reviews, setReviews] = useState<CityTipReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const fetchedTips = await getAllTips();
        setTips(fetchedTips);
  } catch (error) {
        setErrorMsg('Erro ao buscar dicas. Tente novamente mais tarde.');
    console.error("Error fetching tips:", error);
  }
    };
    fetchTips();
  }, []);

  // Filtrar e ordenar dicas
  const filteredAndSortedTips = tips
    .filter(tip => {
      const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tip.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             tip.category?.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'recent':
        default:
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
      }
    });

  // Função para compartilhar
  const handleShare = async (tip: CityTip) => {
    const shareData = {
      title: tip.title,
      text: tip.description,
      url: `${window.location.origin}/spdicas?tip=${tip.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Compartilhado!", description: "Dica compartilhada com sucesso." });
      } else {
        // Fallback para copiar link
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link Copiado!", description: "Link da dica copiado para a área de transferência." });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível compartilhar." });
    }
  };

  // Função para favoritar (simulada)
  const handleFavorite = (tip: CityTip) => {
    toast({ title: "Favoritado!", description: "Dica adicionada aos favoritos." });
  };

  // Função para carregar avaliações
  const loadReviews = async (tipId: string) => {
    setIsLoadingReviews(true);
    try {
      const fetchedReviews = await getTipReviews(tipId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível carregar as avaliações." });
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Função para submeter avaliação
  const handleSubmitReview = async (rating: number, comment: string, reviewerName: string, reviewerEmail?: string) => {
    if (!selectedTip) return;
    
    setIsSubmittingReview(true);
    try {
      const result = await addTipReview(
        selectedTip.id,
        rating,
        comment,
        reviewerName,
        reviewerEmail,
        'driver', // Por padrão, motoristas podem avaliar sem cadastro
        true // isAnonymous = true para avaliações sem cadastro
      );

      if (result.success) {
        toast({ title: "Avaliação Enviada!", description: "Obrigado por sua avaliação!" });
        
        // Atualizar estatísticas da dica localmente
        const updatedTip = { ...selectedTip };
        const currentReviews = updatedTip.reviewCount || 0;
        const currentRating = updatedTip.averageRating || 0;
        const newReviewCount = currentReviews + 1;
        const newAverageRating = ((currentRating * currentReviews) + rating) / newReviewCount;
        
        updatedTip.reviewCount = newReviewCount;
        updatedTip.averageRating = Math.round(newAverageRating * 10) / 10;
        setSelectedTip(updatedTip);
        
        // Recarregar avaliações
        await loadReviews(selectedTip.id);
      } else {
        toast({ variant: 'destructive', title: "Erro", description: result.error || "Não foi possível enviar a avaliação." });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível enviar a avaliação." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Função para abrir modal de detalhes
  const openTipDetails = async (tip: CityTip) => {
    setSelectedTip(tip);
    setIsDetailOpen(true);
    await loadReviews(tip.id);
  };

  // Categorias baseadas nos dados reais
  const categories = [
    { id: 'all', name: 'Todas', icon: '🏙️', count: tips.length },
    { id: 'gastronomia', name: 'Gastronomia', icon: '🍽️', count: tips.filter(t => t.category?.toLowerCase().includes('gastronomia')).length },
    { id: 'lazer', name: 'Lazer', icon: '🎭', count: tips.filter(t => t.category?.toLowerCase().includes('lazer')).length },
    { id: 'transporte', name: 'Transporte', icon: '🚗', count: tips.filter(t => t.category?.toLowerCase().includes('transporte')).length },
    { id: 'cultura', name: 'Cultura', icon: '🎨', count: tips.filter(t => t.category?.toLowerCase().includes('cultura')).length },
    { id: 'compras', name: 'Compras', icon: '🛍️', count: tips.filter(t => t.category?.toLowerCase().includes('compras')).length },
  ];

  // Estatísticas reais
  const totalTips = tips.length;
  const driverTips = tips.filter(t => t.target === 'driver').length;
  const clientTips = tips.filter(t => t.target === 'client').length;
  const uniqueLocations = new Set(tips.map(t => t.location)).size;

  return (
    <>
      <PageViewTracker page="spdicas" />
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
          
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-16 px-4">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto max-w-6xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="h-8 w-8" />
              <h1 className="text-4xl md:text-6xl font-bold">Guia da Cidade SP</h1>
              <Zap className="h-8 w-8" />
            </div>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Descubra os melhores lugares de São Paulo com dicas exclusivas para motoristas e passageiros
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Buscar restaurantes, pontos turísticos, estacionamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/95 backdrop-blur-sm border-0 rounded-full shadow-xl"
              />
            </div>
          </div>
        </section>

        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto max-w-7xl py-8 px-4">
            
            {/* Stats Section - Dados Reais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
                <div className="text-2xl font-bold text-orange-500">{totalTips}</div>
                <div className="text-sm text-gray-600">Dicas Disponíveis</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
                <div className="text-2xl font-bold text-blue-500">{driverTips}</div>
                <div className="text-sm text-gray-600">Para Motoristas</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
                <div className="text-2xl font-bold text-green-500">{clientTips}</div>
                <div className="text-sm text-gray-600">Para Clientes</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
                <div className="text-2xl font-bold text-purple-500">{uniqueLocations}</div>
                <div className="text-sm text-gray-600">Localizações</div>
              </div>
            </div>

            {/* Categories Filter */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Filter className="h-6 w-6 text-orange-500" />
                Explorar por Categoria
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`bg-white rounded-xl p-4 text-center shadow-sm border hover:shadow-md transition-all duration-200 group ${
                      selectedCategory === category.id ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className={`font-semibold group-hover:text-orange-600 ${
                      selectedCategory === category.id ? 'text-orange-600' : 'text-gray-800'
                    }`}>{category.name}</div>
                    <div className="text-sm text-gray-500">{category.count} dicas</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {errorMsg ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-red-300 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">{errorMsg}</h3>
                <p className="text-gray-500">Estamos trabalhando para resolver.</p>
              </div>
            ) : filteredAndSortedTips.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                    Dicas em Destaque ({filteredAndSortedTips.length})
                  </h2>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais Recentes</SelectItem>
                      <SelectItem value="title">Nome A-Z</SelectItem>
                      <SelectItem value="location">Localização</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedTips.map((tip, idx) => (
                    <div key={tip.id} className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden group animate-fadeInUp" style={{ animationDelay: `${idx * 100}ms` }}>
                      
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                  {tip.imageUrls && tip.imageUrls.length > 0 ? (
                    <Image 
                      src={tip.imageUrls[0]} 
                      alt={tip.title} 
                      fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <MapPin className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                          
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="bg-white/90 text-gray-800 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFavorite(tip);
                              }}
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              Favoritar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="bg-white/90 text-gray-800 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(tip);
                              }}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Compartilhar
                            </Button>
                          </div>
                        </div>

                        {/* Target Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className={`${
                            tip.target === 'driver' 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-emerald-500 hover:bg-emerald-600'
                          } text-white`}>
                            {tip.target === 'driver' ? <Car className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                            {tip.target === 'driver' ? 'Motorista' : 'Cliente'}
                          </Badge>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-xl text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {tip.title}
                          </h3>
                          {tip.priceRange && (
                            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                              <span className="text-sm font-semibold text-green-700">{tip.priceRange}</span>
                    </div>
                  )}
                </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 line-clamp-3">{tip.description}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <StarRating 
                            rating={tip.averageRating || 0} 
                            size="sm" 
                            showValue={true}
                          />
                          {tip.reviewCount && tip.reviewCount > 0 && (
                            <span className="text-sm text-gray-500">
                              ({tip.reviewCount} {tip.reviewCount === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    )}
                  </div>

                        {/* Location and Category */}
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{tip.location}</span>
                        </div>

                        {/* Category and Actions */}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                      {tip.category}
                          </Badge>
                          <div className="flex gap-2">
                            {tip.mapUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={tip.mapUrl} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Mapa
                                </a>
                              </Button>
                            )}
                            <Button 
                              size="sm"
                              onClick={() => openTipDetails(tip)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                  </div>
                </div>
              </div>
            ))}
                </div>
          </div>
        ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-6">🏙️</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {searchTerm || selectedCategory !== 'all' ? 'Nenhuma dica encontrada' : 'Nenhuma dica disponível ainda'}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Tente ajustar os filtros ou termos de busca.'
                      : 'Estamos preparando dicas incríveis sobre São Paulo! Volte em breve para descobrir os melhores lugares da cidade.'
                    }
                  </p>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <Button 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
          </div>
        )}
      </div>
      </main>
        
        {/* Modal de Detalhes */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTip && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Badge className={`${
                      selectedTip.target === 'driver' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    } text-white`}>
                      {selectedTip.target === 'driver' ? <Car className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                      {selectedTip.target === 'driver' ? 'Motorista' : 'Cliente'}
                    </Badge>
                    {selectedTip.title}
                  </DialogTitle>
                  <DialogDescription className="text-lg">
                    {selectedTip.location}
                  </DialogDescription>
                  
                  {/* Rating no cabeçalho */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <StarRating 
                        rating={selectedTip.averageRating || 0} 
                        size="md" 
                        showValue={true}
                      />
                      {selectedTip.reviewCount && selectedTip.reviewCount > 0 && (
                        <span className="text-sm text-gray-500">
                          • {selectedTip.reviewCount} {selectedTip.reviewCount === 1 ? 'avaliação' : 'avaliações'}
                        </span>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Imagens */}
                  {selectedTip.imageUrls && selectedTip.imageUrls.length > 0 && (
                    <div className="relative h-64 rounded-xl overflow-hidden">
                      <Image 
                        src={selectedTip.imageUrls[0]} 
                        alt={selectedTip.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  )}

                  {/* Informações Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Categoria
                        </h4>
                        <Badge variant="outline">{selectedTip.category}</Badge>
                      </div>

                      {selectedTip.priceRange && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Faixa de Preço
                          </h4>
                          <Badge className="bg-green-100 text-green-700">{selectedTip.priceRange}</Badge>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data de Criação
                        </h4>
                                                 <p className="text-sm text-gray-600">
                           {new Date(selectedTip.createdAt).toLocaleDateString('pt-BR')}
                         </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Localização
                        </h4>
                        <p className="text-gray-600">{selectedTip.location}</p>
                      </div>

                      {selectedTip.mapUrl && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Ver no Mapa
                          </h4>
                          <Button asChild variant="outline">
                            <a href={selectedTip.mapUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Abrir Google Maps
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descrição Completa */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Descrição</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedTip.description}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => handleFavorite(selectedTip)}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleShare(selectedTip)}
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    {selectedTip.mapUrl && (
                      <Button asChild className="flex-1">
                        <a href={selectedTip.mapUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Ver no Mapa
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Avaliações */}
                  <div className="pt-6 border-t">
                    <Tabs defaultValue="reviews" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="reviews" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Avaliações ({reviews.length})
                        </TabsTrigger>
                        <TabsTrigger value="add-review" className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Avaliar
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="reviews" className="mt-4">
                        {isLoadingReviews ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Carregando avaliações...</p>
                          </div>
                        ) : (
                          <ReviewList reviews={reviews} />
                        )}
                      </TabsContent>
                      
                      <TabsContent value="add-review" className="mt-4">
                        <ReviewForm 
                          onSubmit={handleSubmitReview}
                          isSubmitting={isSubmittingReview}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
      <PublicFooter />
    </div>
    </>
  );
} 