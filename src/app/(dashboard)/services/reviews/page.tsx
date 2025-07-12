
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import { getReviewsForUser } from '@/app/actions/review-actions';
import { type Review } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star } from 'lucide-react';

export default function ProviderReviewsPage() {
    const { user, loading: authLoading } = useAuthProtection({ requiredRoles: ['provider'] });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getReviewsForUser(user.uid)
                .then(setReviews)
                .finally(() => setPageLoading(false));
        } else if (!authLoading) {
            setPageLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || pageLoading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Minhas Avaliações</h1>
                <p className="text-muted-foreground">Veja o que os clientes estão dizendo sobre seus serviços.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Histórico de Avaliações</CardTitle>
                    <CardDescription>Todas as avaliações que você recebeu, da mais recente para a mais antiga.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="flex items-start gap-4 border-b pb-6 last:border-b-0 last:pb-0">
                                <Avatar>
                                    <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{review.reviewerName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(review.createdAt as string), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                        <StarRating rating={review.rating} readOnly />
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground italic">"{review.comment}"</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center text-muted-foreground">
                            <Star className="mx-auto h-12 w-12 mb-4"/>
                            <p className="font-semibold">Nenhuma avaliação ainda</p>
                            <p>Continue oferecendo um bom serviço para receber suas primeiras avaliações.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
