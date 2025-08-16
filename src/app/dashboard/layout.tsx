'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home,
  UtensilsCrossed,
  ShoppingBasket,
  Warehouse,
  BarChart,
  History,
  Settings,
  LogOut,
  Bell,
  User,
  Globe,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

const translations = {
  en: {
    Dashboard: 'Dashboard',
    Orders: 'Orders',
    Products: 'Products',
    Inventory: 'Inventory',
    Reports: 'Reports',
    'Daily Point': 'Daily Point',
    Settings: 'Settings',
    'Log Out': 'Log Out',
    'Select language': 'Select language',
    Notifications: 'Notifications',
    'My Account': 'My Account',
    Profile: 'Profile',
    Billing: 'Billing',
  },
  fr: {
    Dashboard: 'Tableau de bord',
    Orders: 'Commandes',
    Products: 'Produits',
    Inventory: 'Inventaire',
    Reports: 'Rapports',
    'Daily Point': 'Point Journalier',
    Settings: 'Paramètres',
    'Log Out': 'Déconnexion',
    'Select language': 'Sélectionner la langue',
    Notifications: 'Notifications',
    'My Account': 'Mon Compte',
    Profile: 'Profil',
    Billing: 'Facturation',
  },
    es: {
    Dashboard: 'Tablero',
    Orders: 'Pedidos',
    Products: 'Productos',
    Inventory: 'Inventario',
    Reports: 'Informes',
    'Daily Point': 'Punto Diario',
    Settings: 'Configuración',
    'Log Out': 'Cerrar Sesión',
    'Select language': 'Seleccionar idioma',
    Notifications: 'Notificaciones',
    'My Account': 'Mi Cuenta',
    Profile: 'Perfil',
    Billing: 'Facturación',
  },
  fon: {
    Dashboard: 'Agbasa',
    Orders: 'Gbajẹ',
    Products: 'Nùkplọnmẹ',
    Inventory: 'Nùkọ̀n',
    Reports: 'Wema',
    'Daily Point': 'Azǎn gblamẹ',
    Settings: 'Tito',
    'Log Out': 'Gbajẹ',
    'Select language': 'Gbe yí',
    Notifications: 'Nùkọ̀n',
    'My Account': 'Ayi ce',
    Profile: 'Ayi ce',
    Billing: 'Akwẹ',
  },
};

const initialNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/orders', icon: UtensilsCrossed, label: 'Orders' },
  { href: '/dashboard/products', icon: ShoppingBasket, label: 'Products' },
  { href: '/dashboard/inventory', icon: Warehouse, label: 'Inventory' },
  { href: '/dashboard/reports', icon: BarChart, label: 'Reports' },
  { href: '/dashboard/daily-point', icon: History, label: 'Daily Point' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // You could retrieve the saved language from localStorage here
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);
  
  const handleLanguageChange = (lang) => {
      setSelectedLanguage(lang);
      if (typeof window !== 'undefined') {
          localStorage.setItem('selectedLanguage', lang);
      }
  }

  const t = (key) => {
    if (!isClient) {
        // Render English on the server to avoid hydration mismatch
        return translations.en[key] || key;
    }
    const lang = selectedLanguage in translations ? selectedLanguage : 'en';
    return translations[lang][key] || key;
  };

  const navItems = initialNavItems.map(item => ({...item, label: t(item.label)}));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8" />
            <span className="text-xl font-semibold">TableauChef</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/settings'} tooltip={t('Settings')}>
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>{t('Settings')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('Log Out')}>
                <Link href="/login">
                  <LogOut />
                  <span>{t('Log Out')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex w-full items-center justify-end gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">{t('Select language')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('Select language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleLanguageChange('fr')}>Français</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleLanguageChange('es')}>Español</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleLanguageChange('fon')}>Fongbé</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedLanguage('yo')}>Yoruba</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedLanguage('wo')}>Wolof</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('Notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="font-semibold">Low Stock: </span>&nbsp;Tomatoes are running low.
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="font-semibold">Order #124: </span>&nbsp;Ready for pickup.
                </DropdownMenuItem>
                 <DropdownMenuItem>
                  <span className="font-semibold">Daily report: </span>&nbsp;Ready for review.
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="user avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('My Account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('Profile')}</DropdownMenuItem>
                <DropdownMenuItem>{t('Billing')}</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">{t('Settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">{t('Log Out')}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
