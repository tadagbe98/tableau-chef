
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/logo';

// Définir un type pour notre utilisateur qui inclut le rôle
interface AppUser extends User {
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, fullName: string, restaurantName: string) => Promise<any>;
  logout: () => Promise<void>;
  createUser: (email: string, pass: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    createUser: async () => { throw new Error('createUser not implemented'); },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...firebaseUser,
              displayName: firebaseUser.displayName || userData.displayName,
              role: userData.role,
            });
        } else {
             setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  const login = (email: string, pass: string) => {
      return signInWithEmailAndPassword(auth, email, pass);
  }
  
  const createUser = async (email: string, pass: string) => {
    const { user: createdUser } = await createUserWithEmailAndPassword(auth, email, pass);
    return createdUser;
  };


  const signup = async (email: string, pass:string, fullName: string, restaurantName: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        restaurantName: restaurantName,
        role: 'Admin',
      });

      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            ...user,
            displayName: fullName,
            role: userData.role,
          });
      }
  }

  const logout = () => {
    setUser(null);
    return signOut(auth);
  }

  if (loading && !['/', '/login', '/signup'].includes(pathname)) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Logo className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, createUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
