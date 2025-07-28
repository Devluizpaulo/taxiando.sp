
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { type CityTip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { generateTipWithAI, createOrUpdateTip } from '@/app/actions/city-guide-actions';
import confetti from 'canvas-confetti';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, Target, MapPin, Image as ImageIcon, Globe, Users, Car, Star, Zap, Lightbulb, BookOpen, Coffee, ShoppingBag, Camera, Music, Heart, Building, Tag, X, Utensils, Bed, Mountain, Clock, DollarSign, Phone, Calendar, CheckCircle, Brain, Palette, TreePine, Moon, Shirt, BarChart, Sun, Shield, Dog } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FirebaseImageUpload } from '@/components/ui/firebase-image-upload';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TipFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tip: CityTip | null;
    onFinished: (tip: CityTip) => void;
}

// Opções de tipos de dica com ícones
const tipTypeOptions = [
  { value: 'gastronomia', label: '🍽️ Comer & Beber', desc: 'Restaurantes, cafés, bares, padarias' },
  { value: 'day-off', label: '🧘‍♂️ Descanso & Bem-estar', desc: 'Parques, spas, cafés calmos' },
  { value: 'pousada', label: '🛏️ Hospedagem', desc: 'Hotéis, pousadas, hostels com parcerias' },
  { value: 'turismo', label: '📷 Pontos Turísticos', desc: 'Monumentos, atrações, mirantes' },
  { value: 'cultura', label: '🎨 Arte & Cultura', desc: 'Museus, galerias, teatros, exposições' },
  { value: 'nightlife', label: '🌃 Vida Noturna', desc: 'Bares, baladas, casas noturnas' },
  { value: 'roteiros', label: '🚘 Roteiros & Bate-volta', desc: 'Passeios, roteiros turísticos' },
  { value: 'compras', label: '🛍️ Compras', desc: 'Shoppings, feirinhas, outlets' },
  { value: 'aventura', label: '🌳 Aventura & Natureza', desc: 'Trilhas, cachoeiras, parques naturais' },
  { value: 'familia', label: '👨‍👩‍👧‍👦 Com Crianças', desc: 'Atrações family-friendly' },
  { value: 'pet', label: '🐶 Pet Friendly', desc: 'Locais que aceitam pets' },
  { value: 'outro', label: '✨ Outro', desc: 'Outras categorias especiais' },
];

const regionOptions = [
  { value: 'zona-norte', label: 'Zona Norte' },
  { value: 'zona-sul', label: 'Zona Sul' },
  { value: 'zona-leste', label: 'Zona Leste' },
  { value: 'zona-oeste', label: 'Zona Oeste' },
  { value: 'centro', label: 'Centro' },
  { value: 'abc', label: 'ABC' },
  { value: 'litoral-sul', label: 'Litoral Sul' },
  { value: 'vale-paraiba', label: 'Vale do Paraíba' },
  { value: 'interior', label: 'Interior' },
  { value: 'serra-mantiqueira', label: 'Serra da Mantiqueira' },
  { value: 'circuito-aguas', label: 'Circuito das Águas' },
  { value: 'litoral-norte', label: 'Litoral Norte' },
  { value: 'oeste-paulista', label: 'Oeste Paulista' },
  { value: 'itu-indaiatuba-salto', label: 'Itu/Indaiatuba/Salto' },
];

const targetOptions = [
  { value: 'driver', label: '🚖 Motoristas', desc: 'Locais para relaxar, comer bem ou curtir o day off' },
  { value: 'client', label: '🧳 Passageiros', desc: 'Roteiros e dicas para quem visita ou mora na cidade' },
  { value: 'both', label: '🤝 Ambos', desc: 'Locais úteis ou interessantes para os dois públicos' },
];

