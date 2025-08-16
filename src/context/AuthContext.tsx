
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/logo';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...firebaseUser,
              // Make sure display name is consistent
              displayName: firebaseUser.displayName || userData.displayName, 
              role: userData.role,
              restaurantName: userData.restaurantName,
            });
        } else {
             // This might happen briefly during signup before the Firestore doc is created
             console.log("User exists in Auth but not in Firestore yet.");
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

  const login = async (email: string, pass: string) => {
      return signInWithEmailAndPassword(auth, email, pass);
  }

  const signup = async (email: string, pass:string, fullName: string, restaurantName: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: fullName });
      
      // Use UID as document ID
      const userDocRef = doc(db, "users", newUser.uid);
      const userData = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: fullName,
        restaurantName: restaurantName,
        role: 'Admin', // First user is always Admin
      };
      await setDoc(userDocRef, userData);

      // Set user state immediately after signup to include custom data
      setUser({
        ...newUser,
        displayName: fullName,
        role: userData.role,
        restaurantName: userData.restaurantName,
      });
  }
  
  // A simplified createUser function for admins.
  // WARNING: This has major limitations on the client-side. The admin will be
  // temporarily signed out and signed back in. A Cloud Function is the robust solution.
  const createUser = async (email: string, pass: string, fullName: string, role: string) => {
      const adminUser = auth.currentUser;
      if (!adminUser) throw new Error("Admin not logged in");
      
      // Create the new user account
      const newUserCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = newUserCredential.user;
      
      // Save new user's profile to Firestore
      const userDocRef = doc(db, "users", newUser.uid);
      await setDoc(userDocRef, {
          uid: newUser.uid,
          email: newUser.email,
          name: fullName,
          role: role,
      });

      // This is the tricky part: sign the admin back in.
      // We can't get the admin's password here. This will fail without re-authentication.
      // This highlights the client-side limitation.
      // A proper solution requires a backend.
      // For the prototype, the admin will have to log back in manually after adding a user.
      // We will try to sign them back in if we can.
      console.warn("Admin was logged out to create a new user. This is a known limitation of the client-side implementation.");
      
      // Attempt to re-sign in the admin can be done but it's not secure or reliable
      // to handle passwords on the client. We will skip this and let the admin be logged out.
      // The user flow will be: admin adds user -> admin is logged out -> admin logs back in.
      router.push('/login');
      throw new Error("Admin logged out. Please log in again.");
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
