
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { registerUser } from '@/app/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, Building, Wrench, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const passwordSchema = z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' });

const baseSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: passwordSchema,
});

const registerSchema = z.discriminatedUnion("role", [
  baseSchema.extend({
    role: z.literal("driver"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().min(11, { message: 'O CPF é obrigatório e deve conter 11 dígitos.' }),
  }),
  baseSchema.extend({
    role: z.literal("admin"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().min(11, { message: 'O CPF é obrigatório e deve conter 11 dígitos.' }),
  }),
  baseSchema.extend({
    role: z.literal("fleet"),
    personType: z.enum(['pf', 'pj']),
    name: z.string().optional(),
    cpf: z.string().optional(),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional(),
  }),
   baseSchema.extend({
    role: z.literal("provider"),
    personType: z.enum(['pf', 'pj']),
    name: z.string().optional(),
    cpf: z.string().optional(),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional(),
  })
]).and(z.object({
    confirmPassword: passwordSchema,
})).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
}).refine(data => {
    if (data.role === 'fleet' || data.role === 'provider') {
        if (data.personType === 'pf') {
             if (!data.name || data.name.length < 3) return false;
             if (!data.cpf || data.cpf.length < 11) return false;
        }
        if (data.personType === 'pj') {
            if (!data.nomeFantasia || data.nomeFantasia.length < 3) return false;
        }
    }
    return true;
}, {
    message: "Preencha os campos obrigatórios para o tipo de pessoa selecionado.",
    path: ["name"], // Or another relevant field
});


type RegisterFormValues = z.infer<typeof registerSchema>;
type Role = 'driver' | 'fleet' | 'provider' | 'admin';
type PersonType = 'pf' | 'pj';

const roles: { id: Role; title: string; description: string; icon: React.ElementType }[] = [
    { id: 'driver', title: 'Sou Motorista', description: 'Busco veículos para alugar e qualificação.', icon: Car },
    { id: 'fleet', title: 'Sou uma Frota', description: 'Quero oferecer veículos para aluguel.', icon: Building },
    { id: 'provider', title: 'Sou Prestador', description: 'Ofereço serviços para motoristas e frotas.', icon: Wrench },
    { id: 'admin', title: 'Sou Administrador', description: 'Quero gerenciar toda a plataforma.', icon: Shield },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select_role' | 'fill_form'>('select_role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    form.setValue('role', role);
    if (role === 'fleet' || role === 'provider') {
      form.setValue('personType', 'pf'); // Default to PF
    }
    setStep('fill_form');
  }

  const handleBack = () => {
    setStep('select_role');
    setSelectedRole(null);
    form.reset();
  }

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      const result = await registerUser(values);
      if (result.success) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        router.push('/dashboard');
        toast({
            title: "Cadastro realizado com sucesso!",
            description: "Bem-vindo(a) à plataforma.",
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Erro no Cadastro',
          description: result.error || 'Ocorreu um erro desconhecido.',
        });
      }
    } catch (error) {
        console.error("Submit error:", error);
        toast({
          variant: 'destructive',
          title: 'Erro Inesperado',
          description: 'Ocorreu um erro. Por favor, tente novamente.',
        });
    } finally {
      setIsLoading(false);
    }
  }

  const personType = form.watch('personType');

  const renderFormFields = () => {
    if (!selectedRole) return null;

    const isCompany = selectedRole === 'fleet' || selectedRole === 'provider';
    
    return (
        <div className="space-y-4">
            {isCompany && (
                 <FormField
                    control={form.control}
                    name="personType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Tipo de Conta</FormLabel>
                        <FormControl>
                            <Tabs
                                defaultValue={field.value}
                                onValueChange={(v) => field.onChange(v as PersonType)}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
                                    <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {(selectedRole === 'driver' || selectedRole === 'admin' || (isCompany && personType === 'pf')) && (
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            )}
            
            {(selectedRole === 'driver' || selectedRole === 'admin' || (isCompany && personType === 'pf')) && (
                 <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem><FormLabel>CPF</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            )}

            {isCompany && personType === 'pj' && (
                <>
                    <FormField control={form.control} name="nomeFantasia" render={({ field }) => (
                        <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input placeholder="Nome público da sua empresa" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="razaoSocial" render={({ field }) => (
                        <FormItem><FormLabel>Razão Social (Opcional)</FormLabel><FormControl><Input placeholder="Nome de registro da empresa" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="cnpj" render={({ field }) => (
                        <FormItem><FormLabel>CNPJ (Opcional)</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </>
            )}

            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>E-mail de Acesso</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" required {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirmar Senha</FormLabel><FormControl><Input type="password" required {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        {step === 'select_role' ? (
           <>
              <CardHeader className="text-center">
                  <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={170} className="h-24 w-auto mx-auto mb-4 rounded-xl shadow-lg" />
                  <CardTitle className="text-2xl font-headline">Crie sua conta gratuita</CardTitle>
                  <CardDescription>Primeiro, selecione o seu tipo de perfil.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                  {roles.map((role) => (
                    <Card key={role.id} onClick={() => handleRoleSelect(role.id)} className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                            <role.icon className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-lg">{role.title}</CardTitle>
                                <CardDescription className="text-xs">{role.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                  ))}
              </CardContent>
              <CardFooter className="justify-center text-sm">
                  Já possui uma conta?{" "}
                  <Link href="/login" className="font-semibold text-accent hover:underline ml-1">
                      Faça login
                  </Link>
              </CardFooter>
            </>
        ) : (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}><ArrowLeft /></Button>
                            <div>
                                <CardTitle className="text-2xl font-headline">Finalize seu Cadastro</CardTitle>
                                <CardDescription>Preencha os dados para o perfil de <span className="font-bold text-foreground">{roles.find(r => r.id === selectedRole)?.title.replace('Sou ', '')}</span>.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       {renderFormFields()}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta e Acessar'}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            Ao se cadastrar, você concorda com nossos <Link href="/terms" className="underline">Termos de Serviço</Link> e <Link href="/privacy" className="underline">Política de Privacidade</Link>.
                        </p>
                    </CardFooter>
                </form>
            </Form>
        )}
      </Card>
    </div>
  );
}
