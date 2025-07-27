'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RegiaoFiltro, Regiao } from '@/lib/dicas-types';

interface FiltroRegiaoProps {
  regioes: RegiaoFiltro[];
  selectedRegioes: Regiao[];
  onRegioesChange: (regioes: Regiao[]) => void;
  className?: string;
}

export function FiltroRegiao({
  regioes,
  selectedRegioes,
  onRegioesChange,
  className = ''
}: FiltroRegiaoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRegiaoToggle = (regiao: Regiao) => {
    if (selectedRegioes.includes(regiao)) {
      onRegioesChange(selectedRegioes.filter(r => r !== regiao));
    } else {
      onRegioesChange([...selectedRegioes, regiao]);
    }
  };

  const handleSelectAll = () => {
    onRegioesChange(regioes.map(r => r.nome as Regiao));
  };

  const handleClearAll = () => {
    onRegioesChange([]);
  };

  const selectedRegioesData = regioes.filter(r => selectedRegioes.includes(r.nome as Regiao));

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white hover:bg-gray-50 border-gray-200"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-500" />
          <span className="font-medium">
            {selectedRegioes.length === 0 
              ? 'Todas as regiões' 
              : selectedRegioes.length === 1 
                ? selectedRegioes[0]
                : `${selectedRegioes.length} regiões`
            }
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Selected Regioes Pills */}
      {selectedRegioesData.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedRegioesData.map((regiao) => (
            <Badge
              key={regiao.id}
              variant="secondary"
              className="bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer"
              onClick={() => handleRegiaoToggle(regiao.nome as Regiao)}
            >
              {regiao.icone} {regiao.nome}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Filtrar por Região</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Selecionar Todas
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {selectedRegioes.length} de {regioes.length} regiões selecionadas
              </p>
            </div>

            {/* Regioes List */}
            <div className="p-2">
              {regioes.map((regiao) => {
                const isSelected = selectedRegioes.includes(regiao.nome as Regiao);
                return (
                  <motion.button
                    key={regiao.id}
                    onClick={() => handleRegiaoToggle(regiao.nome as Regiao)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{regiao.icone}</span>
                      <div className="text-left">
                        <div className="font-medium">{regiao.nome}</div>
                        <div className="text-xs text-gray-500">{regiao.descricao}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'bg-orange-500 border-orange-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full bg-white rounded-full"
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 