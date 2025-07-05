'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthProtection } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Lock, ExternalLink, Replace, PlusCircle, Trash2, Palette } from 'lucide-react';
import { getGlobalSettings, updateGlobalSettings } from '@/app/actions/admin-actions';
import { type GlobalSettings } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const themeSchema = z.object({
    name: z.string().min(1, "O nome do tema é obrigatório."),
    colors: z.object({
        '--background': z.string().min(1),
        '--foreground': z.string().min(1),
        '--card': z.string().min(1),
        '--primary': z.string().min(1),
        '--primary-foreground': z.string().min(1),
        '--secondary': z.string().min(1),
        '--accent': z.string().min(1),
        '--destructive': z.string().min(1),
        '--border': z.string().min(1),
        '--input': z.string().min(1),
        '--ring': z.string().min(1),
    })
});

const settingsFormSchema = z.object({
  siteName: z.string().min(3, "O nome do site é obrigatório."),
  logoUrl: z.string().url("URL do logo inválida.").optional().or(z.literal('')),
  activeGateway: z.enum(['mercadoPago', 'stripe']).optional(),
  mercadoPagoPublicKey: z.string().optional(),
  mercadoPagoAccessToken: z.string().optional(),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  activeThemeName: z.string().min(1, "É necessário selecionar um tema ativo."),
  themes: z.array(themeSchema).min(1, "É necessário ter pelo menos um tema."),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
    const { loading: authLoading } = useAuthProtection({ requiredRoles: ['admin'] });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: { themes: [] },
    });
    
    const { fields: themeFields, append: appendTheme, remove: removeTheme } = useFieldArray({
        control: form.control,
        name: "themes",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getGlobalSettings();
                form.reset(settings);
            } catch (error) {
                 toast({ variant: 'destructive', title: "Erro", description: "Não foi possível carregar as configurações." });
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchSettings();
    }, [form, toast]);

    const onSubmit = async (values: SettingsFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await updateGlobalSettings(values);

            if (result.success) {
                 toast({ title: 'Sucesso!', description: result.message });
                 // A quick reload to see theme changes applied immediately
                 setTimeout(() => window.location.reload(), 1000);
            } else {
                 toast({ variant: 'destructive', title: 'Erro ao Salvar', description: result.error });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro Crítico', description: 'Não foi possível se comunicar com o servidor.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const addNewTheme = () => {
        appendTheme({
            name: "Novo Tema",
            colors: {
                 '--background': '0 0% 100%',
                '--foreground': '222.2 84% 4.9%',
                '--card': '0 0% 100%',
                '--primary': '210 40% 98%',
                '--primary-foreground': '222.2 47.4% 11.2%',
                '--secondary': '210 40% 96.1%',
                '--accent': '217.2 91.2% 59.8%',
                '--destructive': '0 84.2% 60.2%',
                '--border': '214.3 31.8% 91.4%',
                '--input': '214.3 31.8% 91.4%',
                '--ring': '222.2 84% 4.9%',
            }
        });
    }

    if (authLoading || isLoadingData) {
        return <LoadingScreen />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações da Plataforma</h1>
                    <p className="text-muted-foreground">Gerencie as configurações globais, temas e integrações.</p>
                </div>

                <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="themes">Temas</TabsTrigger>
                        <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Informações Gerais</CardTitle><CardDescription>Configure o nome e o logo do site.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="siteName" render={({ field }) => (
                                    <FormItem><FormLabel>Nome do Site</FormLabel><FormControl><Input {...field} placeholder="Táxiando SP" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="logoUrl" render={({ field }) => (
                                    <FormItem><FormLabel>URL do Logo</FormLabel><FormControl><Input {...field} placeholder="/logo.png" /></FormControl><FormDescription>Use um caminho local (ex: /logo.png) ou uma URL completa.</FormDescription><FormMessage /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="themes" className="mt-6">
                         <Card>
                            <CardHeader><CardTitle>Temas e Aparência</CardTitle><CardDescription>Personalize a aparência da plataforma.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="activeThemeName" render={({ field }) => (
                                    <FormItem><FormLabel>Tema Ativo</FormLabel>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tema ativo..." /></SelectTrigger></FormControl>
                                            <SelectContent>{themeFields.map((theme, index) => (<SelectItem key={theme.id} value={form.getValues(`themes.${index}.name`)}>{form.getValues(`themes.${index}.name`)}</SelectItem>))}</SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                
                                <div className="space-y-4 pt-4 border-t">
                                    {themeFields.map((field, index) => (
                                        <Card key={field.id} className="relative p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <FormField control={form.control} name={`themes.${index}.name`} render={({ field }) => (
                                                    <FormItem className="flex-1 mr-4"><FormLabel className="sr-only">Nome do Tema</FormLabel><FormControl><Input className="text-lg font-bold border-0 shadow-none p-1" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTheme(index)} disabled={themeFields.length <= 1}><Trash2 className="text-destructive"/></Button>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.keys(field.colors).map((colorKey) => (
                                                    <FormField
                                                        key={`${field.id}-${colorKey}`}
                                                        control={form.control}
                                                        name={`themes.${index}.colors.${colorKey as keyof typeof field.colors}`}
                                                        render={({ field: colorField }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs capitalize">{colorKey.replace('--', '')}</FormLabel>
                                                                <div className="flex items-center gap-2">
                                                                    <FormControl><Input type="color" {...colorField} className="p-1 h-8 w-8" value={`#${hslToHex(colorField.value)}`} onChange={(e) => colorField.onChange(hexToHsl(e.target.value))} /></FormControl>
                                                                    <span className="text-xs text-muted-foreground">{hslToHex(colorField.value)}</span>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" onClick={addNewTheme}><PlusCircle/> Adicionar Novo Tema</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Gateways de Pagamento</CardTitle><CardDescription>Selecione e configure os provedores de pagamento.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                               <FormField control={form.control} name="activeGateway" render={({ field }) => (
                                    <FormItem><FormLabel>Gateway Ativo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="w-full md:w-1/2"><SelectValue placeholder="Selecione o gateway..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="mercadoPago">Mercado Pago</SelectItem><SelectItem value="stripe">Stripe</SelectItem></SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t">
                                     <div>
                                        <h3 className="font-semibold mb-2">Credenciais do Mercado Pago</h3>
                                        <div className="space-y-4">
                                            <FormField control={form.control} name="mercadoPagoPublicKey" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2 text-sm"><KeyRound/> Public Key</FormLabel><FormControl><Input {...field} placeholder="APP_USR-..." /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="mercadoPagoAccessToken" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2 text-sm"><Lock/> Access Token</FormLabel><FormControl><Input type="password" {...field} placeholder="APP_USR-..." /></FormControl><FormMessage /></FormItem>)}/>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Credenciais do Stripe</h3>
                                        <div className="space-y-4">
                                            <FormField control={form.control} name="stripePublicKey" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2 text-sm"><KeyRound/> Publishable Key</FormLabel><FormControl><Input {...field} placeholder="pk_live_..." /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="stripeSecretKey" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2 text-sm"><Lock/> Secret Key</FormLabel><FormControl><Input type="password" {...field} placeholder="sk_live_..." /></FormControl><FormMessage /></FormItem>)}/>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting || isLoadingData} size="lg">
                        {(isSubmitting || isLoadingData) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Todas as Configurações
                    </Button>
                </div>
            </form>
        </Form>
    );
}


// --- Helper functions for color conversion ---
function hexToHsl(hex: string): string {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
}


function hslToHex(hsl: string): string {
    const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
    const s_norm = s / 100;
    const l_norm = l / 100;
    let c = (1 - Math.abs(2 * l_norm - 1)) * s_norm,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l_norm - c / 2,
        r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
    else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
    else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (300 <= h && h < 360) { [r, g, b] = [c, 0, x]; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
