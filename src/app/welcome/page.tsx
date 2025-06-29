'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { useAuth } from '@/hooks/use-auth';
import { createUserProfile } from '@/app/actions/user-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { LoadingScreen } from '@/components/loading-screen';

const setupFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  phone: z.string().min(10, { message: 'Insira um telefone válido com DDD.' }),
});

type SetupFormValues = z.infer<typeof setupFormSchema>;

export default function WelcomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      }
      if (user && userProfile) {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);
  
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const onSubmit = async (values: SetupFormValues) => {
    setIsSubmitting(true);
    try {
      await createUserProfile(values);
      toast({
        title: 'Perfil Criado!',
        description: 'Bem-vindo(a) à plataforma! Redirecionando para o painel...',
      });
      // The action handles the redirect, but we can also push here as a fallback.
      router.push('/dashboard');
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar perfil',
        description: 'Não foi possível salvar seus dados. Tente novamente.',
      });
      setIsSubmitting(false);
    }
  };

  if (loading || !user || userProfile) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image src="/logo.png" alt="Táxiando SP Logo" width={180} height={170} className="h-20 w-auto mx-auto mb-4 rounded-xl shadow-lg" />
          <CardTitle className="font-headline text-2xl">Bem-vindo(a)!</CardTitle>
          <CardDescription>
            Falta pouco para começar. Por favor, complete seu perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input placeholder="Seu nome" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone para Contato</FormLabel>
                    <FormControl><Input placeholder="(11) 9..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar e Acessar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