// Opções específicas por categoria
const cuisineTypes = ['Brasileira', 'Italiana', 'Japonesa', 'Chinesa', 'Árabe', 'Mexicana', 'Indiana', 'Francesa', 'Alemã', 'Portuguesa', 'Outra'];
const positivePoints = ['Estacionamento', 'Segurança', 'WiFi', 'Banheiro limpo', 'Acessibilidade', 'Pet friendly', 'Vista bonita', 'Ambiente familiar', 'Música ao vivo', 'Delivery'];
const idealForOptions = ['Relaxar', 'Curtir com família', 'Encontro romântico', 'Amigos', 'Trabalho', 'Estudar', 'Fazer exercícios', 'Fotografar'];

// Novas opções para as categorias expandidas
const eventTypes = ['Exposição', 'Show', 'Peça de Teatro', 'Concerto', 'Palestra', 'Workshop', 'Festival', 'Feira', 'Apresentação', 'Outro'];
const musicTypes = ['Sertanejo', 'Rock', 'Pop', 'MPB', 'Eletrônica', 'Jazz', 'Blues', 'Reggae', 'Pagode', 'Samba', 'Outro'];
const storeTypes = ['Shopping Center', 'Feira', 'Outlet', 'Loja Especializada', 'Mercado', 'Galeria', 'Centro Comercial', 'Outro'];
const activityTypes = ['Trilha', 'Cachoeira', 'Rapel', 'Tirolesa', 'Canoagem', 'Mountain Bike', 'Escalada', 'Camping', 'Outro'];
const familyActivities = ['Playground', 'Parque Infantil', 'Teatro Infantil', 'Museu Interativo', 'Zoológico', 'Aquário', 'Cinema', 'Outro'];
const petTypes = ['Cães', 'Gatos', 'Pássaros', 'Hamsters', 'Coelhos', 'Todos os Pets', 'Outro'];

// Exemplos de prompts inteligentes expandidos
const smartPrompts = {
  gastronomia: [
    'restaurante japonês barato na zona sul',
    'café 24h com estacionamento',
    'padaria tradicional no centro',
    'pizzaria italiana na paulista',
    'bar com música ao vivo',
    'churrascaria familiar',
    'sorveteria artesanal',
    'lanchonete econômica para motoristas'
  ],
  'day-off': [
    'parque para relaxar no day off',
    'spa para descansar',
    'café calmo para trabalhar',
    'local para yoga e meditação',
    'massagem relaxante',
    'local para ler um livro',
    'jardim botânico tranquilo',
    'praça para descansar'
  ],
  pousada: [
    'pousada econômica no litoral',
    'hotel com desconto para motoristas',
    'resort luxuoso na serra',
    'hostel no centro histórico',
    'pousada familiar no interior',
    'hotel com estacionamento gratuito',
    'resort com spa e restaurante',
    'pousada pet friendly'
  ],
  turismo: [
    'monumento histórico no centro',
    'igreja centenária',
    'mirante com vista da cidade',
    'castelo medieval',
    'ponto turístico gratuito',
    'atração histórica',
    'vista panorâmica da cidade',
    'monumento famoso'
  ],
  cultura: [
    'museu de arte moderna',
    'galeria de arte contemporânea',
    'teatro com peças interessantes',
    'exposição temporária',
    'show de música clássica',
    'festival cultural',
    'apresentação de dança',
    'workshop de arte'
  ],
  nightlife: [
    'bar com música ao vivo',
    'balada eletrônica',
    'casa noturna sertaneja',
    'pub irlandês',
    'bar de jazz',
    'casa de shows',
    'bar temático',
    'balada rock'
  ],
  roteiros: [
    'passeio de um dia no litoral',
    'roteiro histórico no centro',
    'bate-volta na serra',
    'tour gastronômico',
    'passeio cultural',
    'rota das cachoeiras',
    'tour fotográfico',
    'excursão guiada'
  ],
  compras: [
    'shopping com outlet',
    'feira de artesanato',
    'centro comercial popular',
    'galeria de lojas especiais',
    'mercado municipal',
    'shopping premium',
    'feira de antiguidades',
    'outlet de roupas'
  ],
  aventura: [
    'trilha na serra da mantiqueira',
    'cachoeira próxima a são paulo',
    'parque nacional',
    'rapel em cachoeira',
    'tirolesa na serra',
    'canoagem no rio',
    'mountain bike na serra',
    'camping selvagem'
  ],
  familia: [
    'parque infantil com playground',
    'museu interativo para crianças',
    'teatro infantil',
    'zoológico da cidade',
    'aquário municipal',
    'cinema familiar',
    'parque de diversões',
    'fazendinha para crianças'
  ],
  pet: [
    'restaurante que aceita pets',
    'parque para cães',
    'hotel pet friendly',
    'café com área para pets',
    'pousada que aceita animais',
    'shopping pet friendly',
    'trilha para pets',
    'praça para cães'
  ]
};

