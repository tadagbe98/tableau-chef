'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, CreditCard, Smartphone, AlertCircle, TrendingUp, TrendingDown, CheckCircle, UserCircle, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const dailySummary = {
    totalSales: 2450.75,
    cashSales: 875.50,
    cardSales: 1250.25,
    mobileSales: 325.00,
    orders: 85,
    discounts: 75.20,
    taxes: 181.54,
};

const currentUser = {
    name: "Jean Dupont",
    role: "Admin"
};

const isAuthorized = currentUser.role === 'Admin' || currentUser.role === 'Caissier';

export default function DailyPointPage() {
    const [cashInDrawer, setCashInDrawer] = useState('');
    const [openingCash, setOpeningCash] = useState('');
    const [variance, setVariance] = useState(null);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [openedBy, setOpenedBy] = useState(null);
    const [openTime, setOpenTime] = useState(null);

    const { toast } = useToast();

    const handleOpenRegister = () => {
        if (!isAuthorized) {
            toast({
                variant: 'destructive',
                title: 'Accès Refusé',
                description: "Vous n'avez pas la permission d'ouvrir la caisse.",
            });
            return;
        }
        if (!openingCash) {
            toast({
                variant: 'destructive',
                title: 'Saisie Manquante',
                description: 'Veuillez entrer le fonds de caisse initial.',
            });
            return;
        }
        setIsRegisterOpen(true);
        setOpenedBy(currentUser.name);
        setOpenTime(new Date());
        toast({
            title: "Caisse Ouverte",
            description: `La caisse a été ouverte par ${currentUser.name} avec un fonds de ${parseFloat(openingCash).toFixed(2)} €.`
        });
    };

    const expectedCash = dailySummary.cashSales + parseFloat(openingCash || 0);

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

    const handleClosePoint = () => {
         if (!isAuthorized) {
            toast({
                variant: 'destructive',
                title: 'Accès Refusé',
                description: "Vous n'avez pas la permission de fermer la caisse.",
            });
            return;
        }
        calculateVariance();
        if(cashInDrawer) {
            setIsRegisterOpen(false);
            setOpeningCash('');
            setCashInDrawer('');
            setVariance(null);
            setOpenedBy(null);
            setOpenTime(null);
            toast({
                title: "Point de Vente Fermé",
                description: `Le journal d'aujourd'hui a été créé et la caisse fermée par ${currentUser.name}.`
            });
        }
    }

  return (
    <TooltipProvider>
    <div className="max-w-4xl mx-auto">
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
                        <p className="font-medium">{currentUser.name} <Badge variant="secondary">{currentUser.role}</Badge></p>
                    </div>
                </div>
                <div>
                    <Label htmlFor="opening-cash">Fonds de Caisse Initial</Label>
                    <Input 
                        id="opening-cash"
                        type="number"
                        placeholder="Entrer le montant"
                        value={openingCash}
                        onChange={(e) => setOpeningCash(e.target.value)}
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
                <Input value={`${parseFloat(openingCash).toFixed(2)} €`} disabled />
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
                    onChange={(e) => setCashInDrawer(e.target.value)}
                    disabled={!isAuthorized}
                />
                </div>
            </CardContent>
            <CardFooter>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <div className="w-full">
                           <Button onClick={calculateVariance} className="w-full" disabled={!isAuthorized}>
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
                            <Button size="lg" className="w-full" onClick={handleClosePoint} disabled={!isAuthorized}>
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
    </div>
    </TooltipProvider>
  );
}
