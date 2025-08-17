
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import RestaurantsList from './RestaurantsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: { seconds: number; nanoseconds: number; };
}

export default function AdminDashboardPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    const messagesCollectionRef = collection(db, 'contact_messages');
    // Limit to the last 5 messages for the dashboard view
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContactMessage));
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Failed to fetch contact messages:", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
       <Card>
        <CardHeader>
          <CardTitle>Suivi des Restaurants</CardTitle>
          <CardDescription>Liste de tous les restaurants enregistrés.</CardDescription>
        </CardHeader>
        <CardContent>
          <RestaurantsList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derniers Messages du Support</CardTitle>
          <CardDescription>
            Voici les 5 messages les plus récents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingMessages ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Aucun message.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000), { addSuffix: true, locale: fr }) : '...'}
                    </TableCell>
                    <TableCell className="font-medium">{msg.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
            {/* This button could lead to a full page of messages in the future */}
            <Button variant="link" asChild>
                <Link href="#">Voir tout</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
