'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Image from 'next/image';

import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, Building, Wrench, ArrowLeft } from 'lucide-react';
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

const roles: { id: Role; title: string; description: string; icon: React.ElementType, image: string, imageHint: string }[] = [
    { id: 'driver', title: 'Sou Motorista', description: 'Busco veículos para alugar e qualificação.', icon: Car, image: 'https://placehold.co/600x400.png', imageHint: 'taxi city night' },
    { id: 'fleet', title: 'Sou uma Frota', description: 'Quero oferecer veículos para aluguel.', icon: Building, image: 'https://placehold.co/600x400.png', imageHint: 'modern office building' },
    { id: 'provider', title: 'Sou Prestador', description: 'Ofereço serviços para motoristas e frotas.', icon: Wrench, image: 'https://placehold.co/600x400.png', imageHint: 'car workshop' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
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

  const currentRoleFromForm = form.watch('role');
  const personType = form.watch('personType');

  const handleRoleSelect = (role: Role) => {
    form.setValue('role', role, { shouldValidate: true, shouldDirty: true });
    setSelectedRole(role);
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
    } catch (error: any)
    {
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
    const isDriver = currentRoleFromForm === 'driver';
    const isCompany = !isDriver && personType === 'pj';
    const isIndividual = isDriver || personType === 'pf';

    return (
        <div className="space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" data-state="open">            
            {isIndividual && (
                <>
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="cpf" render={({ field }) => (
                        <FormItem><FormLabel>CPF (Opcional)</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </>
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
                        <FormItem><FormLabel>CNPJ (Opcional)</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
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

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden [perspective:1000px]">
      <div 
        className={cn(
          "w-full max-w-lg h-[680px] sm:h-[620px] relative transition-transform duration-700 ease-in-out [transform-style:preserve-3d]",
          selectedRole ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        )}
      >
        {/* Front Face: Role Selection */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
          <Card className="h-full flex flex-col">
              <CardHeader className="text-center">
                  <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={170} className="h-24 w-auto mx-auto mb-4 rounded-xl shadow-lg" />
                  <CardTitle className="text-2xl font-headline">Crie sua conta gratuita</CardTitle>
                  <CardDescription>Primeiro, selecione o seu tipo de perfil.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                    {roles.map((role) => (
                      <Card 
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary"
                      >
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
          </Card>
        </div>

        {/* Back Face: Form */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {selectedRole && selectedRoleData && (
              <Card className="h-full w-full overflow-hidden shadow-2xl relative">
                  <Image 
                      src={selectedRoleData.image}
                      alt={selectedRoleData.title}
                      fill
                      className="object-cover"
                      data-ai-hint={selectedRoleData.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                  
                  <div className="relative h-full flex flex-col justify-between p-2 sm:p-6">
                      <div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white" onClick={() => setSelectedRole(null)}>
                              <ArrowLeft />
                          </Button>
                      </div>
                      
                      <div className="bg-background/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" data-state="open">
                          <CardHeader className="p-0 mb-4 text-center">
                              <CardTitle className="text-xl sm:text-2xl font-headline text-foreground">Cadastro de {selectedRoleData.title.split(' ')[2]}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                  {currentRoleFromForm && (
                                      <>
                                        {currentRoleFromForm !== 'driver' ? (
                                            <Tabs defaultValue="pf" className="w-full" onValueChange={(v) => form.setValue('personType', v as PersonType)}>
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
                                                    <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="pf" className="pt-4">{renderFormFields()}</TabsContent>
                                                <TabsContent value="pj" className="pt-4">{renderFormFields()}</TabsContent>
                                            </Tabs>
                                        ) : (
                                            <div className="pt-4">{renderFormFields()}</div>
                                        )}
                                      </>
                                  )}
                                </form>
                              </Form>
                          </CardContent>
                      </div>
                  </div>
              </Card>
          )}
        </div>
      </div>
    </div>
  );
}
