'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  BookOpenCheck,
  Settings,
  LogOut,
  Bell,
  Users,
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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';


const allNavItems = [
  { href: '/dashboard', icon: Home, label: 'Tableau de bord', roles: ['Admin', 'Caissier', 'Gestionnaire de Stock'] },
  { href: '/dashboard/orders', icon: UtensilsCrossed, label: 'Commandes', roles: ['Admin', 'Caissier'] },
  { href: '/dashboard/products', icon: ShoppingBasket, label: 'Produits', roles: ['Admin', 'Caissier', 'Gestionnaire de Stock'] },
  { href: '/dashboard/inventory', icon: Warehouse, label: 'Inventaire', roles: ['Admin', 'Gestionnaire de Stock'] },
  { href: '/dashboard/reports', icon: BarChart, label: 'Rapports', roles: ['Admin'] },
  { href: '/dashboard/daily-point', icon: BookOpenCheck, label: 'Point Journalier', roles: ['Admin', 'Caissier'] },
  { href: '/dashboard/users', icon: Users, label: 'Utilisateurs', roles: ['Admin'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Déconnexion réussie.'});
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur lors de la déconnexion.'});
    }
  };
  
  if (!user) {
    return null;
  }
  
  const navItems = allNavItems.filter(item => user.role && item.roles.includes(user.role));

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

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
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/settings'} tooltip={'Paramètres'}>
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>{'Paramètres'}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={'Déconnexion'}>
                  <LogOut />
                  <span>{'Déconnexion'}</span>
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
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="font-semibold">Stock bas : </span>&nbsp;Les tomates sont bientôt épuisées.
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="font-semibold">Commande #124 : </span>&nbsp;Prête pour le retrait.
                </DropdownMenuItem>
                 <DropdownMenuItem>
                  <span className="font-semibold">Rapport quotidien : </span>&nbsp;Prêt pour consultation.
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user.photoURL || "https://placehold.co/100x100.png"} alt="@utilisateur" data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Facturation</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
