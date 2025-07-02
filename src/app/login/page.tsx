
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import Image from 'next/image';

import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { trackLogin } from '../actions/analytics-actions';


const loginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
  rememberMe: z.boolean().default(false).optional(),
});


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true);
    try {
      const persistence = values.rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Fire-and-forget analytics. Don't block the UI for this.
      trackLogin(userCredential.user.uid);

      // The AuthProvider will handle fetching the profile and the 
      // DashboardLayout will handle the role-based redirect.
      // Just push to a generic authenticated route to make the login feel faster.
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={170} className="h-24 w-auto mx-auto mb-4 rounded-xl shadow-lg" />
                <CardTitle className="text-2xl font-headline">Acesse sua conta</CardTitle>
                <CardDescription>Bem-vindo(a) de volta!</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="text-foreground">Email</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between"><FormLabel className="text-foreground">Senha</FormLabel></div>
                            <FormControl><Input type="password" required {...field} /></FormControl><FormMessage />
                        </FormItem>
                    )}/>
                  </div>
                   <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-muted-foreground">
                            Lembrar-me neste dispositivo
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
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
        </Card>
      </main>
      <PublicFooter/>
    </div>
  );
}
