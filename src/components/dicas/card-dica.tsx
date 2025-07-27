'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MapPin, Clock, Star, Car, Users, Bath, Navigation, ExternalLink, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dica } from '@/lib/dicas-types';
import { useToast } from '@/hooks/use-toast';

interface CardDicaProps {
  dica: Dica;
  onFavorite?: (dicaId: string) => void;
  onShare?: (dica: Dica) => void;
  onViewDetails?: (dica: Dica) => void;
  isFavorited?: boolean;
  isSaved?: boolean;
  onSave?: (dicaId: string) => void;
}

export function CardDica({ 
  dica, 
  onFavorite, 
  onShare, 
  onViewDetails,
  isFavorited = false,
  isSaved = false,
  onSave
}: CardDicaProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { toast } = useToast();

  const handleFavorite = () => {
    onFavorite?.(dica.id);
    toast({
      title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: dica.titulo,
    });
  };

  const handleShare = async () => {
    onShare?.(dica);
    
    const shareData = {
      title: dica.titulo,
      text: dica.descricaoCurta,
      url: `${window.location.origin}/spdicas`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link copiado!", description: "Link copiado para a área de transferência." });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleSave = () => {
    onSave?.(dica.id);
    toast({
      title: isSaved ? "Removido dos salvos" : "Salvo com sucesso",
      description: dica.titulo,
    });
  };

  const openInWaze = () => {
    if (dica.wazeUrl) {
      window.open(dica.wazeUrl, '_blank');
    } else {
      const url = `https://waze.com/ul?q=${encodeURIComponent(dica.endereco)}&navigate=yes`;
      window.open(url, '_blank');
    }
  };

  const openInGoogleMaps = () => {
    if (dica.googleMapsUrl) {
      window.open(dica.googleMapsUrl, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dica.endereco)}`;
      window.open(url, '_blank');
    }
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'Gastronomia': '🍔',
      'Cultura': '🎭',
      'Turismo': '📸',
      'Nightlife': '💃',
      'Descanso': '😴',
      'Roteiro': '🚗'
    };
    return icons[tipo] || '📍';
  };

  const getPrecoColor = (preco: string) => {
    const colors: Record<string, string> = {
      'Gratuito': 'bg-green-500',
      'Barato': 'bg-blue-500',
      'Médio': 'bg-yellow-500',
      'Caro': 'bg-red-500'
    };
    return colors[preco] || 'bg-gray-500';
  };

  const getPublicoIcon = (publico: string) => {
    return publico === 'Motorista' ? <Car className="h-4 w-4" /> : 
           publico === 'Passageiro' ? <Users className="h-4 w-4" /> : 
           <div className="flex gap-1"><Car className="h-3 w-3" /><Users className="h-3 w-3" /></div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          {/* Placeholder Image */}
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-6xl">{getTipoIcon(dica.tipo)}</div>
          </div>
          
          {/* Overlay with actions */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {/* Top left badges */}
              <div className="flex flex-col gap-2">
                <Badge className={`${getPrecoColor(dica.preco)} text-white border-0`}>
                  {dica.preco}
                </Badge>
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  {getTipoIcon(dica.tipo)} {dica.tipo}
                </Badge>
              </div>
              
              {/* Top right actions */}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/90 hover:bg-white text-gray-800 rounded-full w-8 h-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite();
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/90 hover:bg-white text-gray-800 rounded-full w-8 h-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-blue-500 text-blue-500' : ''}`} />
                </Button>
              </div>
            </div>
            
            {/* Bottom actions */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/90 text-gray-800 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  openInWaze();
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Waze
              </Button>
              
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/90 text-gray-800 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Compartilhar
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Title and Rating */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-orange-600 transition-colors">
              {dica.titulo}
            </h3>
            {dica.avaliacao && (
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{dica.avaliacao}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {dica.descricaoCurta}
          </p>

          {/* Região e Horário */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{dica.regiao}</span>
            </div>
            {dica.horarioFuncionamento && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{dica.horarioFuncionamento}</span>
              </div>
            )}
            {dica.preco && (
              <Badge className="bg-orange-100 text-orange-700 border-0 ml-2">{dica.preco}</Badge>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {getPublicoIcon(dica.publico)}
              <span className="ml-1">{dica.publico}</span>
            </Badge>
            
            {dica.estacionamento?.disponivel && (
              <Badge variant="outline" className="text-xs">
                <Car className="h-3 w-3 mr-1" />
                {dica.estacionamento.tipo}
              </Badge>
            )}
            
            {dica.banheiros?.disponivel && (
              <Badge variant="outline" className="text-xs">
                <Bath className="h-3 w-3 mr-1" />
                {dica.banheiros.limpo ? 'Limpo' : 'Básico'}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {dica.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dica.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                  #{tag}
                </Badge>
              ))}
              {dica.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100">
                  +{dica.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                openInGoogleMaps();
              }}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Maps
            </Button>
            
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(dica);
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 