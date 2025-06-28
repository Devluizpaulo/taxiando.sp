'use client';

import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("O email é inválido."),
  message: z.string().min(10, "A mensagem precisa ter pelo menos 10 caracteres."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    // Placeholder for actual submission logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    toast({
      title: "Mensagem Enviada!",
      description: "Obrigado por entrar em contato. Responderemos em breve.",
    });
    form.reset({ name: "", email: "", message: "" });
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Entre em Contato</CardTitle>
              <CardDescription>
                Tem alguma dúvida, sugestão ou feedback? Adoraríamos ouvir você.
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
                        <FormLabel>Seu Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Email</FormLabel>
                        <FormControl>
                          <Input placeholder="joao@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sua Mensagem</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Deixe sua mensagem aqui..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Mensagem
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
