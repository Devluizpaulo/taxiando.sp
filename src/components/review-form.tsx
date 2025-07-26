
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { createReview } from '@/app/actions/review-actions';
import { Loader2 } from 'lucide-react';
import { type UserProfile } from '@/lib/types';

const reviewFormSchema = z.object({
  rating: z.number().min(1, "A avaliação é obrigatória."),
  comment: z.string().min(10, "O comentário deve ter pelo menos 10 caracteres.").max(500, "Limite de 500 caracteres."),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  reviewer: UserProfile;
  reviewee: { id: string, name: string, role: UserProfile['role'] };
  related?: { id: string, name: string };
  onReviewSubmitted: () => void;
}

export function ReviewForm({ reviewer, reviewee, related, onReviewSubmitted }: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createReview({
        ...values,
        reviewerId: reviewer.uid,
        reviewerName: reviewer.name || reviewer.nomeFantasia || 'Anônimo',
        reviewerRole: reviewer.role,
        revieweeId: reviewee.id,
        revieweeRole: reviewee.role,
        relatedTo: related?.id,
        relatedToName: related?.name,
      });

      if (result.success) {
        toast({ title: "Avaliação Enviada!", description: "Sua avaliação foi enviada para moderação. Obrigado!" });
        onReviewSubmitted();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Enviar', description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sua Avaliação para {reviewee.name}</FormLabel>
              <FormControl>
                <StarRating rating={field.value} onRatingChange={field.onChange} size="lg" interactive />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentário</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descreva sua experiência..." rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
          Enviar Avaliação
        </Button>
      </form>
    </Form>
  );
}
