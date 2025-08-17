
'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'Super Admin') {
          setAdminUser(user);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await auth.signOut();
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

  // If not logged in as Super Admin, only the /admin page (login page) is accessible
  if (!adminUser) {
    if (pathname !== '/admin') {
      router.push('/admin');
      return null; // Render nothing while redirecting
    }
    return <>{children}</>;
  }
  
  // If logged in as Super Admin, redirect from login page to dashboard
  if (pathname === '/admin') {
      router.push('/admin/dashboard');
      return null; // Render nothing while redirecting
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
                    <MessageSquare className="mr-2 h-4 w-4"/> Support Client
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
  // We still need the main AuthProvider for other parts of the app to function correctly
  // but the logic for this layout is self-contained in AdminLayoutContent
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
