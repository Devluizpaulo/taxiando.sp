'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FiltroRegiao } from './filtro-regiao';
import { FiltroTipoDica } from './filtro-tipo-dica';
import { FiltroPerfil } from './filtro-perfil';
import { RegiaoFiltro, CategoriaFiltro, Regiao, TipoDica, Publico } from '@/lib/dicas-types';

interface BarraFiltrosStickyProps {
  regioes: RegiaoFiltro[];
  categorias: CategoriaFiltro[];
  selectedRegioes: Regiao[];
  selectedTipos: TipoDica[];
  selectedPerfis: Publico[];
  onRegioesChange: (regioes: Regiao[]) => void;
  onTiposChange: (tipos: TipoDica[]) => void;
  onPerfisChange: (perfis: Publico[]) => void;
  onClearAll: () => void;
  totalResults?: number;
  filteredResults?: number;
}

export function BarraFiltrosSticky({
  regioes,
  categorias,
  selectedRegioes,
  selectedTipos,
  selectedPerfis,
  onRegioesChange,
  onTiposChange,
  onPerfisChange,
  onClearAll,
  totalResults = 0,
  filteredResults = 0
}: BarraFiltrosStickyProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasActiveFilters = selectedRegioes.length > 0 || selectedTipos.length > 0 || selectedPerfis.length > 0;

  const activeFiltersCount = selectedRegioes.length + selectedTipos.length + selectedPerfis.length;

  return (
    <AnimatePresence>
      {isSticky && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
        >
          <div className="container mx-auto px-4 py-4">
            {/* Compact View */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-gray-800">Filtros</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>•</span>
                    {selectedRegioes.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {selectedRegioes.length} região{selectedRegioes.length > 1 ? 'ões' : 'ão'}
                      </Badge>
                    )}
                    {selectedTipos.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {selectedTipos.length} tipo{selectedTipos.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {selectedPerfis.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {selectedPerfis.length} perfil{selectedPerfis.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  {filteredResults} de {totalResults} resultados
                </div>

                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {/* Clear All Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAll}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FiltroRegiao
                      regioes={regioes}
                      selectedRegioes={selectedRegioes}
                      onRegioesChange={onRegioesChange}
                    />
                    <FiltroTipoDica
                      categorias={categorias}
                      selectedTipos={selectedTipos}
                      onTiposChange={onTiposChange}
                    />
                    <FiltroPerfil
                      selectedPerfis={selectedPerfis}
                      onPerfisChange={onPerfisChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 