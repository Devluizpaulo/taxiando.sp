
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, Building, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type Role = 'driver' | 'fleet' | 'provider';

const roles: { id: Role; title: string; description: string; icon: React.ElementType, image: string, imageHint: string }[] = [
    { id: 'driver', title: 'Motorista', description: 'Acesse seu painel pessoal e oportunidades.', icon: Car, image: 'https://placehold.co/600x400.png', imageHint: 'taxi city night' },
    { id: 'fleet', title: 'Frota', description: 'Gerencie seus veículos e motoristas.', icon: Building, image: 'https://placehold.co/600x400.png', imageHint: 'modern office building' },
    { id: 'provider', title: 'Prestador', description: 'Gerencie seus serviços e anúncios.', icon: Wrench, image: 'https://placehold.co/600x400.png', imageHint: 'car workshop' },
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
      if (selectedRoleData.id === 'driver') return `Acesse sua conta de ${selectedRoleData.title}`;
      return `Login da ${selectedRoleData.title}`;
  }
  
  const getLoginLabel = () => {
      if (!selectedRoleData) return "Email";
      if (selectedRoleData.id === 'driver') return "Seu Email";
      return "Email da Empresa";
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      <div className="w-full max-w-md relative">
        <div 
          className={cn(
            "transition-opacity duration-500",
            selectedRole ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                      </svg>
                  </div>
                  <h1 className="font-headline text-2xl font-bold">Táxiando SP</h1>
              </div>
              <p className="text-muted-foreground">Selecione seu perfil para continuar.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => (
                   <Card 
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary"
                   >
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                          <role.icon className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle className="text-lg">{role.title}</CardTitle>
                              <CardDescription>{role.description}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              ))}
          </div>
            <div className="p-6 pt-4 text-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/register" className="font-semibold text-accent hover:underline">
                    Cadastre-se
                </Link>
            </div>
        </div>

        {selectedRole && selectedRoleData && (
            <div 
              className="absolute inset-0 flex flex-col justify-end data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" 
              data-state={selectedRole ? "open" : "closed"}
            >
                <div 
                  className="absolute inset-x-0 top-0 flex flex-col justify-center items-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full"
                  data-state={selectedRole ? "open" : "closed"}
                  style={{animationDuration: '600ms'}}
                >
                  <Card className="w-full shadow-2xl">
                      <CardHeader>
                          <div className="flex items-center gap-3">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedRole(null)}>
                                  <ArrowLeft />
                              </Button>
                              <div>
                                  <CardTitle className="text-2xl font-headline">{getLoginTitle()}</CardTitle>
                                  <CardDescription>
                                      Bem-vindo de volta! Insira suas credenciais.
                                  </CardDescription>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField control={form.control} name="email" render={({ field }) => (
                                  <FormItem><FormLabel>{getLoginLabel()}</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="password" render={({ field }) => (
                                  <FormItem>
                                      <div className="flex items-center justify-between"><FormLabel>Senha</FormLabel><Link href="#" className="text-sm text-accent hover:underline">Esqueceu a senha?</Link></div>
                                      <FormControl><Input type="password" required {...field} /></FormControl><FormMessage />
                                  </FormItem>
                              )}/>
                              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                              </Button>
                              </form>
                          </Form>
                      </CardContent>
                  </Card>
                </div>

                <div className="h-48 w-full overflow-hidden rounded-b-lg -z-10">
                    <Image 
                        src={selectedRoleData.image}
                        alt={selectedRoleData.title}
                        width={600}
                        height={400}
                        className="h-full w-full object-cover transition-transform duration-500 scale-100 data-[state=open]:scale-105"
                        data-ai-hint={selectedRoleData.imageHint}
                        data-state={selectedRole ? "open" : "closed"}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
