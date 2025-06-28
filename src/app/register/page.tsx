
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const registerFormSchema = z.object({
  role: z.enum(['driver', 'fleet', 'provider'], { required_error: 'Você precisa selecionar um tipo de conta.' }),
  personType: z.enum(['pf', 'pj']).optional(),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string(),
  name: z.string().optional(),
  cpf: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
}).refine(data => {
    if (data.role === 'driver') return data.name && data.name.length >= 3;
    if (data.role !== 'driver' && data.personType === 'pf') return data.name && data.name.length >= 3;
    return true;
}, { message: 'O nome completo é obrigatório.', path: ['name']})
.refine(data => {
    if (data.role !== 'driver' && data.personType === 'pj') return data.nomeFantasia && data.nomeFantasia.length >= 3;
    return true;
}, { message: 'O nome fantasia é obrigatório.', path: ['nomeFantasia']});


type Role = 'driver' | 'fleet' | 'provider';
type PersonType = 'pf' | 'pj';

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
      personType: 'pf',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      cpf: '',
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
    },
  });

  const selectedRole = form.watch('role');
  const personType = form.watch('personType');

  const handleRoleSelect = (role: Role) => {
    form.setValue('role', role, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const displayName = values.role === 'driver' || values.personType === 'pf' ? values.name : values.nomeFantasia;
      await updateProfile(user, { displayName });

      const userData: any = {
        uid: user.uid,
        email: values.email,
        role: values.role,
        createdAt: new Date(),
        profileStatus: 'incomplete',
      };

      if (values.role === 'driver' || values.personType === 'pf') {
        userData.name = values.name;
        userData.personType = 'pf';
        if (values.cpf) userData.cpf = values.cpf;
      } else { // PJ
        userData.personType = 'pj';
        userData.razaoSocial = values.razaoSocial;
        userData.nomeFantasia = values.nomeFantasia;
        if (values.cnpj) userData.cnpj = values.cnpj;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

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

  const renderFormFields = () => {
    const isDriver = selectedRole === 'driver';
    const isCompany = !isDriver && personType === 'pj';
    const isIndividual = isDriver || personType === 'pf';

    return (
        <div className="space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" data-state="open">
            <hr />
            
            {isIndividual && (
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
            )}

            {isCompany && (
                <>
                    <FormField control={form.control} name="nomeFantasia" render={({ field }) => (
                        <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input placeholder="Nome público da sua empresa" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="razaoSocial" render={({ field }) => (
                        <FormItem><FormLabel>Razão Social</FormLabel><FormControl><Input placeholder="Nome de registro da empresa" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="cnpj" render={({ field }) => (
                        <FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </>
            )}

            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                <FormLabel>{isIndividual ? "Seu melhor e-mail" : "E-mail de Contato"}</FormLabel>
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
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta e Acessar'}
            </Button>
        </div>
    )
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
            <CardTitle className="text-2xl font-headline">Crie sua conta gratuita</CardTitle>
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
                  <>
                    {selectedRole !== 'driver' ? (
                        <Tabs defaultValue="pf" className="w-full" onValueChange={(v) => form.setValue('personType', v as PersonType)}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
                                <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
                            </TabsList>
                             <TabsContent value="pf">{renderFormFields()}</TabsContent>
                             <TabsContent value="pj">{renderFormFields()}</TabsContent>
                        </Tabs>
                    ) : (
                        renderFormFields()
                    )}
                  </>
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
