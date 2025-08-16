
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { initializeApp } from 'firebase/app';


// Définir un type pour notre utilisateur qui inclut le rôle
export interface AppUser extends User {
  role?: string;
  restaurantName?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, fullName: string, restaurantName: string) => Promise<any>;
  logout: () => Promise<void>;
  createUser: (email: string, pass: string, fullName: string, role: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    createUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, let's fetch their custom data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Combine firebase user with firestore data
            setUser({
              ...firebaseUser,
              displayName: userData.name, // Always get name from Firestore
              role: userData.role,
              restaurantName: userData.restaurantName,
            });
        } else {
             // This might happen during signup before the doc is created
             setUser(firebaseUser);
        }
      } else {
        // User is signed out
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

  const signup = async (email: string, pass:string, fullName: string, restaurantName: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      // We still update the profile for good measure, but Firestore is the source of truth
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

      // Set user in state immediately after signup
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
          throw new Error("L'administrateur doit être connecté pour créer un utilisateur.");
      }
      
      // Workaround: Use a secondary app to create user without signing out the admin
      const secondaryApp = initializeApp({
          apiKey: auth.app.options.apiKey,
          authDomain: auth.app.options.authDomain,
      }, `secondary-app-${new Date().getTime()}`);
      const secondaryAuth = getAuth(secondaryApp);

      try {
        const newUserCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
        const newUser = newUserCredential.user;

        await updateProfile(newUser, { displayName: fullName });
      
        const userDocRef = doc(db, "users", newUser.uid);
        await setDoc(userDocRef, {
            uid: newUser.uid,
            email: newUser.email,
            name: fullName,
            role: role,
        });

        // The secondary auth instance can now be signed out, admin stays logged in.
        await signOut(secondaryAuth);
        
      } catch (error: any) {
         await signOut(secondaryAuth); // Ensure secondary auth is logged out on failure
         console.error("Error creating user:", error);
         throw error; // Re-throw the error to be caught by the calling page
      }
  }


  const logout = () => {
    return signOut(auth);
  }

  // Display a global loading spinner for auth-protected pages
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
