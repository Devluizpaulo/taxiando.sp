
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Image from 'next/image';

import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, Building, Wrench, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type Role = 'driver' | 'fleet' | 'provider' | 'admin';

const roles: { id: Role; title: string; description: string; icon: React.ElementType, image: string, imageHint: string }[] = [
    { id: 'driver', title: 'Motorista', description: 'Acesse seu painel e encontre veículos para alugar.', icon: Car, image: 'https://placehold.co/600x400.png', imageHint: 'taxi city night' },
    { id: 'fleet', title: 'Frota', description: 'Gerencie seus veículos e motoristas.', icon: Building, image: 'https://placehold.co/600x400.png', imageHint: 'modern office building' },
    { id: 'provider', title: 'Prestador', description: 'Gerencie seus serviços e anúncios.', icon: Wrench, image: 'https://placehold.co/600x400.png', imageHint: 'car workshop' },
    { id: 'admin', title: 'Administrador', description: 'Gerencie a plataforma e usuários.', icon: Shield, image: 'https://placehold.co/600x400.png', imageHint: 'server room data center' },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: 'Email ou senha inválidos. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const getLoginTitle = () => {
    if (!selectedRoleData) return "Acesse sua conta";
    switch(selectedRoleData.id) {
        case 'driver':
        case 'provider':
        case 'admin':
            return `Login de ${selectedRoleData.title}`;
        case 'fleet':
            return `Login da ${selectedRoleData.title}`;
        default:
            return `Acesse sua conta`;
    }
  }
  
  const getLoginLabel = () => {
      if (!selectedRoleData) return "Email";
      if (selectedRoleData.id === 'fleet') return "Email da Empresa";
      return "Seu Email";
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {!selectedRole ? (
            <>
              <CardHeader className="text-center">
                  <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={170} className="h-24 w-auto mx-auto mb-4 rounded-xl shadow-lg" />
                  <p className="text-muted-foreground">Selecione seu perfil para continuar.</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                  {roles.map((role) => (
                      <Card 
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary"
                      >
                          <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                              <role.icon className="h-8 w-8 text-primary" />
                              <div>
                                  <CardTitle className="text-lg">{role.title}</CardTitle>
                                  <CardDescription>{role.description}</CardDescription>
                              </div>
                          </CardHeader>
                      </Card>
                  ))}
              </CardContent>
              <CardFooter className="justify-center text-sm">
                  Não tem uma conta?{" "}
                  <Link href="/register" className="font-semibold text-accent hover:underline ml-1">
                      Cadastre-se
                  </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedRole(null)}>
                        <ArrowLeft />
                    </Button>
                    <div>
                        <CardTitle className="text-2xl font-headline">{getLoginTitle()}</CardTitle>
                        <CardDescription>Bem-vindo(a) de volta!</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="text-foreground">{getLoginLabel()}</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                          <div className="flex items-center justify-between"><FormLabel className="text-foreground">Senha</FormLabel></div>
                          <FormControl><Input type="password" required {...field} /></FormControl><FormMessage />
                      </FormItem>
                  )}/>
                  <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                  </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="justify-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/register" className="font-semibold text-accent hover:underline ml-1">
                  Cadastre-se
                </Link>
              </CardFooter>
            </>
          )}
        </Card>
      </main>
      <PublicFooter/>
    </div>
  );
}
