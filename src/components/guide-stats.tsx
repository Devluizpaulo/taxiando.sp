'use client';

import { Bath, Car, Clock, MapPin, Route, Star, Users, Wifi } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GuideStatsProps {
  totalLocations: number;
  totalRoutes: number;
  totalRegions: number;
  totalCategories: number;
  averageRating: number;
  totalReviews: number;
  averageFare: number;
  totalDistance: number;
}

export function GuideStats({
  totalLocations,
  totalRoutes,
  totalRegions,
  totalCategories,
  averageRating,
  totalReviews,
  averageFare,
  totalDistance
}: GuideStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {totalLocations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-orange-700 font-medium">
            Locais Verificados
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Route className="h-5 w-5" />
            {totalRoutes}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-blue-700 font-medium">
            Roteiros Prontos
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <Bath className="h-5 w-5" />
            100%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-700 font-medium">
            Banheiros Limpos
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-purple-600 flex items-center gap-2">
            <Car className="h-5 w-5" />
            {totalRegions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-purple-700 font-medium">
            Regiões Cobertas
          </CardDescription>
        </CardContent>
      </Card>

      {/* Estatísticas adicionais */}
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
            <Star className="h-5 w-5" />
            {averageRating.toFixed(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-yellow-700 font-medium">
            Avaliação Média
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {totalReviews}+
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-red-700 font-medium">
            Avaliações
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            24h
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-emerald-700 font-medium">
            Locais 24h
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-indigo-700 font-medium">
            Busca Instantânea
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
} 