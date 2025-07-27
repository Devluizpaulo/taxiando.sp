'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, Car, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Publico } from '@/lib/dicas-types';

interface FiltroPerfilProps {
  selectedPerfis: Publico[];
  onPerfisChange: (perfis: Publico[]) => void;
  className?: string;
}

const perfis = [
  {
    id: 'motorista',
    nome: 'Motorista',
    icone: '🚗',
    descricao: 'Dicas para quem dirige',
    cor: 'bg-blue-500',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  {
    id: 'passageiro',
    nome: 'Passageiro',
    icone: '👥',
    descricao: 'Dicas para quem usa transporte público',
    cor: 'bg-green-500',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  {
    id: 'ambos',
    nome: 'Ambos',
    icone: '🔄',
    descricao: 'Dicas para todos',
    cor: 'bg-purple-500',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  }
];

export function FiltroPerfil({
  selectedPerfis,
  onPerfisChange,
  className = ''
}: FiltroPerfilProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePerfilToggle = (perfil: Publico) => {
    if (selectedPerfis.includes(perfil)) {
      onPerfisChange(selectedPerfis.filter(p => p !== perfil));
    } else {
      onPerfisChange([...selectedPerfis, perfil]);
    }
  };

  const handleSelectAll = () => {
    onPerfisChange(['Motorista', 'Passageiro', 'Ambos']);
  };

  const handleClearAll = () => {
    onPerfisChange([]);
  };

  const selectedPerfisData = perfis.filter(p => selectedPerfis.includes(p.nome as Publico));

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white hover:bg-gray-50 border-gray-200"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" />
          <span className="font-medium">
            {selectedPerfis.length === 0 
              ? 'Todos os perfis' 
              : selectedPerfis.length === 1 
                ? selectedPerfis[0]
                : `${selectedPerfis.length} perfis`
            }
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Selected Perfis Pills */}
      {selectedPerfisData.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedPerfisData.map((perfil) => (
            <Badge
              key={perfil.id}
              variant="secondary"
              className={`${perfil.bgColor} ${perfil.textColor} hover:opacity-80 cursor-pointer`}
              onClick={() => handlePerfilToggle(perfil.nome as Publico)}
            >
              {perfil.icone} {perfil.nome}
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
                <h3 className="font-semibold text-gray-800">Filtrar por Perfil</h3>
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
                {selectedPerfis.length} de {perfis.length} perfis selecionados
              </p>
            </div>

            {/* Perfis List */}
            <div className="p-2">
              {perfis.map((perfil) => {
                const isSelected = selectedPerfis.includes(perfil.nome as Publico);
                return (
                  <motion.button
                    key={perfil.id}
                    onClick={() => handlePerfilToggle(perfil.nome as Publico)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? `${perfil.bgColor} ${perfil.textColor} ${perfil.borderColor} border`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{perfil.icone}</span>
                      <div className="text-left">
                        <div className="font-medium">{perfil.nome}</div>
                        <div className="text-xs text-gray-500">{perfil.descricao}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? `${perfil.cor} border-current` 
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