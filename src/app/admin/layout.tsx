
'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/admin');
  };

  if (loading) {
     return (
      <div className="fixed inset-0 flex h-screen items-center justify-center bg-background z-50">
          <div className="flex flex-col items-center gap-4">
              <Logo className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement...</p>
          </div>
      </div>
    );
  }

  // If not logged in, only the /admin page (login page) is accessible
  if (!user) {
    if (pathname !== '/admin') {
      router.push('/admin');
      return null;
    }
    return <>{children}</>;
  }
  
  // If logged in but not an Admin, redirect
  if (user.role !== 'Admin') {
      router.push('/');
      return null;
  }

  // If logged in as admin, redirect from login page to dashboard
  if (pathname === '/admin') {
      router.push('/admin/dashboard');
      return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">TableauChef - Super Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/contact">
                    <MessageSquare className="mr-2 h-4 w-4"/> Support
                </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/> Déconnexion
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
