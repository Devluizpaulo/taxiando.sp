
import type { Metadata, ResolvingMetadata } from 'next';
import { PT_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/providers/auth-provider';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { getGlobalSettings } from './actions/admin-actions';


export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings();
 
  return {
    title: settings.siteName || 'Táxiando SP',
    description: settings.seo?.metaDescription || 'A plataforma completa para taxistas de São Paulo.',
    keywords: settings.seo?.metaKeywords || 'táxi, sp, taxista, frota',
  }
}

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getGlobalSettings();
  const activeTheme = settings.themes?.find(t => t.name === settings.activeThemeName) || settings.themes?.[0];

  const themeVariables = activeTheme 
    ? Object.entries(activeTheme.colors)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')
    : '';

  return (
    <html lang="pt-BR" suppressHydrationWarning>
       <head>
        {themeVariables && <style>{`:root { ${themeVariables} }`}</style>}
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased",
        ptSans.variable,
        poppins.variable
      )}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
