
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, getAuth } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { initializeApp, deleteApp } from 'firebase/app';
import { useLocale } from 'next-intl';


// Définir un type pour notre utilisateur qui inclut le rôle
export interface AppUser extends User {
  role?: string;
  restaurantName?: string;
  status?: 'actif' | 'inactif';
  language?: string;
  currency?: string;
  vatRate?: number;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, data: Record<string, any>) => Promise<any>;
  logout: () => Promise<void>;
  createUser: (email: string, pass: string, fullName: string, role: string) => Promise<void>;
  createRestaurantWithAdmin: (email: string, pass: string, adminName: string, restaurantName: string) => Promise<void>;
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
    createRestaurantWithAdmin: async () => {},
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
  const locale = useLocale();
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
            const appUser: AppUser = {
              ...firebaseUser,
              displayName: userData.name,
              role: userData.role,
              restaurantName: userData.restaurantName,
              status: userData.status || 'actif',
              language: userData.language || 'fr',
              currency: userData.currency || 'EUR',
              vatRate: userData.vatRate || 20,
            };
            
            if (appUser.role !== 'Super Admin' && appUser.status === 'inactif') {
                await signOut(auth);
                toast({
                    variant: 'destructive',
                    title: 'Accès Refusé',
                    description: "Votre compte a été désactivé. Veuillez contacter un administrateur."
                });
                setUser(null);
            } else {
                setUser(appUser);
            }
        } else {
             setUser(firebaseUser); // User exists in Auth but not in Firestore
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    const publicPages = [`/${locale}/`, `/${locale}/login`, `/${locale}/signup`, `/${locale}/contact`, `/${locale}/privacy`, `/${locale}/terms`];
    const isAdminArea = pathname.includes('/admin');
    
    // Check if the current path is one of the public pages
    const isPublicPage = publicPages.some(p => p === pathname) || isAdminArea;

    if (!user && !isPublicPage) {
      router.push(`/${locale}/login`);
    } else if (user && [`/${locale}/login`, `/${locale}/signup`, `/${locale}/`].includes(pathname) && !isAdminArea) {
      if(user.role !== 'Super Admin'){
        router.push(`/${user.language || locale}/dashboard`);
      }
    }
  }, [user, loading, router, pathname, locale]);

  const login = (email: string, pass: string) => {
      return signInWithEmailAndPassword(auth, email, pass);
  }

  const signup = async (email: string, pass:string, data: Record<string, any>) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: data.fullName });
      
      const userDocRef = doc(db, "users", newUser.uid);
      const userData = {
        uid: newUser.uid,
        email: newUser.email,
        name: data.fullName,
        restaurantName: data.restaurantName,
        language: data.language,
        currency: data.currency,
        vatRate: data.vatRate,
        role: 'Admin',
        status: 'actif',
      };
      await setDoc(userDocRef, userData);
      
      await seedInitialData();

      setUser({
        ...newUser,
        ...userData,
      });
  }
  
  const createSecondaryAuthUser = async (email: string, pass: string) => {
    const appName = `secondary-app-${new Date().getTime()}`;
    const secondaryApp = initializeApp({
        apiKey: auth.app.options.apiKey,
        authDomain: auth.app.options.authDomain,
    }, appName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const newUserCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
      return newUserCredential.user;
    } finally {
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
    }
  };

  const createUser = async (email: string, pass: string, fullName: string, role: string) => {
    const adminUser = auth.currentUser;
    if (!adminUser) {
        throw new Error("L'administrateur doit être connecté pour créer un utilisateur.");
    }
    
    const adminDocRef = doc(db, 'users', adminUser.uid);
    const adminDoc = await getDoc(adminDocRef);
    const restaurantName = adminDoc.exists() ? adminDoc.data().restaurantName : 'Restaurant Inconnu';
    
    const newUser = await createSecondaryAuthUser(email, pass);
    
    const userDocRef = doc(db, "users", newUser.uid);
    await setDoc(userDocRef, {
        uid: newUser.uid,
        email: newUser.email,
        name: fullName,
        role: role,
        restaurantName: restaurantName,
        status: 'actif',
    });
  }

  const createRestaurantWithAdmin = async (email: string, pass: string, adminName: string, restaurantName: string) => {
    const superAdminUser = auth.currentUser;
    if (!superAdminUser || user?.role !== 'Super Admin') {
      throw new Error("Seul un Super Admin peut créer un nouveau restaurant.");
    }
    
    const newUser = await createSecondaryAuthUser(email, pass);

    const userDocRef = doc(db, "users", newUser.uid);
    await setDoc(userDocRef, {
      uid: newUser.uid,
      email: newUser.email,
      name: adminName,
      restaurantName: restaurantName,
      role: 'Admin',
      status: 'actif',
    });
  }

  const logout = () => {
    return signOut(auth);
  }
  
  const isAuthProtected = ![`/${locale}/`, `/${locale}/login`, `/${locale}/signup`, `/${locale}/contact`].includes(pathname) && !pathname.includes('/admin');

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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, createUser, createRestaurantWithAdmin, isRegisterOpen, openedBy, openTime, openingCash, openRegister, closeRegister }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
