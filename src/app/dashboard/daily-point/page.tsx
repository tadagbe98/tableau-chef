'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, CreditCard, Smartphone, AlertCircle, TrendingUp, TrendingDown, CheckCircle, UserCircle, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth, AppUser } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const dailySummary = {
    totalSales: 2450.75,
    cashSales: 875.50,
    cardSales: 1250.25,
    mobileSales: 325.00,
    orders: 85,
    discounts: 75.20,
    taxes: 181.54,
};

interface JournalEntry {
    id: string;
    date: string;
    totalSales: number;
    variance: number;
    openingCash: number;
    closedBy: string;
}


export default function DailyPointPage() {
    const { user, isRegisterOpen, openedBy, openTime, openingCash, openRegister, closeRegister } = useAuth();
    const [cashInDrawer, setCashInDrawer] = useState('');
    const [currentOpeningCash, setCurrentOpeningCash] = useState('');
    const [variance, setVariance] = useState<number | null>(null);
    const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);

    const { toast } = useToast();
    const isAuthorized = user?.role === 'Admin' || user?.role === 'Caissier';
    const journalsCollectionRef = collection(db, 'journals');

    useEffect(() => {
        if (user?.role !== 'Admin') return;

        const q = query(journalsCollectionRef, orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedJournals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as JournalEntry));
            setJournalHistory(fetchedJournals);
        }, (error) => {
            console.error("Erreur de snapshot Firestore pour les journaux:", error);
            toast({
                variant: "destructive",
                title: "Erreur de chargement",
                description: "Impossible de charger l'historique des journaux.",
            });
        });
        
        return () => unsubscribe();
    }, [user]);


    const handleOpenRegister = () => {
        if (!isAuthorized) {
            toast({
                variant: 'destructive',
                title: 'Accès Refusé',
                description: "Vous n'avez pas la permission d'ouvrir la caisse.",
            });
            return;
        }
        if (!currentOpeningCash) {
            toast({
                variant: 'destructive',
                title: 'Saisie Manquante',
                description: 'Veuillez entrer le fonds de caisse initial.',
            });
            return;
        }
        openRegister(currentOpeningCash, user as AppUser);
        toast({
            title: "Caisse Ouverte",
            description: `La caisse a été ouverte par ${user?.displayName} avec un fonds de ${parseFloat(currentOpeningCash).toFixed(2)} €.`
        });
    };

    const expectedCash = dailySummary.cashSales + parseFloat(openingCash || '0');

    const calculateVariance = () => {
        if (!cashInDrawer) {
            toast({
                variant: 'destructive',
                title: 'Saisie Manquante',
                description: 'Veuillez entrer le montant en espèces dans le tiroir-caisse.',
            });
            return;
        }
        const diff = parseFloat(cashInDrawer) - expectedCash;
        setVariance(diff);
    };

    const handleClosePoint = async () => {
         if (!isAuthorized) {
            toast({
                variant: 'destructive',
                title: 'Accès Refusé',
                description: "Vous n'avez pas la permission de fermer la caisse.",
            });
            return;
        }
        calculateVariance();
        if(cashInDrawer && variance !== null) {
            try {
                await addDoc(journalsCollectionRef, {
                    date: new Date().toISOString().split('T')[0],
                    totalSales: dailySummary.totalSales,
                    openingCash: parseFloat(openingCash),
                    variance: variance,
                    closedBy: user?.displayName || 'Utilisateur inconnu',
                });

                closeRegister();
                setCashInDrawer('');
                setCurrentOpeningCash('');
                setVariance(null);
                toast({
                    title: "Point de Vente Fermé et Journal Enregistré",
                    description: `Le journal a été créé et la caisse fermée par ${user?.displayName}.`
                });
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Erreur Firestore',
                    description: "Impossible d'enregistrer le journal de caisse.",
                });
                console.error("Erreur d'écriture du journal:", error);
            }
        }
    }

  return (
    <TooltipProvider>
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Gestion de Caisse et Point Journalier</h1>
      {!isRegisterOpen ? (
        <Card>
            <CardHeader>
                <CardTitle>Ouvrir la Caisse</CardTitle>
                <CardDescription>Commencez la journée en enregistrant votre fonds de caisse initial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label>Caissier</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <UserCircle className="text-muted-foreground"/>
                        <div className="font-medium flex items-center gap-2">
                           <span>{user?.displayName || 'Utilisateur'} </span>
                           <Badge variant="secondary">{user?.role || 'Rôle inconnu'}</Badge>
                        </div>
                    </div>
                </div>
                <div>
                    <Label htmlFor="opening-cash">Fonds de Caisse Initial</Label>
                    <Input 
                        id="opening-cash"
                        type="number"
                        placeholder="Entrer le montant"
                        value={currentOpeningCash}
                        onChange={(e) => setCurrentOpeningCash(e.target.value)}
                        disabled={!isAuthorized}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                            <Button onClick={handleOpenRegister} className="w-full" disabled={!isAuthorized}>
                                {!isAuthorized && <Lock className="mr-2 h-4 w-4" />}
                                Ouvrir la Caisse
                            </Button>
                        </div>
                    </TooltipTrigger>
                    {!isAuthorized && (
                        <TooltipContent>
                            <p>Seuls les Admins et Caissiers peuvent ouvrir la caisse.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </CardFooter>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Résumé des Ventes Journalières</CardTitle>
                            <CardDescription>Revue des activités financières du jour. La caisse est actuellement ouverte.</CardDescription>
                        </div>
                        {openedBy && openTime && (
                             <Badge variant="outline" className="flex items-center gap-2 text-sm p-2">
                                <UserCircle/>
                                Ouverte par {openedBy} à {openTime.toLocaleTimeString('fr-FR')}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Ventes Totales</p>
                        <p className="text-2xl font-bold">{dailySummary.totalSales.toFixed(2)} €</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Commandes Totales</p>
                        <p className="text-2xl font-bold">{dailySummary.orders}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Réductions Totales</p>
                        <p className="text-2xl font-bold">{dailySummary.discounts.toFixed(2)} €</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Taxes Totales</p>
                        <p className="text-2xl font-bold">{dailySummary.taxes.toFixed(2)} €</p>
                    </div>
                </CardContent>
                <CardContent>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><DollarSign className="text-primary"/></div>
                            <div>
                                <p className="text-muted-foreground">Ventes en Espèces</p>
                                <p className="font-semibold text-lg">{dailySummary.cashSales.toFixed(2)} €</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><CreditCard className="text-primary"/></div>
                            <div>
                                <p className="text-muted-foreground">Ventes par Carte</p>
                                <p className="font-semibold text-lg">{dailySummary.cardSales.toFixed(2)} €</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><Smartphone className="text-primary"/></div>
                            <div>
                                <p className="text-muted-foreground">Paiement Mobile</p>
                                <p className="font-semibold text-lg">{dailySummary.mobileSales.toFixed(2)} €</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Suivi de l'Écart de Caisse</CardTitle>
                <CardDescription>Comparez les espèces attendues avec le montant dans le tiroir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <Label>Fonds de Caisse Initial</Label>
                <Input value={`${parseFloat(openingCash || '0').toFixed(2)} €`} disabled />
                </div>
                <div>
                <Label>Espèces Attendues en Caisse</Label>
                <Input value={`${expectedCash.toFixed(2)} €`} disabled />
                <p className="text-xs text-muted-foreground mt-1">Fonds initial + Ventes en espèces</p>
                </div>
                <div>
                <Label htmlFor="cash-in-drawer">Espèces Réelles en Caisse</Label>
                <Input 
                    id="cash-in-drawer" 
                    type="number" 
                    placeholder="Entrer le montant" 
                    value={cashInDrawer}
                    onChange={(e) => {
                        setCashInDrawer(e.target.value);
                        setVariance(null); // Recalculate variance if cash amount changes
                    }}
                    disabled={!isAuthorized}
                />
                </div>
            </CardContent>
            <CardFooter>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <div className="w-full">
                           <Button onClick={calculateVariance} className="w-full" disabled={!isAuthorized || !cashInDrawer}>
                            {!isAuthorized && <Lock className="mr-2 h-4 w-4" />}
                            Calculer l'Écart
                           </Button>
                        </div>
                    </TooltipTrigger>
                    {!isAuthorized && (
                        <TooltipContent>
                            <p>Seuls les Admins et Caissiers peuvent effectuer cette action.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </CardFooter>
            </Card>

            <Card className="flex flex-col justify-center">
            {variance !== null ? (
                <>
                    <CardHeader>
                        <CardTitle>Résultat de l'Écart de Caisse</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`p-4 rounded-lg text-center ${variance === 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <p className="text-sm font-medium flex items-center justify-center gap-2">
                                {variance === 0 && <CheckCircle className="text-green-600" />}
                                {variance > 0 && <TrendingUp className="text-red-600" />}
                                {variance < 0 && <TrendingDown className="text-red-600" />}
                                Écart
                            </p>
                            <p className={`text-3xl font-bold ${variance === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {variance > 0 ? '+' : ''}{variance.toFixed(2)} €
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {variance === 0 ? "Équilibré" : variance > 0 ? "Excédent" : "Manquant"}
                            </p>
                        </div>
                    </CardContent>
                </>
            ) : (
                <div className="text-center text-muted-foreground p-6">
                    <AlertCircle className="mx-auto h-10 w-10 mb-2" />
                    <p>Les résultats s'afficheront ici après le calcul.</p>
                </div>
            )}
            </Card>

            <div className="md:col-span-2">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                            <Button size="lg" className="w-full" onClick={handleClosePoint} disabled={!isAuthorized || variance === null}>
                                {!isAuthorized && <Lock className="mr-2 h-4 w-4" />}
                                Fermer le Point de Vente & Créer le Journal
                            </Button>
                         </div>
                    </TooltipTrigger>
                    {!isAuthorized && (
                        <TooltipContent>
                            <p>Seuls les Admins et Caissiers peuvent fermer la caisse.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </div>
        </div>
      )}

      {user?.role === 'Admin' && (
        <Card>
            <CardHeader>
                <CardTitle>Historique des Journaux</CardTitle>
                <CardDescription>Consultez les clôtures de caisse des jours précédents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Ventes Totales</TableHead>
                            <TableHead>Fonds Initial</TableHead>
                            <TableHead>Écart de Caisse</TableHead>
                            <TableHead>Fermé par</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journalHistory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Aucun journal trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            journalHistory.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>{entry.totalSales.toFixed(2)} €</TableCell>
                                    <TableCell>{entry.openingCash.toFixed(2)} €</TableCell>
                                    <TableCell>
                                        <Badge variant={entry.variance === 0 ? 'default' : 'destructive'} className={entry.variance === 0 ? 'bg-green-500' : ''}>
                                            {entry.variance.toFixed(2)} €
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{entry.closedBy}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </div>
    </TooltipProvider>
  );
}
