
'use client';

import { type CityTip } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MapPin, 
  Users, 
  Star, 
  ExternalLink,
  Utensils,
  Mountain,
  Bed,
  Camera,
  Lightbulb,
  DollarSign,
  Clock,
  Phone,
  Globe,
  CheckCircle,
  Heart,
  Palette,
  Moon,
  Car,
  ShoppingBag,
  TreePine,
  Dog,
  Music,
  Shirt,
  BarChart,
  Sun,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CityTipCardProps {
  tip: CityTip;
  showActions?: boolean;
  onEdit?: (tip: CityTip) => void;
  onDelete?: (tip: CityTip) => void;
  onPublish?: (tip: CityTip) => void;
  onUnpublish?: (tip: CityTip) => void;
}

const tipTypeConfig = {
  gastronomia: {
    icon: Utensils,
    label: 'Comer & Beber',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    emoji: '🍽️'
  },
  'day-off': {
    icon: Mountain,
    label: 'Descanso & Bem-estar',
    color: 'bg-green-100 text-green-800 border-green-200',
    emoji: '🧘‍♂️'
  },
  pousada: {
    icon: Bed,
    label: 'Hospedagem',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    emoji: '🛏️'
  },
  turismo: {
    icon: Camera,
    label: 'Pontos Turísticos',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    emoji: '📷'
  },
  cultura: {
    icon: Palette,
    label: 'Arte & Cultura',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    emoji: '🎨'
  },
  nightlife: {
    icon: Moon,
    label: 'Vida Noturna',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    emoji: '🌃'
  },
  roteiros: {
    icon: Car,
    label: 'Roteiros & Bate-volta',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    emoji: '🚘'
  },
  compras: {
    icon: ShoppingBag,
    label: 'Compras',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    emoji: '🛍️'
  },
  aventura: {
    icon: TreePine,
    label: 'Aventura & Natureza',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    emoji: '🌳'
  },
  familia: {
    icon: Users,
    label: 'Com Crianças',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    emoji: '👨‍👩‍👧‍👦'
  },
  pet: {
    icon: Dog,
    label: 'Pet Friendly',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    emoji: '🐶'
  },
  outro: {
    icon: Lightbulb,
    label: 'Outro',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    emoji: '✨'
  }
};

