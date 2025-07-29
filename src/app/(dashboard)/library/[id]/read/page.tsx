'use client';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { pdfjs, Document, Page } from 'react-pdf';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getBookById, getUserBookProgress, updateUserBookProgress } from '@/app/actions/library-actions';
import { type LibraryBook } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import React, { use } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ReadBookPage({ params }: { params: Promise<{ id: string }>}) {
    const { id } = use(params);
    const { user } = useAuth();
    const { toast } = useToast();
    const [book, setBook] = useState<LibraryBook | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageInput, setPageInput] = useState('1');

    const debouncedPageNumber = useDebounce(pageNumber, 1000); // Debounce for 1 second

    useEffect(() => {
        const fetchBookAndProgress = async () => {
            setLoading(true);
            const bookData = await getBookById(id);
            if (bookData) {
                setBook(bookData);
                if (user) {
                    const progress = await getUserBookProgress(user.uid, id);
                    if (progress && progress.currentPage) {
                        setPageNumber(progress.currentPage);
                        setPageInput(progress.currentPage.toString());
                    }
                }
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Livro não encontrado.' });
            }
            // setLoading is set to false in onDocumentLoadSuccess
        };
        fetchBookAndProgress();
    }, [id, user, toast]);

    const saveProgress = useCallback(async (page: number, totalPages: number) => {
        if (user && book) {
            await updateUserBookProgress({
                userId: user.uid,
                bookId: book.id,
                currentPage: page,
                totalPages: totalPages,
            });
        }
    }, [user, book]);
    
    useEffect(() => {
        if (debouncedPageNumber && numPages && user) {
            saveProgress(debouncedPageNumber, numPages);
        }
    }, [debouncedPageNumber, numPages, saveProgress, user]);

    function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
        setNumPages(nextNumPages);
        setLoading(false);
    }
    
    function changePage(offset: number) {
        const newPage = pageNumber + offset;
        if (newPage >= 1 && newPage <= (numPages || 0)) {
            setPageNumber(newPage);
            setPageInput(newPage.toString());
        }
    }
    
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    }

    const handlePageInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newPage = parseInt(pageInput, 10);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= (numPages || 0)) {
            setPageNumber(newPage);
        } else {
            setPageInput(pageNumber.toString());
        }
    }

    if (!book && !loading) {
        return <div className="p-4">Livro não encontrado.</div>;
    }

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="flex-shrink-0 bg-background border-b shadow-sm z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                         <h1 className="font-semibold truncate">{book?.title || 'Carregando...'}</h1>
                         <p className="text-sm text-muted-foreground truncate">por {book?.author || '...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setScale(s => s - 0.1)} disabled={scale <= 0.5}><ZoomOut/></Button>
                        <Button variant="outline" size="icon" onClick={() => setScale(s => s + 0.1)} disabled={scale >= 2.5}><ZoomIn/></Button>
                        <Button variant="outline" size="icon" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw/></Button>
                    </div>
                </div>
            </header>
             <main className="flex-1 overflow-auto p-4 flex flex-col items-center">
                 {book && (
                     <Document file={book.pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<LoadingScreen />}>
                         <Page pageNumber={pageNumber} scale={scale} rotate={rotation} />
                     </Document>
                 )}
                 {loading && <LoadingScreen />}
            </main>
             <footer className="flex-shrink-0 bg-background border-t shadow-sm z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => changePage(-1)} disabled={pageNumber <= 1}><ChevronLeft/></Button>
                     <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                        <Input type="number" value={pageInput} onChange={handlePageInputChange} className="w-16 text-center h-9" />
                        <span className="text-muted-foreground">de {numPages || '...'}</span>
                    </form>
                    <Button variant="outline" size="icon" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 0)}><ChevronRight/></Button>
                </div>
            </footer>
        </div>
    );
}
