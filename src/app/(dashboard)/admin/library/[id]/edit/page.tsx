
'use client';

import { useEffect, useState } from 'react';
import { BookForm } from '../../book-form';
import { LoadingScreen } from '@/components/loading-screen';
import { type LibraryBook } from '@/lib/types';
import { getBookById } from '@/app/actions/library-actions';

export default function EditBookPage({ params }: { params: { id: string } }) {
    const [book, setBook] = useState<LibraryBook | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            const fetchedBook = await getBookById(params.id);
            setBook(fetchedBook);
            setLoading(false);
        };
        fetchBook();
    }, [params.id]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!book) {
        return (
             <div className="flex flex-col gap-8 items-center justify-center h-full">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Livro não encontrado</h1>
                <p className="text-muted-foreground">O livro que você está tentando editar não existe ou foi removido.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Livro</h1>
                <p className="text-muted-foreground">Ajuste os detalhes do livro.</p>
            </div>
            <BookForm book={book} />
        </div>
    );
}
