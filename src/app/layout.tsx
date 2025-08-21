import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: 'TableauChef | Plateforme de Gestion de Restaurant Tout-en-Un',
    template: '%s | TableauChef',
  },
  description: "Optimisez la gestion de votre restaurant avec TableauChef. Gérez commandes, inventaire, produits et rapports depuis une seule plateforme. Idéal pour les restaurants, bars et cafés.",
  keywords: ['gestion restaurant', 'logiciel restaurant', 'POS', 'caisse enregistreuse', 'gestion de stock', 'menu numérique', 'TableauChef', 'optimisation restaurant'],
  authors: [{ name: 'TableauChef' }],
  creator: 'TableauChef',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://tableauchef.app', // Replace with your actual domain
    title: 'TableauChef | Plateforme de Gestion de Restaurant Tout-en-Un',
    description: "De l'inventaire aux commandes, TableauChef centralise toutes les opérations de votre restaurant.",
    siteName: 'TableauChef',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TableauChef | Plateforme de Gestion de Restaurant Tout-en-Un',
    description: "Simplifiez la gestion de votre restaurant avec notre solution complète et intuitive.",
    // creator: '@yourtwitterhandle', // Optional: Add your twitter handle
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
         
        {/* Google Analytics Scripts */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-GKLTWWNV20" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GKLTWWNV20');
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
