
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: number;
  className?: string;
  readOnly?: boolean;
}

export function StarRating({ rating, setRating, size = 20, className, readOnly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleSetRating = (rate: number) => {
    if (setRating && !readOnly) {
      setRating(rate);
    }
  };

  const handleMouseEnter = (rate: number) => {
    if (!readOnly) {
      setHoverRating(rate);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={starValue}
            size={size}
            className={cn(
              "transition-colors",
              !readOnly && "cursor-pointer",
              (hoverRating || rating) >= starValue ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
            )}
            onClick={() => handleSetRating(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
}
