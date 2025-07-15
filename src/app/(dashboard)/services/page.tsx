
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Eye, Star, Wrench, Tag, DollarSign, FilePen, ChevronRight, Loader2, Trash2, Power, PowerOff, Archive } from 'lucide-react';
import { LoadingScreen } from '@/components/loading-screen';
import { useToast } from '@/hooks/use-toast';
import { getServicesByProvider, updateServiceStatus, deleteService } from '@/app/actions/service-actions';
import { type ServiceListing } from '@/lib/types';
import { StarRating } from '@/components/ui/star-rating';


export default function ServicesPage() {
    const { user, userProfile, loading: authLoading } = useAuthProtection({ requiredRoles: ['provider', 'admin'] });
    const { toast } = useToast();
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const fetchServices = async () => {
                setPageLoading(true);
                const userServices = await getServicesByProvider(user.uid);
                setServices(userServices);
                setPageLoading(false);
            };
            fetchServices();
        } else if (!authLoading) {
            setPageLoading(false);
        }
    }, [user, authLoading]);

    const handleStatusToggle = async (service: ServiceListing) => {
        setUpdatingId(service.id);
        const newStatus = service.status === 'Ativo' ? 'Pausado' : 'Ativo';
        const result = await updateServiceStatus(service.id, newStatus);
        if (result.success) {
            toast({
                title: 'Status do Anúncio Atualizado!',
                description: `O anúncio "${service.title}" agora está ${newStatus}.`,
            });
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: newStatus } : s));
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
        setUpdatingId(null);
    };

    const handleDeleteService = async (serviceId: string, serviceTitle: string) => {
        const result = await deleteService(serviceId);
        if (result.success) {
            toast({ title: 'Anúncio Removido!', description: `O anúncio "${serviceTitle}" foi removido com sucesso.` });
            setServices(prev => prev.filter(s => s.id !== serviceId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    const activeServicesCount = services.filter(s => s.status === 'Ativo').length;
    const pausedServicesCount = services.filter(s => s.status === 'Pausado' || s.status === 'Rejeitado').length;
    const totalServicesCount = services.length;


    if (authLoading || pageLoading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel do Prestador</h1>
                <p className="text-muted-foreground">Gerencie seus serviços, anúncios e visualize seu desempenho.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Anúncios</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalServicesCount}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
                        <Power className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{activeServicesCount}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Anúncios Pausados</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{pausedServicesCount}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas ao Perfil</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{userProfile?.profileViewCount || 0}</div></CardContent>
                </Card>
            </div>

             <Card className="bg-accent/30 border-accent/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Complete o Perfil da sua Empresa</CardTitle>
                        <CardDescription>Um perfil completo atrai mais clientes. Adicione sua descrição, endereço e redes sociais.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/services/profile">
                            Completar Perfil <ChevronRight />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Meus Anúncios</CardTitle>
                        <CardDescription>Adicione, edite e gerencie a visibilidade dos seus serviços na plataforma.</CardDescription>
                    </div>
                    <Button asChild><Link href="/services/create"><PlusCircle /> Criar Novo Anúncio</Link></Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serviço</TableHead>
                                <TableHead><Tag className="inline-block h-4 w-4 mr-1"/>Categoria</TableHead>
                                <TableHead><DollarSign className="inline-block h-4 w-4 mr-1"/>Preço</TableHead>
                                <TableHead>Visibilidade</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum anúncio criado.</TableCell></TableRow>
                            ) : (
                                services.map(service => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.title}</TableCell>
                                    <TableCell>{service.category}</TableCell>
                                    <TableCell>{service.price}</TableCell>
                                    <TableCell>
                                        <Badge variant={service.status === 'Ativo' ? 'default' : (service.status === 'Pausado' ? 'secondary' : 'destructive')}>
                                            {service.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/services/${service.id}/edit`}><FilePen /> Editar</Link>
                                                    </DropdownMenuItem>
                                                    
                                                     <DropdownMenuItem disabled={updatingId === service.id || service.status === 'Pendente' || service.status === 'Rejeitado'} onClick={() => handleStatusToggle(service)}>
                                                        {updatingId === service.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (service.status === 'Ativo' ? <><PowerOff/>Pausar</> : <><Power/>Ativar</>)}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 /> Remover
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                    <AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá remover permanentemente o anúncio "{service.title}".</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteService(service.id, service.title)}>Sim, remover</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
