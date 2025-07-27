'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDica } from './card-dica';
import { Dica } from '@/lib/dicas-types';
import { Loader2, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface GridDicasProps {
  dicas: Dica[];
  onFavorite?: (dicaId: string) => void;
  onShare?: (dica: Dica) => void;
  onViewDetails?: (dica: Dica) => void;
  onSave?: (dicaId: string) => void;
  favoritedIds?: string[];
  savedIds?: string[];
  loading?: boolean;
  showFilters?: boolean;
  onClearFilters?: () => void;
  totalResults?: number;
}

export function GridDicas({
  dicas,
  onFavorite,
  onShare,
  onViewDetails,
  onSave,
  favoritedIds = [],
  savedIds = [],
  loading = false,
  showFilters = true,
  onClearFilters,
  totalResults
}: GridDicasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDicas, setFilteredDicas] = useState<Dica[]>(dicas);

  // Filter dicas based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDicas(dicas);
    } else {
      const filtered = dicas.filter(dica =>
        dica.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dica.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dica.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dica.regiao.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDicas(filtered);
    }
  }, [dicas, searchTerm]);

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">Buscar e Filtrar</h3>
            </div>
            
            {(hasActiveFilters || onClearFilters) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  handleClearSearch();
                  onClearFilters?.();
                }}
                className="text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="🔍 Buscar por nome, descrição, tags ou região..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 transition-colors"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : (
                <span>
                  {filteredDicas.length} de {totalResults || dicas.length} dicas encontradas
                </span>
              )}
            </div>
            
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Filtros ativos
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dicas...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDicas.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Nenhuma dica encontrada
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm 
                ? `Não encontramos dicas para "${searchTerm}". Tente ajustar os termos de busca.`
                : 'Não há dicas disponíveis no momento.'
              }
            </p>
            {(hasActiveFilters || onClearFilters) && (
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  handleClearSearch();
                  onClearFilters?.();
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Grid of Dicas */}
      {!loading && filteredDicas.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredDicas.map((dica, index) => (
              <motion.div
                key={dica.id}
                variants={itemVariants}
                layout
                className="break-inside-avoid"
              >
                <CardDica
                  dica={dica}
                  onFavorite={onFavorite}
                  onShare={onShare}
                  onViewDetails={onViewDetails}
                  onSave={onSave}
                  isFavorited={favoritedIds.includes(dica.id)}
                  isSaved={savedIds.includes(dica.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load More Button (if needed) */}
      {!loading && filteredDicas.length > 0 && filteredDicas.length < (totalResults || dicas.length) && (
        <div className="text-center pt-8">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white hover:bg-gray-50"
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Carregar Mais Dicas
          </Button>
        </div>
      )}
    </div>
  );
} 