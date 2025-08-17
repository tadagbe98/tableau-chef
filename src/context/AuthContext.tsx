
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, getAuth } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { initializeApp, deleteApp } from 'firebase/app';


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
  createUser: (email: string, pass: string, fullName: string, role: string) => Promise<void>;
  isRegisterOpen: boolean;
  openedBy: string | null;
  openTime: Date | null;
  openingCash: string;
  openRegister: (cash: string, user: AppUser) => void;
  closeRegister: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    createUser: async () => {},
    isRegisterOpen: false,
    openedBy: null,
    openTime: null,
    openingCash: '',
    openRegister: () => {},
    closeRegister: () => {},
});

const seedInitialData = async () => {
    const batch = writeBatch(db);

    // Default Products
    const products = [
        { name: 'Poulet Yassa', category: 'Plats Africains', price: 15.50, stock: 20, image: 'https://placehold.co/300x200.png?text=Poulet+Yassa', recipeNotes: 'Poulet mariné avec oignons et citron.' },
        { name: 'Riz Jollof', category: 'Plats Africains', price: 12.00, stock: 30, image: 'https://placehold.co/300x200.png?text=Riz+Jollof', recipeNotes: 'Riz cuit dans une sauce tomate épicée.' },
        { name: 'Pizza Margherita', category: 'Pizzas', price: 10.00, stock: 50, image: 'https://placehold.co/300x200.png?text=Margherita', recipeNotes: 'Sauce tomate, mozzarella, basilic.' },
        { name: 'Classic Burger', category: 'Burgers', price: 11.50, stock: 40, image: 'https://placehold.co/300x200.png?text=Burger', recipeNotes: 'Steak, salade, tomate, oignon, sauce maison.' },
        { name: 'Salade César', category: 'Salades', price: 9.50, stock: 25, image: 'https://placehold.co/300x200.png?text=Salade', recipeNotes: 'Laitue, poulet grillé, croûtons, parmesan.' },
        { name: 'Coca-Cola', category: 'Boissons', price: 2.50, stock: 100, image: 'https://placehold.co/300x200.png?text=Coca' },
        { name: 'Eau Minérale', category: 'Boissons', price: 2.00, stock: 100, image: 'https://placehold.co/300x200.png?text=Eau' },
        { name: 'Sauce Pili-Pili', category: 'Sauces', price: 1.00, stock: 50, image: 'https://placehold.co/300x200.png?text=Sauce' },
        { name: 'Alloco', category: 'Accompagnements', price: 5.00, stock: 40, image: 'https://placehold.co/300x200.png?text=Alloco' }
    ];

    products.forEach(product => {
        const productRef = doc(collection(db, 'products'));
        batch.set(productRef, product);
    });

    // Default Inventory Items
    const inventoryItems = [
        { name: 'Poulet', category: 'Viande', stock: 50, maxStock: 100, unit: 'kg', lowStockThreshold: 10 },
        { name: 'Riz', category: 'Céréale', stock: 80, maxStock: 150, unit: 'kg', lowStockThreshold: 20 },
        { name: 'Tomate', category: 'Légume', stock: 30, maxStock: 50, unit: 'kg', lowStockThreshold: 5 },
        { name: 'Oignon', category: 'Légume', stock: 40, maxStock: 60, unit: 'kg', lowStockThreshold: 10 },
        { name: 'Farine', category: 'Épicerie', stock: 100, maxStock: 200, unit: 'kg', lowStockThreshold: 25 },
        { name: 'Fromage Mozzarella', category: 'Produit Laitier', stock: 20, maxStock: 40, unit: 'kg', lowStockThreshold: 5 },
        { name: 'Pain Burger', category: 'Boulangerie', stock: 60, maxStock: 120, unit: 'unités', lowStockThreshold: 24 },
        { name: 'Banane Plantain', category: 'Légume', stock: 30, maxStock: 70, unit: 'kg', lowStockThreshold: 10 }
    ];

    inventoryItems.forEach(item => {
        const inventoryRef = doc(collection(db, 'inventory'));
        batch.set(inventoryRef, item);
    });
    
    await batch.commit();
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Register state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [openedBy, setOpenedBy] = useState<string | null>(null);
  const [openTime, setOpenTime] = useState<Date | null>(null);
  const [openingCash, setOpeningCash] = useState('');

  const openRegister = (cash: string, user: AppUser) => {
    setOpeningCash(cash);
    setIsRegisterOpen(true);
    setOpenedBy(user.displayName || 'Utilisateur Inconnu');
    setOpenTime(new Date());
  };

  const closeRegister = () => {
    setIsRegisterOpen(false);
    setOpeningCash('');
    setOpenedBy(null);
    setOpenTime(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...firebaseUser,
              displayName: userData.name,
              role: userData.role,
              restaurantName: userData.restaurantName,
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
        role: 'Admin',
      };
      await setDoc(userDocRef, userData);
      
      await seedInitialData();

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
    
    const appName = `secondary-app-${new Date().getTime()}`;
    const secondaryApp = initializeApp({
        apiKey: auth.app.options.apiKey,
        authDomain: auth.app.options.authDomain,
    }, appName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const newUserCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
      const newUser = newUserCredential.user;
      
      // We are not updating the profile on the auth object anymore to avoid issues
      // await updateProfile(newUser, { displayName: fullName });
    
      const userDocRef = doc(db, "users", newUser.uid);
      await setDoc(userDocRef, {
          uid: newUser.uid,
          email: newUser.email,
          name: fullName,
          role: role,
      });

    } catch (error: any) {
       console.error("Error creating user:", error);
       throw error;
    } finally {
      // It's important to sign out of the secondary auth instance and delete the app
      // to avoid issues with the main admin session.
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
    }
  }


  const logout = () => {
    return signOut(auth);
  }
  
  const isAuthProtected = !['/', '/login', '/signup'].includes(pathname);

  if (loading && isAuthProtected) {
    return (
      <div className="fixed inset-0 flex h-screen items-center justify-center bg-background z-50">
          <div className="flex flex-col items-center gap-4">
              <Logo className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement...</p>
          </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, createUser, isRegisterOpen, openedBy, openTime, openingCash, openRegister, closeRegister }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
