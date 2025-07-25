

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { use } from 'react';

import {
  updateUserByAdmin,
  enrollUserInCourse,
  getUserProfileById,
} from '@/app/actions/admin-actions';
import { getAllCourses } from '@/app/actions/course-actions';
import { type AdminUser, type Course } from '@/lib/types';

import { useToast } from '@/hooks/use-toast';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, GraduationCap, Gift } from 'lucide-react';
import { Label } from '@/components/ui/label';

const adminEditUserSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório.").optional(),
  phone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos.").optional(),
  role: z.enum(['driver', 'fleet', 'provider', 'admin']),
  profileStatus: z.enum(['incomplete', 'pending_review', 'approved', 'rejected']),
  credits: z.coerce.number().min(0, "Créditos não podem ser negativos."),
});

type AdminEditUserFormValues = z.infer<typeof adminEditUserSchema>;

export default function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const router = useRouter();

    const [user, setUser] = useState<AdminUser | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const form = useForm<AdminEditUserFormValues>({
        resolver: zodResolver(adminEditUserSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [userData, coursesData] = await Promise.all([
                    getUserProfileById(id),
                    getAllCourses()
                ]);
                
                if (!userData) {
                    toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não encontrado.' });
                    router.push('/admin/users');
                    return;
                }
                
                setUser(userData);
                setCourses(coursesData);
                form.reset({
                    name: userData.name || userData.nomeFantasia || '',
                    phone: userData.phone || '',
                    role: userData.role,
                    profileStatus: userData.profileStatus as any || 'incomplete',
                    credits: userData.credits ?? 0,
                });

            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: (error as Error).message });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router, toast, form]);

    const onSubmit = async (values: AdminEditUserFormValues) => {
        if (!user) return;
        setIsUpdating(true);
        const result = await updateUserByAdmin(user.uid, values);
        if (result.success) {
            toast({ title: 'Sucesso!', description: 'Perfil do usuário atualizado.' });
            setUser(prev => prev ? { ...prev, ...values } as AdminUser : null);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Atualizar', description: result.error as string || 'Não foi possível salvar os dados.' });
        }
        setIsUpdating(false);
    };

    const handleGrantCourse = async () => {
        if (!user || !selectedCourseId) return;
        setIsUpdating(true);
        const result = await enrollUserInCourse(user.uid, selectedCourseId);
        if (result.success) {
            toast({ title: 'Sucesso!', description: 'Curso concedido ao usuário.' });
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
        setIsUpdating(false);
        setIsCourseModalOpen(false);
    };

    if (loading || !user) {
        return <LoadingScreen />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/admin/users')} className="mb-4">
                        <ArrowLeft /> Voltar para o painel
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.photoUrl ?? ''} alt={user.name ?? user.nomeFantasia ?? 'Usuário'} />
                            <AvatarFallback className="text-3xl">{(user.name ?? user.nomeFantasia ?? 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-headline text-3xl font-bold tracking-tight">{user.name ?? user.nomeFantasia ?? 'Nome não informado'}</h1>
                            <p className="text-muted-foreground">{user.email ?? 'E-mail não informado'}</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Gerenciamento do Perfil</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nome / Fantasia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem><FormLabel>Perfil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="driver">Motorista</SelectItem><SelectItem value="fleet">Frota</SelectItem><SelectItem value="provider">Prestador</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="profileStatus" render={({ field }) => (
                                <FormItem><FormLabel>Status do Perfil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="approved">Aprovado</SelectItem><SelectItem value="pending_review">Pendente</SelectItem><SelectItem value="rejected">Rejeitado</SelectItem><SelectItem value="incomplete">Incompleto</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="credits" render={({ field }) => (
                                <FormItem><FormLabel>Créditos da Plataforma</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>Cortesias</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                         <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline"><Gift className="mr-2"/> Conceder Curso Gratuito</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Conceder Curso</DialogTitle><DialogDescription>Selecione um curso para inscrever {user.name} gratuitamente.</DialogDescription></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Label>Curso</Label>
                                    <Select onValueChange={setSelectedCourseId}><SelectTrigger><SelectValue placeholder="Selecione um curso..." /></SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                    <Button onClick={handleGrantCourse} disabled={isUpdating || !selectedCourseId}>Conceder</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </Form>
    );
}
