
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth, AppUser } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProfile } from "firebase/auth";

const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'XOF'];
const languages = [{value: 'fr', label: 'Français'}, {value: 'en', label: 'English'}];

export default function SettingsPage() {
    const { user, loading, refetchUser } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
    });
    const [restaurantData, setRestaurantData] = useState({
        name: '',
        address: '',
        phone: '',
        currency: 'EUR',
        language: 'fr',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.displayName || '',
                email: user.email || '',
            });
            setRestaurantData({
                name: user.restaurantName || '',
                address: user.restaurantAddress || '',
                phone: user.restaurantPhone || '',
                currency: user.currency || 'EUR',
                language: user.language || 'fr',
            })
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfileData(prev => ({...prev, [id]: value }));
    }

    const handleRestaurantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setRestaurantData(prev => ({...prev, [id]: value }));
    }
     const handleSelectChange = (id: string, value: string) => {
        setRestaurantData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            // Update Firestore document
            await updateDoc(userDocRef, {
                name: profileData.name,
                restaurantName: restaurantData.name,
                restaurantAddress: restaurantData.address,
                restaurantPhone: restaurantData.phone,
                currency: restaurantData.currency,
                language: restaurantData.language,
            });

            // Update Auth profile (displayName)
            if (user.displayName !== profileData.name) {
                await updateProfile(user, { displayName: profileData.name });
            }
            
            // Optional: force a refresh of the user data in the context
            if (refetchUser) await refetchUser();
            
            toast({
                title: "Paramètres enregistrés",
                description: "Vos informations ont été mises à jour avec succès.",
            });

        } catch (error) {
            console.error("Erreur lors de la mise à jour des paramètres:", error);
            toast({
                variant: 'destructive',
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement."
            });
        } finally {
            setIsSaving(false);
        }
    }


  if (loading || !user) {
      return <p>Chargement des paramètres...</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profil Administrateur</CardTitle>
          <CardDescription>Gérez vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" value={profileData.name} onChange={handleProfileChange} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" value={profileData.email} disabled />
                 <p className="text-xs text-muted-foreground">L'adresse e-mail ne peut pas être modifiée.</p>
            </div>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Informations du Restaurant</CardTitle>
          <CardDescription>Détails publics de votre restaurant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid gap-2">
                <Label htmlFor="name">Nom du restaurant</Label>
                <Input id="name" value={restaurantData.name} onChange={handleRestaurantChange} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Adresse du restaurant</Label>
                <Input id="address" value={restaurantData.address} onChange={handleRestaurantChange} placeholder="123 Rue Principale, Paris, France" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input id="phone" value={restaurantData.phone} onChange={handleRestaurantChange} placeholder="+33 1 23 45 67 89" />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="currency">Devise</Label>
                     <Select value={restaurantData.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                        <SelectTrigger id="currency"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {currencies.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={restaurantData.language} onValueChange={(v) => handleSelectChange('language', v)}>
                        <SelectTrigger id="language"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {languages.map(l => (
                                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <div className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
       </div>
    </div>
  );
}