const targetConfig = {
  driver: { label: 'Motoristas', icon: '🚖', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  client: { label: 'Passageiros', icon: '🧳', color: 'bg-green-100 text-green-700 border-green-200' },
  both: { label: 'Ambos', icon: '🤝', color: 'bg-purple-100 text-purple-700 border-purple-200' }
};

export function CityTipCard({ 
  tip, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onPublish, 
  onUnpublish 
}: CityTipCardProps) {
  const config = tipTypeConfig[tip.tipType];
  const targetBadge = targetConfig[tip.target];

  const renderSpecificFields = () => {
    switch (tip.tipType) {
      case 'gastronomia':
        if (!tip.gastronomia) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {tip.gastronomia.priceRange}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {tip.gastronomia.cuisineType}
            </Badge>
            {tip.gastronomia.openingHours && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {tip.gastronomia.openingHours}
              </Badge>
            )}
          </div>
        );
      
      case 'day-off':
        if (!tip.dayOff) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {tip.dayOff.travelTime}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {tip.dayOff.estimatedCost}
            </Badge>
            {tip.dayOff.positivePoints?.slice(0, 2).map((point, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {point}
              </Badge>
            ))}
          </div>
        );
      
      case 'pousada':
        if (!tip.pousada) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {tip.pousada.averagePrice}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              {tip.pousada.partnershipType === 'discount' ? 'Desconto' : 
               tip.pousada.partnershipType === 'gift' ? 'Brinde' : 'Parceria'}
            </Badge>
            {tip.pousada.couponCode && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Cupom: {tip.pousada.couponCode}
              </Badge>
            )}
          </div>
        );
      
      case 'turismo':
        if (!tip.turismo) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {tip.turismo.bestTime}
            </Badge>
            <Badge variant="outline" className={`text-xs ${tip.turismo.needsTicket ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {tip.turismo.needsTicket ? 'Ingresso necessário' : 'Gratuito'}
            </Badge>
            {tip.turismo.hasLocalGuide && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                Guia local
              </Badge>
            )}
          </div>
        );

      case 'cultura':
        if (!tip.cultura) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              {tip.cultura.eventType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {tip.cultura.entryFee}
            </Badge>
            {tip.cultura.hasGuidedTour && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                Visita guiada
              </Badge>
            )}
          </div>
        );

      case 'nightlife':
        if (!tip.nightlife) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Music className="h-3 w-3 mr-1" />
              {tip.nightlife.musicType}
            </Badge>
            {tip.nightlife.dressCode && (
              <Badge variant="outline" className="text-xs">
                <Shirt className="h-3 w-3 mr-1" />
                {tip.nightlife.dressCode}
              </Badge>
            )}
            {tip.nightlife.parkingAvailable && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Car className="h-3 w-3 mr-1" />
                Estacionamento
              </Badge>
            )}
          </div>
        );

      case 'roteiros':
        if (!tip.roteiros) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {tip.roteiros.duration}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {tip.roteiros.distance}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <BarChart className="h-3 w-3 mr-1" />
              {tip.roteiros.difficulty === 'easy' ? 'Fácil' : tip.roteiros.difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </Badge>
          </div>
        );

      case 'compras':
        if (!tip.compras) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <ShoppingBag className="h-3 w-3 mr-1" />
              {tip.compras.storeType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {tip.compras.priceRange}
            </Badge>
            {tip.compras.parking && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Car className="h-3 w-3 mr-1" />
                Estacionamento
              </Badge>
            )}
          </div>
        );

      case 'aventura':
        if (!tip.aventura) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <TreePine className="h-3 w-3 mr-1" />
              {tip.aventura.activityType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <BarChart className="h-3 w-3 mr-1" />
              {tip.aventura.difficulty === 'easy' ? 'Fácil' : tip.aventura.difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {tip.aventura.safetyLevel === 'low' ? 'Baixo' : tip.aventura.safetyLevel === 'medium' ? 'Médio' : 'Alto'}
            </Badge>
          </div>
        );

      case 'familia':
        if (!tip.familia) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {tip.familia.ageRange}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {tip.familia.priceRange}
            </Badge>
            {tip.familia.hasPlayground && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Star className="h-3 w-3 mr-1" />
                Playground
              </Badge>
            )}
          </div>
        );

      case 'pet':
        if (!tip.pet) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <Dog className="h-3 w-3 mr-1" />
              {tip.pet.petTypes?.join(', ')}
            </Badge>
            {tip.pet.hasPetArea && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Star className="h-3 w-3 mr-1" />
                Área para pets
              </Badge>
            )}
            {tip.pet.hasPetMenu && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Utensils className="h-3 w-3 mr-1" />
                Menu pet
              </Badge>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderLinks = () => {
    const links = [];
    
    if (tip.mapUrl) {
      links.push(
        <Link key="map" href={tip.mapUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Mapa
          </Button>
        </Link>
      );
    }
    
    if (tip.tipType === 'gastronomia' && tip.gastronomia?.menuUrl) {
      links.push(
        <Link key="menu" href={tip.gastronomia.menuUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Cardápio
          </Button>
        </Link>
      );
    }
    
    if (tip.tipType === 'pousada' && tip.pousada?.bookingUrl) {
      links.push(
        <Link key="booking" href={tip.pousada.bookingUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Reservar
          </Button>
        </Link>
      );
    }
    
    if (tip.tipType === 'pousada' && tip.pousada?.whatsapp) {
      links.push(
        <Link key="whatsapp" href={`https://wa.me/${tip.pousada.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-xs">
            <Phone className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>
        </Link>
      );
    }
    
    if (tip.tipType === 'turismo' && tip.turismo?.ticketUrl) {
      links.push(
        <Link key="ticket" href={tip.turismo.ticketUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            Comprar Ingresso
          </Button>
        </Link>
      );
    }
    
    return links.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-3">
        {links}
      </div>
    ) : null;
  };

  return (
    <Card className="flex flex-col shadow-lg border-0 hover:shadow-2xl transition-all duration-300 group bg-white">
      {/* Imagem */}
      {tip.imageUrls && tip.imageUrls[0] && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={tip.imageUrls[0]}
            alt={tip.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge className={config.color}>
              {config.emoji} {config.label}
            </Badge>
          </div>
          {tip.status === 'draft' && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                Rascunho
              </Badge>
            </div>
          )}
        </div>
      )}
      
      {/* Conteúdo */}
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              {tip.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
              {tip.description}
            </CardDescription>
          </div>
        </div>
        
        {/* Localização */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
          <MapPin className="h-4 w-4" />
          <span>{tip.location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {/* Campos específicos */}
        {renderSpecificFields()}
        
        {/* Links */}
        {renderLinks()}
        
        {/* Tags */}
        {tip.tags && tip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tip.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tip.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tip.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Comentário */}
        {tip.comment && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            <span className="font-medium">💡</span> {tip.comment}
          </div>
        )}
        
        {/* Colaborador */}
        {tip.contributorName && (
          <div className="mt-2 text-xs text-gray-500">
            Indicado por: <span className="font-medium">{tip.contributorName}</span>
          </div>
        )}
        
        {/* Avaliação */}
        {tip.averageRating && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{tip.averageRating.toFixed(1)}</span>
            {tip.reviewCount && (
              <span className="text-xs text-gray-500">({tip.reviewCount} avaliações)</span>
            )}
          </div>
        )}
        
        {/* Footer com badges e ações */}
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="secondary" className={targetBadge.color}>
              {targetBadge.icon} {targetBadge.label}
            </Badge>
            <Badge variant="secondary" className={config.color}>
              {config.emoji} {config.label}
            </Badge>
            {tip.status === 'draft' && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                Rascunho
              </Badge>
            )}
          </div>
          
          {/* Ações */}
          {showActions && (
            <div className="flex gap-1">
              {tip.status === 'draft' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPublish?.(tip)}
                  className="h-8 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Publicar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUnpublish?.(tip)}
                  className="h-8 px-2 text-xs"
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  Despublicar
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(tip)}
                className="h-8 px-2 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete?.(tip)}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
