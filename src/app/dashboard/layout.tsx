
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
  Lock,
  MessageSquare,
  Heart,
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
import { collection, onSnapshot, query, where, orderBy, limit, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import Image from 'next/image';

interface Notification {
    id: string;
    message: string;
    type: 'stock' | 'order' | 'general';
    isRead: boolean;
    createdAt: { seconds: number; nanoseconds: number; };
    productId?: string;
}

const allNavItems = [
  { href: '/dashboard', icon: Home, label: 'Tableau de bord', roles: ['Admin', 'Caissier', 'Gestionnaire de Stock'] },
  { href: '/dashboard/orders', icon: UtensilsCrossed, label: 'Commandes', roles: ['Admin', 'Caissier'] },
  { href: '/dashboard/products', icon: ShoppingBasket, label: 'Produits', roles: ['Admin', 'Gestionnaire de Stock'] },
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
    if (!user?.restaurantName) return;
    
    const q = query(
        collection(db, 'notifications'), 
        where('isRead', '==', false),
        where('restaurantName', '==', user.restaurantName),
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

  const navItems = useMemo(() => {
    if (!user?.role) return [];
    if (user.role === 'Admin') {
      return allNavItems.map(item => ({ ...item, isAllowed: true }));
    }
    
    // Default logic for other roles
    return allNavItems
      .filter(item => {
        const isGestionnaire = user.role === 'Gestionnaire de Stock';
        if (isGestionnaire && (item.href === '/dashboard/reports' || item.href === '/dashboard/users')) return false;
        
        return true;
      })
      .map(item => ({
        ...item,
        isAllowed: item.roles.includes(user.role as string),
      }));
  }, [user?.role]);
  
  const filteredNotifications = useMemo(() => {
    if (!user) return [];
    const userRole = user.role;
    if (userRole === 'Admin' || userRole === 'Gestionnaire de Stock') {
        return notifications;
    }
    return notifications.filter(notif => notif.type !== 'stock');
  }, [notifications, user]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Déconnexion réussie.'});
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur lors de la déconnexion.'});
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  const markAllAsRead = async () => {
    if (filteredNotifications.length === 0) return;
    const batch = writeBatch(db);
    const notifIds = filteredNotifications.map(n => n.id);
    notifIds.forEach(id => {
        const notifRef = doc(db, "notifications", id);
        batch.update(notifRef, { isRead: true });
    });
    await batch.commit();
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
                  tooltip={item.isAllowed ? item.label : `${item.label} (Verrouillé)`}
                  disabled={!item.isAllowed}
                  aria-disabled={!item.isAllowed}
                >
                  <Link href={item.isAllowed ? item.href : '#'}>
                    {item.isAllowed ? <item.icon /> : <Lock />}
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
                <SidebarMenuButton asChild tooltip={'Faites un don'} variant="outline">
                    <Link href="/contact">
                        <Heart />
                        <span>Faites un don</span>
                    </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/contact'} tooltip={'Contacter le Support'}>
                <Link href="/contact">
                  <MessageSquare />
                  <span>{'Contacter le Support'}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
          <SidebarTrigger />
          <div className="flex w-full items-center justify-end gap-2">
            {isRegisterOpen && (
              <Badge variant="outline" className="flex items-center gap-2 text-sm p-2 border-green-500 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Caisse Ouverte ({openedBy})
              </Badge>
            )}
            <ThemeSwitcher />
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
                <div className="flex justify-between items-center pr-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {filteredNotifications.length > 0 && (
                        <Button variant="link" size="sm" onClick={markAllAsRead} className="text-xs">
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>
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
                 <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    {user.restaurantLogo ? (
                        <Image 
                            src={user.restaurantLogo} 
                            alt="Logo du restaurant"
                            fill
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || "https://placehold.co/100x100.png"} alt="@utilisateur" />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                </Button>
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
