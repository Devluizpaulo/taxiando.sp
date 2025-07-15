'use client';

import { useState, useEffect } from 'react';
import { type LibraryBook, type UserBookProgress } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { getUserBookProgress } from '@/app/actions/library-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function BookCard({ book, progress }: { book: LibraryBook, progress?: UserBookProgress | null }) {
    const progressPercentage = progress ? (progress.currentPage / progress.totalPages) * 100 : 0;
    
    return (
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
            <Link href={`/library/${book.id}/read`} className="flex-1 flex flex-col">
                <CardHeader className="p-0">
                    <Image src={book.coverImageUrl} alt={book.title} width={300} height={450} className="w-full object-cover aspect-[2/3]" />
                </CardHeader>
                <CardContent className="p-4 flex-1">
                    <CardTitle className="font-headline text-lg line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>por {book.author}</CardDescription>
                </CardContent>
            </Link>
            <CardFooter className="p-4 flex flex-col items-start gap-2 bg-muted/50">
                {progress && progressPercentage > 0 && (
                     <div className="w-full">
                        <Progress value={progressPercentage} className="h-2"/>
                        <p className="text-xs text-muted-foreground mt-1">{Math.floor(progressPercentage)}% concluído</p>
                    </div>
                )}
                <Button asChild className="w-full">
                    <Link href={`/library/${book.id}/read`}>
                        <BookOpen className="mr-2" />
                        {progress && progress.currentPage > 1 ? 'Continuar Leitura' : 'Começar a Ler'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export function LibraryClientPage({ initialBooks }: { initialBooks: LibraryBook[] }) {
    const { user } = useAuth();
    const [progressMap, setProgressMap] = useState<Record<string, UserBookProgress | null>>({});
    const [loadingProgress, setLoadingProgress] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchAllProgress = async () => {
                setLoadingProgress(true);
                const progressPromises = initialBooks.map(book =>
                    getUserBookProgress(user.uid, book.id).then(progress => ({ bookId: book.id, progress }))
                );
                const results = await Promise.all(progressPromises);
                const newProgressMap = results.reduce((acc, { bookId, progress }) => {
                    acc[bookId] = progress as UserBookProgress | null;
                    return acc;
                }, {} as Record<string, UserBookProgress | null>);
                setProgressMap(newProgressMap);
                setLoadingProgress(false);
            };
            fetchAllProgress();
        } else {
            setLoadingProgress(false);
        }
    }, [user, initialBooks]);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Biblioteca Digital</h1>
                <p className="text-muted-foreground">Expanda seus conhecimentos com nossa coleção de livros e materiais.</p>
            </div>
            {loadingProgress ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {initialBooks.map(book => (
                        <BookCard key={book.id} book={book} progress={progressMap[book.id]} />
                    ))}
                     {initialBooks.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground py-16">
                            <BookOpen className="mx-auto h-12 w-12" />
                            <p className="mt-4 text-lg font-semibold">A biblioteca está vazia.</p>
                            <p>Novos livros e materiais serão adicionados em breve.</p>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
}
