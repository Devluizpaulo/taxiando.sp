
'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      const newRating = starIndex + 1;
      setCurrentRating(newRating);
      onRatingChange(newRating);
    }
  };

  const displayRating = interactive ? (hoverRating || currentRating) : rating;
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              'transition-colors duration-200',
              {
                'fill-yellow-400 text-yellow-400': index < displayRating,
                'fill-gray-200 text-gray-200': index >= displayRating,
                'cursor-pointer hover:scale-110': interactive
              }
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
        );
}

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string, reviewerName: string, reviewerEmail?: string) => void;
  isSubmitting?: boolean;
}

export function ReviewForm({ onSubmit, isSubmitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação com estrelas.');
      return;
    }
    
    if (!reviewerName.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    
    // Validação de email se fornecido
    if (reviewerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail.trim())) {
      alert('Por favor, informe um email válido.');
      return;
    }
    
    onSubmit(rating, comment, reviewerName.trim(), reviewerEmail.trim() || undefined);
    setRating(0);
    setComment('');
    setReviewerName('');
    setReviewerEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cabeçalho informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Avaliação para Motoristas</p>
            <p>Você pode avaliar sem fazer cadastro. Apenas informe seu nome (obrigatório) e email (opcional).</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua Avaliação
        </label>
        <StarRating
          rating={rating}
          interactive={true}
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 mb-2">
          Seu Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="reviewerName"
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Digite seu nome"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Seu Email (opcional)
        </label>
        <input
          id="reviewerEmail"
          type="email"
          value={reviewerEmail}
          onChange={(e) => setReviewerEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Seu email não será exibido publicamente
        </p>
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comentário (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || !reviewerName.trim() || isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Enviando...
          </div>
        ) : (
          'Enviar Avaliação'
        )}
      </Button>
    </form>
  );
}

interface ReviewListProps {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail?: string;
    reviewerRole: 'driver' | 'client' | 'admin';
    createdAt: string;
    isVerified?: boolean;
    isAnonymous?: boolean;
  }>;
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhuma avaliação ainda</p>
        <p className="text-sm">Seja o primeiro a avaliar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                     <div className="flex items-start justify-between mb-2">
             <div className="flex items-center gap-2">
               <div className="flex items-center gap-1">
                 <span className="font-medium text-gray-900">{review.reviewerName}</span>
                 {review.isVerified && (
                   <span className="text-blue-500 text-xs">✓ Verificado</span>
                 )}
                 {review.isAnonymous && (
                   <span className="text-gray-500 text-xs">• Anônimo</span>
                 )}
               </div>
               <Badge variant="outline" className="text-xs">
                 {review.reviewerRole === 'driver' ? 'Motorista' : 
                  review.reviewerRole === 'client' ? 'Cliente' : 'Admin'}
               </Badge>
             </div>
             <span className="text-xs text-gray-500">
               {new Date(review.createdAt).toLocaleDateString('pt-BR')}
             </span>
           </div>
          
          <StarRating rating={review.rating} size="sm" className="mb-2" />
          
          {review.comment && (
            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
