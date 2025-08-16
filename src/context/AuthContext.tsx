
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';

// Définir un type pour notre utilisateur qui inclut le rôle
interface AppUser extends User {
  role?: string;
  restaurantName?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, fullName: string, restaurantName: string) => Promise<any>;
  logout: () => Promise<void>;
  // This new function will be used by admins to create other users
  createUser: (email: string, pass: string, fullName: string, role: string) => Promise<any>;
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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...firebaseUser,
              displayName: userData.name, // Always get name from Firestore
              role: userData.role,
              restaurantName: userData.restaurantName,
            });
        } else {
             setUser(firebaseUser); // e.g. during signup
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

  const login = async (email: string, pass: string) => {
      return signInWithEmailAndPassword(auth, email, pass);
  }

  const signup = async (email: string, pass:string, fullName: string, restaurantName: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: fullName });
      
      const userDocRef = doc(db, "users", newUser.uid);
      const userData = {
        uid: newUser.uid,
        email: newUser.email,
        name: fullName,
        restaurantName: restaurantName,
        role: 'Admin', // First user is always Admin
      };
      await setDoc(userDocRef, userData);

      setUser({
        ...newUser,
        displayName: fullName,
        role: userData.role,
        restaurantName: userData.restaurantName,
      });
  }
  
  const createUser = async (email: string, pass: string, fullName: string, role: string) => {
      const adminUser = auth.currentUser;
      if (!adminUser) {
          throw new Error("L'administrateur n'est pas connecté.");
      }
      const adminEmail = adminUser.email;
      const adminPassword = prompt("Pour des raisons de sécurité, veuillez entrer à nouveau votre mot de passe administrateur :");
      if (!adminEmail || !adminPassword) {
        toast({variant: 'destructive', title: 'Opération annulée'});
        return;
      }

      // This will sign out the admin and sign in the new user temporarily
      const newUserCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = newUserCredential.user;
      
      await updateProfile(newUser, { displayName: fullName });
      
      const userDocRef = doc(db, "users", newUser.uid);
      await setDoc(userDocRef, {
          uid: newUser.uid,
          email: newUser.email,
          name: fullName,
          role: role,
      });

      // Sign back in as admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      toast({
        title: "Utilisateur créé avec succès",
        description: `${fullName} a été ajouté avec le rôle de ${role}.`
      });
  }


  const logout = () => {
    return signOut(auth).then(() => {
        setUser(null);
        router.push('/login');
    });
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
