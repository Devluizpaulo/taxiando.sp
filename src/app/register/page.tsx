'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, Building, Wrench } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const registerFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  role: z.enum(['driver', 'fleet', 'provider'], { required_error: 'Você precisa selecionar um tipo de conta.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

type Role = 'driver' | 'fleet' | 'provider';

const roles: { id: Role; title: string; description: string; icon: React.ElementType }[] = [
    { id: 'driver', title: 'Sou Motorista', description: 'Busco oportunidades e qualificação.', icon: Car },
    { id: 'fleet', title: 'Sou uma Frota', description: 'Quero gerenciar veículos e encontrar motoristas.', icon: Building },
    { id: 'provider', title: 'Sou Prestador', description: 'Ofereço serviços para motoristas e frotas.', icon: Wrench },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const selectedRole = form.watch('role');

  const handleRoleSelect = (role: Role) => {
    form.setValue('role', role, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.name,
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: values.name,
        email: values.email,
        role: values.role,
        createdAt: new Date(),
        profileStatus: 'incomplete',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      let errorMessage = 'Não foi possível criar a conta. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      }
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" /></svg>
                </div>
                <h1 className="font-headline text-2xl font-bold">Táxiando SP</h1>
            </div>
            <CardTitle className="text-2xl font-headline">Crie sua conta</CardTitle>
            <CardDescription>Primeiro, selecione o seu tipo de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                     {roles.map((role) => (
                        <Card 
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            className={cn(
                                "cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary",
                                selectedRole === role.id ? "border-primary ring-2 ring-primary" : "border-border",
                            )}
                        >
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <role.icon className={cn("h-8 w-8", selectedRole === role.id ? "text-primary": "text-muted-foreground")} />
                                <div>
                                    <CardTitle className="text-base">{role.title}</CardTitle>
                                    <CardDescription className="text-xs">{role.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {form.formState.errors.role && (
                    <p className="text-sm font-medium text-destructive text-center">{form.formState.errors.role.message}</p>
                )}

              {selectedRole && (
                 <div className="space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" data-state="open">
                    <hr />
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo ou Razão Social</FormLabel>
                        <FormControl><Input placeholder="Seu nome ou nome da sua frota" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl><Input type="password" required {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Confirmar Senha</FormLabel>
                            <FormControl><Input type="password" required {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
                    </Button>
                 </div>
              )}
            </form>
          </Form>
        </CardContent>
        <div className="p-6 pt-0 text-center text-sm">
          Já possui uma conta?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Faça login
          </Link>
        </div>
      </Card>
    </div>
  );
}
