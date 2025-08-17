
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessagesBreadcrumb } from './Breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: { seconds: number; nanoseconds: number; };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    const messagesCollectionRef = collection(db, 'contact_messages');
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));

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
    <div className="space-y-4">
        <MessagesBreadcrumb />
        <Card>
            <CardHeader>
                <CardTitle>Tous les Messages du Support</CardTitle>
                <CardDescription>
                    Voici la liste complète des messages reçus.
                </CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>De</TableHead>
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
                    <Accordion type="single" collapsible className="w-full">
                        {messages.map((msg) => (
                            <AccordionItem value={msg.id} key={msg.id}>
                                <AccordionTrigger className="hover:no-underline">
                                    <TableRow className="w-full hover:bg-transparent">
                                        <TableCell className="text-xs text-muted-foreground">
                                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000), { addSuffix: true, locale: fr }) : '...'}
                                        </TableCell>
                                        <TableCell className="font-medium">{msg.name} <span className="text-muted-foreground">({msg.email})</span></TableCell>
                                        <TableCell className="max-w-md truncate">{msg.message}</TableCell>
                                    </TableRow>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-4 bg-secondary rounded-md">
                                        <p className="whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                   </Accordion>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
