
'use client';

import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGlobalSettings } from "../actions/admin-actions";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';

type Settings = Awaited<ReturnType<typeof getGlobalSettings>>;

export default function TermsOfServicePage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    getGlobalSettings().then(setSettings);
    setLastUpdated(new Date().toLocaleDateString('pt-BR'));
  }, []);
  
  const termsContent = settings?.legal?.termsOfService || "## Termos de Serviço\n\nO conteúdo desta página pode ser editado no painel do administrador.";

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Termos de Serviço</CardTitle>
              {lastUpdated && <CardDescription>Última atualização: {lastUpdated}</CardDescription>}
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {termsContent}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
