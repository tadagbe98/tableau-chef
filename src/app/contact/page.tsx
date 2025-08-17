
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, Heart } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs.',
      });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Message envoyé !',
        description: 'Merci de nous avoir contactés. Nous vous répondrons bientôt.',
      });
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'envoi du message.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getBackLink = () => {
    if (user?.role === 'Super Admin') return '/admin/dashboard';
    if (user) return '/dashboard';
    return '/'; // Always go back to home page
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-8 p-4 md:grid-cols-2">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">TableauChef</span>
          </Link>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Contacter le Support</h1>
            <p className="text-muted-foreground">
              Avez-vous une question ou besoin d'aide ? Remplissez le formulaire ou utilisez les informations ci-dessous pour nous joindre.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <a href="https://wa.me/2250586615430" target="_blank" className="text-muted-foreground hover:underline">
                  +225 05 86 61 54 30
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <a href="mailto:tadagbemassolokonon@gmail.com" className="text-muted-foreground hover:underline">
                  tadagbemassolokonon@gmail.com
                </a>
              </div>
            </div>
          </div>
           <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="text-primary"/> Soutenez le Projet
                </CardTitle>
                <CardDescription>
                    Si TableauChef vous est utile, pensez à faire un don pour soutenir son développement continu et l'ajout de nouvelles fonctionnalités.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                 <Button asChild>
                    <a href="https://wa.me/2250586615430" target="_blank">Faire un don</a>
                </Button>
              </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Votre Nom</Label>
                <Input id="name" placeholder="Tadagbe Massolokonon" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Votre Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Votre Message</Label>
                <Textarea id="message" placeholder="Comment pouvons-nous vous aider ?" value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le Message'}
              </Button>
              <Button variant="ghost" asChild>
                <Link href={getBackLink()}>Retour</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
