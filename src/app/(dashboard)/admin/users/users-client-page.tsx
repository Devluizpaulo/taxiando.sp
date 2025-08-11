
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Loader2, UserCheck, Search, Trash2, FilePen, Building, Car, Wrench, Shield, KeyRound, Star } from "lucide-react";
import { updateUserProfileStatus, deleteUserByAdmin } from '@/app/actions/admin-actions';
import type { AdminUser } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const getProfileStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'approved': return 'default';
        case 'pending_review': return 'secondary';
        case 'rejected': return 'destructive';
        default: return 'outline';
    }
};

const getRoleVariant = (role: string) => {
    switch (role) {
        case 'driver': return 'default';
        case 'fleet': return 'secondary';
        case 'provider': return 'outline';
        case 'admin': return 'destructive';
        default: return 'default';
    }
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'driver': return <Car />;
        case 'fleet': return <Building />;
        case 'provider': return <Wrench />;
        case 'admin': return <Shield />;
        default: return <Users />;
    }
};

export function UsersClientPage({ initialUsers }: { initialUsers: AdminUser[] }) {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [updatingUserStatus, setUpdatingUserStatus] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDeleting, setIsDeleting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

    const activeTab = searchParams.get('tab') || 'drivers';

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const nameMatch = user.name?.toLowerCase().includes(searchLower) || user.nomeFantasia?.toLowerCase().includes(searchLower);
            const emailMatch = user.email.toLowerCase().includes(searchLower);
            
            let statusMatch = statusFilter === 'all';
            if (statusFilter === 'approved') statusMatch = user.profileStatus === 'approved';
            if (statusFilter === 'pending') statusMatch = user.profileStatus === 'pending_review';
            if (statusFilter === 'rejected') statusMatch = user.profileStatus === 'rejected';
            if (statusFilter === 'incomplete') statusMatch = user.profileStatus === 'incomplete' || !user.profileStatus;

            return (nameMatch || emailMatch) && statusMatch;
        });
    }, [users, searchTerm, statusFilter]);
    
    const handleUserStatusUpdate = async (userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') => {
        setUpdatingUserStatus(userId);
        try {
            const result = await updateUserProfileStatus(userId, newStatus);
            if (result.success) {
                toast({ title: 'Sucesso', description: 'Status do usuário atualizado.' });
                setUsers(prev => prev.map(u => u.uid === userId ? { ...u, profileStatus: result.dbStatus || 'incomplete' } : u));
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error });
            }
        } finally {
            setUpdatingUserStatus(null);
        }
    }

    const confirmUserDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        const result = await deleteUserByAdmin(userToDelete.uid);
        if (result.success) {
            toast({ title: 'Usuário Removido', description: `O usuário ${userToDelete.name || userToDelete.email} foi removido.` });
            setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
        setIsDeleting(false);
        setUserToDelete(null);
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
                <p className="text-muted-foreground">Gerencie todos os motoristas, frotas e prestadores de serviço.</p>
            </div>
            
            <Card>
                 <CardHeader>
                    <CardTitle>Filtros e Visualização</CardTitle>
                     <div className="mt-4 flex flex-col items-center gap-4 md:flex-row">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                         <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="approved">Aprovado</SelectItem>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="rejected">Rejeitado</SelectItem>
                                <SelectItem value="incomplete">Incompleto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue={activeTab}>
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                            <TabsTrigger value="drivers"><Car className="mr-2"/>Motoristas</TabsTrigger>
                            <TabsTrigger value="fleets"><Building className="mr-2"/>Frotas</TabsTrigger>
                            <TabsTrigger value="providers"><Wrench className="mr-2"/>Prestadores</TabsTrigger>
                            <TabsTrigger value="admins"><Shield className="mr-2"/>Admins</TabsTrigger>
                        </TabsList>

                        <TabsContent value="drivers" className="mt-4 space-y-4">
                            {filteredUsers.filter(u => u.role === 'driver').length === 0 ? <EmptyState /> : 
                                filteredUsers.filter(u => u.role === 'driver').map(user => (
                                    <UserCard key={user.uid} user={user} updatingUserStatus={updatingUserStatus} handleUserStatusUpdate={handleUserStatusUpdate} setUserToDelete={setUserToDelete} />
                                ))
                            }
                        </TabsContent>
                        <TabsContent value="fleets" className="mt-4 space-y-4">
                              {filteredUsers.filter(u => u.role === 'fleet').length === 0 ? <EmptyState /> : 
                                filteredUsers.filter(u => u.role === 'fleet').map(user => (
                                    <UserCard key={user.uid} user={user} updatingUserStatus={updatingUserStatus} handleUserStatusUpdate={handleUserStatusUpdate} setUserToDelete={setUserToDelete} />
                                ))
                            }
                        </TabsContent>
                         <TabsContent value="providers" className="mt-4 space-y-4">
                             {filteredUsers.filter(u => u.role === 'provider').length === 0 ? <EmptyState /> : 
                                filteredUsers.filter(u => u.role === 'provider').map(user => (
                                    <UserCard key={user.uid} user={user} updatingUserStatus={updatingUserStatus} handleUserStatusUpdate={handleUserStatusUpdate} setUserToDelete={setUserToDelete} />
                                ))
                            }
                        </TabsContent>
                         <TabsContent value="admins" className="mt-4 space-y-4">
                             {filteredUsers.filter(u => u.role === 'admin').length === 0 ? <EmptyState /> : 
                                filteredUsers.filter(u => u.role === 'admin').map(user => (
                                    <UserCard key={user.uid} user={user} updatingUserStatus={updatingUserStatus} handleUserStatusUpdate={handleUserStatusUpdate} setUserToDelete={setUserToDelete} />
                                ))
                            }
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá remover permanentemente o usuário <span className="font-bold">{userToDelete?.name || userToDelete?.email}</span> e todos os seus dados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUserDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 animate-spin"/>}
                            Sim, remover usuário
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

const EmptyState = () => (
    <div className="text-center py-16 text-muted-foreground">
        <Users className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg font-semibold">Nenhum usuário encontrado</p>
        <p>Tente ajustar seus filtros ou verifique esta categoria mais tarde.</p>
    </div>
);


function UserCard({ user, updatingUserStatus, handleUserStatusUpdate, setUserToDelete }: { user: AdminUser; updatingUserStatus: string | null; handleUserStatusUpdate: (userId: string, status: 'Aprovado' | 'Rejeitado' | 'Pendente') => void; setUserToDelete: (user: AdminUser) => void; }) {
    const displayName = user.nomeFantasia || user.name;
    const fallback = (displayName || user.email).charAt(0).toUpperCase();

    return (
        <div className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors hover:bg-muted/50">
             <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoUrl} alt={displayName} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="truncate">
                    <Link href={`/admin/users/${user.uid}`} className="font-semibold hover:underline truncate block">{displayName}</Link>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Membro desde: {format(user.createdAt instanceof Date ? user.createdAt : typeof user.createdAt === 'string' ? new Date(user.createdAt) : new Date(user.createdAt.seconds * 1000), 'dd/MM/yyyy')}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 md:border-0 md:pt-0 md:justify-center">
                 <Badge variant={getRoleVariant(user.role)} className="capitalize gap-1.5 pl-2">
                    {getRoleIcon(user.role)}
                    {user.role}
                 </Badge>
                 <Badge variant={getProfileStatusVariant(user.profileStatus)} className="capitalize">
                    {user.profileStatus?.replace('_', ' ') || 'Incompleto'}
                 </Badge>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    Créditos: <span className="font-semibold text-foreground">{user.credits ?? 0}</span>
                 </div>
                 {user.averageRating && user.averageRating > 0 && (
                     <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500" />
                        Avaliação: <span className="font-semibold text-foreground">{user.averageRating.toFixed(1)}</span>
                     </div>
                 )}
            </div>
            
            <div className="border-t pt-4 md:border-0 md:pt-0">
                <UserActions user={user} updatingUserStatus={updatingUserStatus} handleUserStatusUpdate={handleUserStatusUpdate} setUserToDelete={setUserToDelete} />
            </div>
        </div>
    )
}

function UserActions({ user, updatingUserStatus, handleUserStatusUpdate, setUserToDelete }: { user: AdminUser; updatingUserStatus: string | null; handleUserStatusUpdate: (userId: string, status: 'Aprovado' | 'Rejeitado' | 'Pendente') => void; setUserToDelete: (user: AdminUser) => void; }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline"><MoreHorizontal /> Ações</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${user.uid}`}>
                        <FilePen /> Ver / Editar Perfil
                    </Link>
                </DropdownMenuItem>
                {(user.profileStatus === 'pending_review') && (
                    updatingUserStatus === user.uid ? (
                        <DropdownMenuItem disabled>
                            <Loader2 className="animate-spin" />
                            Atualizando...
                        </DropdownMenuItem>
                    ) : (
                        <>
                            <DropdownMenuItem onClick={() => handleUserStatusUpdate(user.uid, 'Aprovado')}><UserCheck /> Aprovar Cadastro</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground" onClick={() => handleUserStatusUpdate(user.uid, 'Rejeitado')}>Rejeitar Cadastro</DropdownMenuItem>
                        </>
                    )
                )}
                <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={() => setUserToDelete(user)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                    <Trash2 /> Remover Usuário
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
