
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
             <Accordion type="single" collapsible className="w-full">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4">Date</TableHead>
                        <TableHead className="w-1/4">De</TableHead>
                        <TableHead className="w-2/4">Aperçu du Message</TableHead>
                        <TableHead className="w-[40px]"><span className="sr-only">Déplier</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loadingMessages ? (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Chargement...
                        </TableCell>
                        </TableRow>
                    ) : messages.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Aucun message.
                        </TableCell>
                        </TableRow>
                    ) : (
                        messages.map((msg) => (
                            <AccordionItem value={msg.id} key={msg.id} asChild>
                                <>
                                 <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td colSpan={4} className="p-0">
                                       <AccordionTrigger className="flex w-full items-center p-4 text-left hover:no-underline">
                                            <div className="w-1/4 text-xs text-muted-foreground">
                                                {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000), { addSuffix: true, locale: fr }) : '...'}
                                            </div>
                                            <div className="w-1/4 font-medium">{msg.name} <span className="text-muted-foreground">({msg.email})</span></div>
                                            <div className="w-2/4 max-w-md truncate pr-4">{msg.message}</div>
                                       </AccordionTrigger>
                                    </td>
                                </tr>
                                <AccordionContent asChild>
                                    <tr>
                                        <td colSpan={4} className="p-0">
                                            <div className="p-4 bg-secondary rounded-md m-2">
                                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </AccordionContent>
                                </>
                            </AccordionItem>
                        ))
                   
                    )}
                    </TableBody>
                </Table>
            </Accordion>
            </CardContent>
        </Card>
    </div>
  );
}
