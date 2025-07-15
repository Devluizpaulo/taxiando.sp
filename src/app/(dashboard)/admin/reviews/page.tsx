

'use client';

import { useState, useEffect } from 'react';
import { getPendingReviews, updateReviewStatus } from '@/app/actions/review-actions';
import { useToast } from '@/hooks/use-toast';
import { type Review } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toDate } from '@/lib/date-utils';

import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ThumbsDown, Loader2 } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchReviews = async () => {
            const data = await getPendingReviews();
            setReviews(data);
            setLoading(false);
        };
        fetchReviews();
    }, []);

    const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
        setUpdatingId(reviewId);
        const result = await updateReviewStatus(reviewId, newStatus);
        
        if (result.success) {
            toast({ title: 'Status da Avaliação Atualizado!', description: `A avaliação foi marcada como ${newStatus === 'approved' ? 'Aprovada' : 'Rejeitada'}.` });
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao atualizar', description: result.error });
        }
        setUpdatingId(null);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Moderação de Avaliações</h1>
                <p className="text-muted-foreground">Aprove ou rejeite as avaliações enviadas pelos usuários.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Avaliações Pendentes</CardTitle>
                    <CardDescription>Abaixo estão todas as avaliações que aguardam sua moderação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                            <Check className="h-12 w-12 mb-4"/>
                            <p className="font-semibold">Tudo em ordem!</p>
                            <p>Não há avaliações pendentes no momento.</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <Card key={review.id} className="p-4 flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} readOnly />
                                        <Badge variant="secondary">{review.rating.toFixed(1)}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                                    <p className="text-xs text-muted-foreground pt-2 border-t">
                                        De: <span className="font-semibold">{review.reviewerName}</span> ({review.reviewerRole})
                                        <br />
                                        Para: <span className="font-semibold">{review.revieweeId}</span> ({review.revieweeRole})
                                        <br/>
                                        Enviada {formatDistanceToNow(toDate(review.createdAt) ?? new Date(), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    {updatingId === review.id ? (
                                        <Button disabled variant="outline" size="sm"><Loader2 className="animate-spin"/> Processando...</Button>
                                    ) : (
                                        <>
                                            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(review.id, 'rejected')}><ThumbsDown /> Rejeitar</Button>
                                            <Button variant="default" size="sm" onClick={() => handleUpdateStatus(review.id, 'approved')}><Check /> Aprovar</Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
