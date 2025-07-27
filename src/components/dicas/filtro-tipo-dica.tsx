'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoriaFiltro, TipoDica } from '@/lib/dicas-types';

interface FiltroTipoDicaProps {
  categorias: CategoriaFiltro[];
  selectedTipos: TipoDica[];
  onTiposChange: (tipos: TipoDica[]) => void;
  className?: string;
}

export function FiltroTipoDica({
  categorias,
  selectedTipos,
  onTiposChange,
  className = ''
}: FiltroTipoDicaProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTipoToggle = (tipo: TipoDica) => {
    if (selectedTipos.includes(tipo)) {
      onTiposChange(selectedTipos.filter(t => t !== tipo));
    } else {
      onTiposChange([...selectedTipos, tipo]);
    }
  };

  const handleSelectAll = () => {
    onTiposChange(categorias.map(c => c.nome as TipoDica));
  };

  const handleClearAll = () => {
    onTiposChange([]);
  };

  const selectedCategoriasData = categorias.filter(c => selectedTipos.includes(c.nome as TipoDica));

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white hover:bg-gray-50 border-gray-200"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-purple-500" />
          <span className="font-medium">
            {selectedTipos.length === 0 
              ? 'Todos os tipos' 
              : selectedTipos.length === 1 
                ? selectedTipos[0]
                : `${selectedTipos.length} tipos`
            }
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Selected Tipos Pills */}
      {selectedCategoriasData.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedCategoriasData.map((categoria) => (
            <Badge
              key={categoria.id}
              variant="secondary"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
              onClick={() => handleTipoToggle(categoria.nome as TipoDica)}
            >
              {categoria.icone} {categoria.nome}
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
                <h3 className="font-semibold text-gray-800">Filtrar por Tipo</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Selecionar Todos
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
                {selectedTipos.length} de {categorias.length} tipos selecionados
              </p>
            </div>

            {/* Categorias List */}
            <div className="p-2">
              {categorias.map((categoria) => {
                const isSelected = selectedTipos.includes(categoria.nome as TipoDica);
                return (
                  <motion.button
                    key={categoria.id}
                    onClick={() => handleTipoToggle(categoria.nome as TipoDica)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{categoria.icone}</span>
                      <div className="text-left">
                        <div className="font-medium">{categoria.nome}</div>
                        <div className="text-xs text-gray-500">{categoria.descricao}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'bg-purple-500 border-purple-500' 
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