'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const dailySummary = {
    totalSales: 2450.75,
    cashSales: 875.50,
    cardSales: 1250.25,
    mobileSales: 325.00,
    orders: 85,
    discounts: 75.20,
    taxes: 181.54,
};

export default function DailyPointPage() {
    const [cashInDrawer, setCashInDrawer] = useState('');
    const [variance, setVariance] = useState(null);
    const { toast } = useToast();

    const calculateVariance = () => {
        if (!cashInDrawer) {
            toast({
                variant: 'destructive',
                title: 'Saisie Manquante',
                description: 'Veuillez entrer le montant en espèces dans le tiroir-caisse.',
            });
            return;
        }
        const diff = parseFloat(cashInDrawer) - dailySummary.cashSales;
        setVariance(diff);
    };

    const handleClosePoint = () => {
        calculateVariance();
        if(cashInDrawer) {
            toast({
                title: "Point de Vente Fermé",
                description: "Le journal d'aujourd'hui a été créé et sauvegardé."
            });
        }
    }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Point Journalier</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Résumé des Ventes Journalières</CardTitle>
                <CardDescription>Revue des activités financières du jour.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Ventes Totales</p>
                    <p className="text-2xl font-bold">${dailySummary.totalSales.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Commandes Totales</p>
                    <p className="text-2xl font-bold">{dailySummary.orders}</p>
                </div>
                 <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Réductions Totales</p>
                    <p className="text-2xl font-bold">${dailySummary.discounts.toFixed(2)}</p>
                </div>
                 <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxes Totales</p>
                    <p className="text-2xl font-bold">${dailySummary.taxes.toFixed(2)}</p>
                </div>
            </CardContent>
            <CardContent>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full"><DollarSign className="text-primary"/></div>
                        <div>
                            <p className="text-muted-foreground">Ventes en Espèces</p>
                            <p className="font-semibold text-lg">${dailySummary.cashSales.toFixed(2)}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full"><CreditCard className="text-primary"/></div>
                        <div>
                            <p className="text-muted-foreground">Ventes par Carte</p>
                            <p className="font-semibold text-lg">${dailySummary.cardSales.toFixed(2)}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full"><Smartphone className="text-primary"/></div>
                        <div>
                            <p className="text-muted-foreground">Paiement Mobile</p>
                            <p className="font-semibold text-lg">${dailySummary.mobileSales.toFixed(2)}</p>
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
              <Label>Espèces Attendues en Caisse</Label>
              <Input value={`$${dailySummary.cashSales.toFixed(2)}`} disabled />
            </div>
            <div>
              <Label htmlFor="cash-in-drawer">Espèces Réelles en Caisse</Label>
              <Input 
                id="cash-in-drawer" 
                type="number" 
                placeholder="Entrer le montant" 
                value={cashInDrawer}
                onChange={(e) => setCashInDrawer(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={calculateVariance} className="w-full">Calculer l'Écart</Button>
          </CardFooter>
        </Card>

        <Card className={variance === null ? 'flex items-center justify-center' : ''}>
           {variance !== null ? (
            <>
                <CardHeader>
                    <CardTitle>Résultat de l'Écart de Caisse</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`p-4 rounded-lg text-center ${variance === 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                        <p className="text-sm font-medium">Écart</p>
                        <p className={`text-3xl font-bold ${variance === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {variance >= 0 ? '+' : ''}${variance.toFixed(2)}
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
            <Button size="lg" className="w-full" onClick={handleClosePoint}>Fermer le Point de Vente & Créer le Journal</Button>
        </div>
      </div>
    </div>
  );
}
