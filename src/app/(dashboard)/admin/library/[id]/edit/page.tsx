
'use client';

import { useEffect, useState } from 'react';
import { BookForm } from '../../book-form';
import { LoadingScreen } from '@/components/loading-screen';
import { type LibraryBook } from '@/lib/types';
import { getBookById } from '@/app/actions/library-actions';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookFormSchema, type BookFormValues } from '@/lib/library-schemas';

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [book, setBook] = useState<LibraryBook | null>(null);

    const form = useForm<BookFormValues>({
        resolver: zodResolver(bookFormSchema),
    });

    useEffect(() => {
        setIsLoading(true);
        const fetchBook = async () => {
            const fetchedBook = await getBookById(id);
            if (fetchedBook) {
                setBook(fetchedBook);
                form.reset(fetchedBook);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Livro não encontrado.' });
                router.push('/admin/library');
            }
            setIsLoading(false);
        };
        fetchBook();
    }, [id]);

    if (isLoading) {
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
