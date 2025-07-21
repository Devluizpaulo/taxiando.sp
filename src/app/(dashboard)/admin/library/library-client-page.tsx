
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { type LibraryBook } from '@/lib/types';
import { deleteBook } from '@/app/actions/library-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LibraryClientPage({ initialBooks }: { initialBooks: LibraryBook[] }) {
    const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
    const { toast } = useToast();

    const handleDelete = async (bookId: string, bookTitle: string) => {
        const result = await deleteBook(bookId);
        if (result.success) {
            toast({ title: 'Livro Removido!', description: `O livro "${bookTitle}" foi removido da biblioteca.` });
            setBooks(prev => prev.filter(b => b.id !== bookId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento da Biblioteca</h1>
                <p className="text-muted-foreground">Adicione, edite e organize os livros disponíveis para os usuários.</p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Livros</CardTitle>
                        <CardDescription>Visualize e gerencie todos os livros da biblioteca.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/library/create"><PlusCircle /> Adicionar Novo Livro</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Autor</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Adicionado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {books.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Nenhum livro encontrado.</TableCell>
                                </TableRow>
                            ) : (
                                books.map(book => (
                                    <TableRow key={book.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Image src={book.coverImageUrl} alt={book.title} width={40} height={50} className="rounded-md object-cover" />
                                            <span>{book.title}</span>
                                        </TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{book.category}</TableCell>
                                        <TableCell>{format(new Date(book.createdAt as string), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/library/${book.id}/edit`}><Edit className="mr-2 h-4 w-4"/> Editar</Link>
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:bg-destructive/90" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4"/> Remover
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>Esta ação removerá o livro permanentemente.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(book.id, book.title)}>Sim, remover</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
