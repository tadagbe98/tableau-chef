
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: { seconds: number; nanoseconds: number; };
}

export default function AdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated and auth check is complete
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
        const messagesCollectionRef = collection(db, 'contact_messages');
        const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContactMessage));
          setMessages(fetchedMessages);
          setLoading(false);
        }, (error) => {
          console.error("Failed to fetch contact messages:", error);
          setLoading(false);
        });

        return () => unsubscribe();
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
      return (
          <div className="flex justify-center items-center h-screen">
              <p>Chargement...</p>
          </div>
      )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages du Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Boîte de réception</CardTitle>
          <CardDescription>
            Voici les messages envoyés depuis le formulaire de contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Chargement des messages...
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucun message pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="text-xs text-muted-foreground">
                       {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000), { addSuffix: true, locale: fr }) : '...'}
                    </TableCell>
                    <TableCell className="font-medium">{msg.name}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <TableCell className="max-w-sm whitespace-pre-wrap">{msg.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
