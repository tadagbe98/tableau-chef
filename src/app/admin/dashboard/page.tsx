
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Building, Mail } from 'lucide-react';

export default function AdminDashboardPage() {
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      // Fetch unique restaurants
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const restaurantNames = new Set(usersSnapshot.docs.map(doc => doc.data().restaurantName).filter(Boolean));
      setRestaurantCount(restaurantNames.size);
      
      // Fetch messages count
      const messagesQuery = query(collection(db, 'contact_messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      setMessageCount(messagesSnapshot.size);

      setLoading(false);
    };

    fetchCounts();
    
    // Optional: Add snapshots for real-time updates if needed
    const messagesUnsubscribe = onSnapshot(collection(db, 'contact_messages'), (snapshot) => {
        setMessageCount(snapshot.size);
    });

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const restaurantNames = new Set(snapshot.docs.map(doc => doc.data().restaurantName).filter(Boolean));
        setRestaurantCount(restaurantNames.size);
    });

    return () => {
        messagesUnsubscribe();
        usersUnsubscribe();
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building /> Suivi des Restaurants</CardTitle>
          <CardDescription>Liste de tous les restaurants enregistrés sur la plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
            ) : (
                <div className="text-4xl font-bold">{restaurantCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Restaurants</p>
        </CardContent>
        <CardFooter>
            <Button asChild>
                <Link href="/admin/dashboard/restaurants">
                    Ouvrir <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail /> Messages du Support</CardTitle>
          <CardDescription>
            Consultez tous les messages envoyés via le formulaire de contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
            ) : (
                <div className="text-4xl font-bold">{messageCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Messages</p>
        </CardContent>
        <CardFooter>
            <Button asChild>
                <Link href="/admin/dashboard/messages">
                   Ouvrir <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
