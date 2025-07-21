

import Link from 'next/link';
import { getAllBlogPosts } from '@/app/actions/blog-actions';
import { type BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toDate } from '@/lib/date-utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, FilePen, Trash2 } from 'lucide-react';
import { DeletePostButton } from './delete-post-button';


export default async function AdminBlogPage() {
    const posts = await getAllBlogPosts();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Blog</h1>
                <p className="text-muted-foreground">Crie e gerencie as notícias e artigos da plataforma.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Posts</CardTitle>
                        <CardDescription>Visualize e gerencie todos os posts do blog.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/blog/create"><PlusCircle /> Criar Novo Post</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Nenhum post encontrado. Que tal criar o primeiro?
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map(post => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{post.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                                                {post.status === 'Published' ? 'Publicado' : 'Rascunho'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(toDate(post.createdAt) ?? new Date(), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/blog/${post.id}/edit`}><FilePen className="mr-2"/> Editar</Link>
                                                    </DropdownMenuItem>
                                                    <DeletePostButton postId={post.id} postTitle={post.title} />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