function TipTypeSelector({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tipTypeOptions.map((option) => (
        <Card
          key={option.value}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            value === option.value 
              ? 'ring-2 ring-pink-400 bg-pink-50 border-pink-200' 
              : 'hover:border-pink-200'
          }`}
          onClick={() => onChange(option.value)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{option.label.split(' ')[0]}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{option.label.split(' ').slice(1).join(' ')}</h3>
                <p className="text-sm text-gray-500">{option.desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GastronomiaFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Utensils className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Gastronomia</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="gastronomia.priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Faixa de Preço *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (Econômico)</SelectItem>
                  <SelectItem value="$$">$$ (Acessível)</SelectItem>
                  <SelectItem value="$$$">$$$ (Intermediário)</SelectItem>
                  <SelectItem value="$$$$">$$$$ (Premium)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gastronomia.cuisineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Tipo de Culinária *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de culinária" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="gastronomia.openingHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento *
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Seg a Sex 8h-22h, Sáb 10h-18h" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gastronomia.menuUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Link do Cardápio (Opcional)
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}

function DayOffFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Mountain className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Day Off</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dayOff.travelTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo de Deslocamento *
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 30 min de carro" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dayOff.estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Custo Estimado *
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: R$ 150 por pessoa" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="dayOff.positivePoints"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Pontos Positivos *
            </FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {positivePoints.map((point) => (
                <FormField
                  key={point}
                  control={form.control}
                  name="dayOff.positivePoints"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={point}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(point)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, point])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== point
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {point}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dayOff.idealFor"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ideal Para *
            </FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {idealForOptions.map((option) => (
                <FormField
                  key={option}
                  control={form.control}
                  name="dayOff.idealFor"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== option
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dayOff.nearbyFood"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Alimentação Próxima (Opcional)
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Restaurantes a 5 min de caminhada" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dayOff.bonusTip"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Dica Bônus (Opcional)
            </FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Uma dica extra ou experiência pessoal..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}

function PousadaFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Bed className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Pousada/Hotel</h3>
      </div>
      
      <FormField
        control={form.control}
        name="pousada.partnershipType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Tipo de Parceria *
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de parceria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Desconto</SelectItem>
                <SelectItem value="gift">Brinde</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pousada.couponCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Código do Cupom (Opcional)
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: TAXI10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pousada.validUntil"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Válido Até (Opcional)
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pousada.bookingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Link de Reserva (Opcional)
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pousada.whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp (Opcional)
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="(11) 99999-9999" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="pousada.averagePrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preço Médio por Diária *
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: R$ 200 por diária" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}

function TurismoFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Camera className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Turismo</h3>
      </div>
      
      <FormField
        control={form.control}
        name="turismo.bestTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Melhor Horário para Visita *
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Manhã cedo ou fim da tarde" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="turismo.needsTicket"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Precisa de Ingresso?</FormLabel>
                <FormDescription>
                  O local requer compra de ingresso para visitação
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turismo.hasLocalGuide"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Guia Local?</FormLabel>
                <FormDescription>
                  Oferece serviço de guia turístico
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="turismo.ticketUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Link de Compra de Ingresso (Opcional)
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="turismo.accessibilityLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nível de Acessibilidade *
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de acessibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}

function CulturaFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-pink-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Arte & Cultura</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cultura.eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Tipo de Evento *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cultura.entryFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Informação sobre Entrada *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: Gratuito, R$ 20, Meia-entrada"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cultura.schedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento *
            </FormLabel>
            <Input
              {...field}
              placeholder="Ex: Terça a domingo, 10h às 18h"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cultura.website"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site Oficial
            </FormLabel>
            <Input
              {...field}
              placeholder="https://www.exemplo.com"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cultura.hasGuidedTour"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Visita Guiada</FormLabel>
                <FormDescription>
                  Oferece tours guiados para visitantes
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cultura.suitableForChildren"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Adequado para Crianças</FormLabel>
                <FormDescription>
                  Atividades e ambiente apropriados para crianças
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}

function NightlifeFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Moon className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Vida Noturna</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nightlife.musicType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Tipo de Música *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de música" />
                </SelectTrigger>
                <SelectContent>
                  {musicTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nightlife.dressCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Shirt className="h-4 w-4" />
                Código de Vestimenta
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: Casual, Esporte fino, Elegante"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nightlife.ageRestriction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Restrição de Idade
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: 18+, 21+, Livre"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nightlife.coverCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Taxa de Entrada
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: R$ 30, Gratuito, Consumo mínimo"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nightlife.parkingAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Estacionamento</FormLabel>
                <FormDescription>
                  Local oferece estacionamento próprio ou próximo
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nightlife.foodAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Comida</FormLabel>
                <FormDescription>
                  Oferece opções de alimentação
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}

function RoteirosFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Car className="h-5 w-5 text-cyan-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Roteiros & Bate-volta</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="roteiros.duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração do Roteiro *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: 4 horas, 1 dia completo"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roteiros.distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distância *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: 50km de São Paulo, 2h de viagem"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="roteiros.transportation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Meio de Transporte *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: Carro próprio, Ônibus, Trem"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roteiros.bestSeason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Melhor Época *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: Verão, Primavera, Ano todo"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="roteiros.difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Dificuldade *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roteiros.includesGuide"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Inclui Guia</FormLabel>
                <FormDescription>
                  O roteiro inclui guia turístico
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}

function ComprasFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Compras</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="compras.storeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Tipo de Loja *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de loja" />
                </SelectTrigger>
                <SelectContent>
                  {storeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compras.priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Faixa de Preço *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (Econômico)</SelectItem>
                  <SelectItem value="$$">$$ (Acessível)</SelectItem>
                  <SelectItem value="$$$">$$$ (Intermediário)</SelectItem>
                  <SelectItem value="$$$$">$$$$ (Premium)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="compras.specialties"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Especialidades *
            </FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Roupas', 'Calçados', 'Eletrônicos', 'Casa', 'Esportes', 'Livros', 'Presentes', 'Alimentos', 'Artesanato'].map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={field.value?.includes(specialty)}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, specialty]);
                      } else {
                        field.onChange(current.filter((item: string) => item !== specialty));
                      }
                    }}
                  />
                  <label
                    htmlFor={specialty}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {specialty}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="compras.openingHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento *
            </FormLabel>
            <Input
              {...field}
              placeholder="Ex: Segunda a sábado, 10h às 22h"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="compras.parking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Estacionamento</FormLabel>
                <FormDescription>
                  Local oferece estacionamento próprio
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compras.foodCourt"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Praça de Alimentação</FormLabel>
                <FormDescription>
                  Oferece opções de alimentação
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}

function AventuraFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TreePine className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Aventura & Natureza</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="aventura.activityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Tipo de Atividade *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de atividade" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aventura.difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Dificuldade *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="aventura.duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: 2 horas, 1 dia completo"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aventura.bestSeason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Melhor Época *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: Verão, Primavera, Ano todo"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="aventura.equipmentNeeded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Precisa de Equipamento</FormLabel>
                <FormDescription>
                  Atividade requer equipamento específico
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aventura.guideRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Guia Obrigatório</FormLabel>
                <FormDescription>
                  Atividade requer acompanhamento de guia
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="aventura.safetyLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nível de Segurança *
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de segurança" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}

function FamiliaFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-rose-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Com Crianças</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="familia.ageRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Faixa Etária *
              </FormLabel>
              <Input
                {...field}
                placeholder="Ex: 0-3 anos, 4-12 anos, Todas as idades"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="familia.priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Faixa de Preço *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (Econômico)</SelectItem>
                  <SelectItem value="$$">$$ (Acessível)</SelectItem>
                  <SelectItem value="$$$">$$$ (Intermediário)</SelectItem>
                  <SelectItem value="$$$$">$$$$ (Premium)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="familia.activities"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Atividades Disponíveis *
            </FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {familyActivities.map((activity) => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={activity}
                    checked={field.value?.includes(activity)}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, activity]);
                      } else {
                        field.onChange(current.filter((item: string) => item !== activity));
                      }
                    }}
                  />
                  <label
                    htmlFor={activity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {activity}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="familia.hasPlayground"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Playground</FormLabel>
                <FormDescription>
                  Local tem área de playground
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="familia.hasFood"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Comida</FormLabel>
                <FormDescription>
                  Oferece opções de alimentação
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="familia.hasBathroom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Banheiro</FormLabel>
                <FormDescription>
                  Local tem banheiros disponíveis
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="familia.strollerFriendly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Adequado para Carrinho</FormLabel>
                <FormDescription>
                  Local é acessível para carrinhos de bebê
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}

function PetFields({ form }: { form: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Dog className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">Campos Específicos - Pet Friendly</h3>
      </div>
      
      <FormField
        control={form.control}
        name="pet.petTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              Tipos de Pets Aceitos *
            </FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {petTypes.map((petType) => (
                <div key={petType} className="flex items-center space-x-2">
                  <Checkbox
                    id={petType}
                    checked={field.value?.includes(petType)}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, petType]);
                      } else {
                        field.onChange(current.filter((item: string) => item !== petType));
                      }
                    }}
                  />
                  <label
                    htmlFor={petType}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {petType}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pet.hasPetArea"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Área para Pets</FormLabel>
                <FormDescription>
                  Local tem área específica para pets
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pet.hasPetMenu"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Possui Menu para Pets</FormLabel>
                <FormDescription>
                  Oferece comida específica para pets
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pet.requiresLeash"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Requer Coleira</FormLabel>
                <FormDescription>
                  Pets devem estar com coleira
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pet.hasVetNearby"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Veterinário Próximo</FormLabel>
                <FormDescription>
                  Há veterinário nas proximidades
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="pet.petFee"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Taxa para Pets
            </FormLabel>
            <Input
              {...field}
              placeholder="Ex: R$ 15, Gratuito, Consumo mínimo"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}

export function TipFormDialog({ isOpen, setIsOpen, tip, onFinished }: TipFormDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [detectedType, setDetectedType] = useState<string>('');
    
    const form = useForm<CityGuideFormValues>({
        resolver: zodResolver(cityGuideFormSchema),
        defaultValues: tip ? {
            ...tip,
            tipType: tip.tipType || 'outro',
            region: tip.region as any,
            gastronomia: tip.gastronomia,
            dayOff: tip.dayOff,
            pousada: tip.pousada,
            turismo: tip.turismo,
            cultura: tip.cultura,
            nightlife: tip.nightlife,
            roteiros: tip.roteiros,
            compras: tip.compras,
            aventura: tip.aventura,
            familia: tip.familia,
            pet: tip.pet,
            imageUrls: Array.isArray(tip.imageUrls) ? tip.imageUrls : [],
        } : {
            title: '',
            description: '',
            location: '',
            region: 'centro' as const,
            imageUrls: [],
            mapUrl: '',
            target: 'both',
            tags: [],
            comment: '',
            tipType: 'outro',
            gastronomia: undefined,
            dayOff: undefined,
            pousada: undefined,
            turismo: undefined,
            cultura: undefined,
            nightlife: undefined,
            roteiros: undefined,
            compras: undefined,
            aventura: undefined,
            familia: undefined,
            pet: undefined,
            contributorName: '',
            status: 'draft',
        }
    });
    
    const tipType = form.watch('tipType');
    const target = form.watch('target') || 'both';
    const imageUrls = form.watch('imageUrls');

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Digite um prompt para gerar o conteúdo.' });
            return;
        }

        if (!target) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione o público-alvo primeiro.' });
            return;
        }

        setIsGeneratingAI(true);
        try {
            const result = await generateTipWithAI({
                topic: aiPrompt,
                target: target as 'driver' | 'client' | 'both',
            });

            if (result.success && result.data) {
                // Preencher campos básicos
                form.setValue('title', result.data.title);
                form.setValue('description', result.data.description);
                form.setValue('tags', result.data.tags);
                
                // Detectar e definir tipo automaticamente
                if (result.data.tipType && result.data.tipType !== 'outro') {
                    form.setValue('tipType', result.data.tipType);
                    setDetectedType(result.data.tipType);
                    
                    // Preencher campos específicos baseado no tipo detectado
                    if (result.data.specificFields) {
                        if (result.data.tipType === 'gastronomia' && result.data.specificFields.gastronomia) {
                            form.setValue('gastronomia', result.data.specificFields.gastronomia);
                        } else if (result.data.tipType === 'day-off' && result.data.specificFields.dayOff) {
                            form.setValue('dayOff', result.data.specificFields.dayOff);
                        } else if (result.data.tipType === 'pousada' && result.data.specificFields.pousada) {
                            form.setValue('pousada', result.data.specificFields.pousada);
                        } else if (result.data.tipType === 'turismo' && result.data.specificFields.turismo) {
                            form.setValue('turismo', result.data.specificFields.turismo);
                        } else if (result.data.tipType === 'cultura' && result.data.specificFields.cultura) {
                            form.setValue('cultura', result.data.specificFields.cultura);
                        } else if (result.data.tipType === 'nightlife' && result.data.specificFields.nightlife) {
                            form.setValue('nightlife', result.data.specificFields.nightlife);
                        } else if (result.data.tipType === 'roteiros' && result.data.specificFields.roteiros) {
                            form.setValue('roteiros', result.data.specificFields.roteiros);
                        } else if (result.data.tipType === 'compras' && result.data.specificFields.compras) {
                            form.setValue('compras', result.data.specificFields.compras);
                        } else if (result.data.tipType === 'aventura' && result.data.specificFields.aventura) {
                            form.setValue('aventura', result.data.specificFields.aventura);
                        } else if (result.data.tipType === 'familia' && result.data.specificFields.familia) {
                            form.setValue('familia', result.data.specificFields.familia);
                        } else if (result.data.tipType === 'pet' && result.data.specificFields.pet) {
                            form.setValue('pet', result.data.specificFields.pet);
                        }
                    }
                }
                
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
                toast({ 
                    title: 'Conteúdo gerado com IA!', 
                    description: `Tipo detectado: ${result.data.tipType}. Campos específicos preenchidos automaticamente.` 
                });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro ao gerar dica', description: (e as Error).message });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSmartPrompt = (prompt: string) => {
        setAiPrompt(prompt);
    };

    const onSubmit = async (values: CityGuideFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createOrUpdateTip(values);
            if (result.success && result.tip) {
                onFinished(result.tip);
                toast({ title: 'Dica salva!', description: 'A dica foi salva com sucesso.' });
            } else {
                toast({ variant: 'destructive', title: 'Erro ao salvar', description: result.error });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: (e as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Sparkles className="h-6 w-6 text-pink-500" />
                        {tip ? 'Editar Dica' : 'Criar Nova Dica'}
                    </DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para criar uma dica completa e relevante.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Seção de IA Inteligente */}
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    <Brain className="h-5 w-5" />
                                    IA Inteligente - Detecção Automática
                                </CardTitle>
                                <CardDescription>
                                    Descreva o lugar e a IA detectará automaticamente o tipo e preencherá os campos específicos
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Público-alvo *</Label>
                                        <Select value={target || 'both'} onValueChange={(value) => form.setValue('target', value as any)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Selecione o público" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {targetOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <div>
                                                            <div className="font-semibold">{opt.label}</div>
                                                            <div className="text-sm text-gray-500">{opt.desc}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Descrição do lugar</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder="Ex: restaurante japonês barato na zona sul"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleGenerateAI}
                                                disabled={isGeneratingAI || !target}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                            >
                                                {isGeneratingAI ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Brain className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Prompts inteligentes por categoria */}
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Exemplos de prompts inteligentes:</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {Object.entries(smartPrompts).map(([type, prompts]) => (
                                            <div key={type} className="space-y-1">
                                                <Label className="text-xs font-medium text-gray-600 capitalize">{type.replace('-', ' ')}</Label>
                                                <div className="space-y-1">
                                                    {prompts.slice(0, 2).map((prompt, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => handleSmartPrompt(prompt)}
                                                            className="block w-full text-left text-xs p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                                        >
                                                            {prompt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {detectedType && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">Tipo detectado: {tipTypeOptions.find(t => t.value === detectedType)?.label}</span>
                                        </div>
                                        <p className="text-sm text-green-700 mt-1">
                                            Campos específicos foram preenchidos automaticamente!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                                <TabsTrigger value="specific">Campos Específicos</TabsTrigger>
                                <TabsTrigger value="media">Mídia & Links</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-6">
                                {/* Tipo de Dica */}
                                <FormField
                                    control={form.control}
                                    name="tipType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold">Tipo de Dica *</FormLabel>
                                            <FormControl>
                                                <TipTypeSelector value={field.value || 'outro'} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Título */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título da Dica *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ex: Feijoada do Bolinha" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Descrição */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição *</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Descreva o local, o que o torna especial..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Localização */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localização *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Endereço completo, bairro, cidade" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Região */}
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Região *</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a região" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {regionOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Opinião sincera */}
                                <FormField
                                    control={form.control}
                                    name="comment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opinião Sincera (Opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Compartilhe uma experiência pessoal ou dica extra..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Colaborador */}
                                <FormField
                                    control={form.control}
                                    name="contributorName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Indicado por (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nome do colaborador/motorista" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="specific" className="space-y-6">
                                <AnimatePresence mode="wait">
                                    {tipType === 'gastronomia' && <GastronomiaFields form={form} />}
                                    {tipType === 'day-off' && <DayOffFields form={form} />}
                                    {tipType === 'pousada' && <PousadaFields form={form} />}
                                    {tipType === 'turismo' && <TurismoFields form={form} />}
                                    {tipType === 'cultura' && <CulturaFields form={form} />}
                                    {tipType === 'nightlife' && <NightlifeFields form={form} />}
                                    {tipType === 'roteiros' && <RoteirosFields form={form} />}
                                    {tipType === 'compras' && <ComprasFields form={form} />}
                                    {tipType === 'aventura' && <AventuraFields form={form} />}
                                    {tipType === 'familia' && <FamiliaFields form={form} />}
                                    {tipType === 'pet' && <PetFields form={form} />}
                                    {tipType === 'outro' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Para outros tipos de dica, use os campos básicos.</p>
                                        </motion.div>
                                    )}
                                    {!tipType && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Selecione um tipo de dica para ver os campos específicos.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6">
                                {/* Imagem */}
                                <FormField
                                    control={form.control}
                                    name="imageUrls"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imagem da Dica</FormLabel>
                                            <FormControl>
                                                <FirebaseImageUpload 
                                                    value={field.value[0] || ''} 
                                                    onChange={url => field.onChange(url ? [url] : [])} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* URL do Mapa */}
                                <FormField
                                    control={form.control}
                                    name="mapUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL do Mapa (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://maps.app.goo.gl/..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Preview da imagem */}
                                {imageUrls && imageUrls[0] && (
                                    <div className="mt-4">
                                        <Label>Preview da Imagem</Label>
                                        <div className="mt-2">
                                            <Image 
                                                src={imageUrls[0]} 
                                                alt="Preview" 
                                                width={300} 
                                                height={200} 
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tip ? 'Atualizar Dica' : 'Criar Dica'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
