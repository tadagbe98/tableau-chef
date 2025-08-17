
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
  CheckCircle,
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
import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
    id: string;
    message: string;
    type: 'stock' | 'order' | 'general';
    isRead: boolean;
    createdAt: { seconds: number; nanoseconds: number; };
}

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
  const { user, logout, isRegisterOpen, openedBy } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  useEffect(() => {
    if (!user) return;
    
    // This query now correctly fetches only unread notifications.
    const q = query(
        collection(db, 'notifications'), 
        where('isRead', '==', false), 
        orderBy('createdAt', 'desc'), 
        limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedNotifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification));
        setNotifications(fetchedNotifications);
    }, (error) => {
        console.error("Erreur de notifications:", error);
    });
      
    return () => unsubscribe();
  }, [user]);
  
  const filteredNotifications = useMemo(() => {
    if (!user) return [];
    const userRole = user.role;
    // Admins and Stock Managers see all unread notifications
    if (userRole === 'Admin' || userRole === 'Gestionnaire de Stock') {
        return notifications;
    }
    // Other roles only see non-stock related notifications
    return notifications.filter(notif => notif.type !== 'stock');
  }, [notifications, user]);

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
            {isRegisterOpen && (
              <Badge variant="outline" className="flex items-center gap-2 text-sm p-2 border-green-500 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Caisse Ouverte ({openedBy})
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {filteredNotifications.length > 0 && (
                     <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notif => (
                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1">
                          <p className="text-sm font-medium">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt.seconds * 1000), { addSuffix: true, locale: fr }) : '...'}
                          </p>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <p className="p-2 text-sm text-muted-foreground text-center">Aucune nouvelle notification.</p>
                )}
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
