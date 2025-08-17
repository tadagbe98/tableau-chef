
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'XOF'];

export default function AddRestaurantForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    adminName: '',
    email: '',
    password: '',
    currency: 'EUR',
  });
  const [loading, setLoading] = useState(false);
  const { createRestaurantWithAdmin } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
  };

  const resetForm = () => {
    setFormData({
      restaurantName: '',
      adminName: '',
      email: '',
      password: '',
      currency: 'EUR',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantName || !formData.adminName || !formData.email || !formData.password) {
      toast({ variant: 'destructive', title: 'Champs manquants', description: 'Veuillez remplir tous les champs.' });
      return;
    }
     if (formData.password.length < 6) {
      toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }

    setLoading(true);
    try {
      await createRestaurantWithAdmin(formData.email, formData.password, formData.adminName, formData.restaurantName, formData.currency);
      toast({
        title: 'Succès !',
        description: `Le restaurant "${formData.restaurantName}" et son administrateur ont été créés.`,
      });
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      let description = "Une erreur est survenue.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Cet e-mail est déjà utilisé par un autre compte.";
      }
      toast({
        variant: 'destructive',
        title: 'Erreur de Création',
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Restaurant</DialogTitle>
            <DialogDescription>
              Cela créera un nouveau restaurant et le compte administrateur associé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="restaurantName">Nom du Restaurant</Label>
              <Input id="restaurantName" value={formData.restaurantName} onChange={handleInputChange} placeholder="Chez Fifi" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adminName">Nom Complet de l'Admin</Label>
              <Input id="adminName" value={formData.adminName} onChange={handleInputChange} placeholder="Tadagbe Massolokonon" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email de l'Admin</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="fifi@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de Passe Initial</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="currency">Devise par Défaut</Label>
                <Select onValueChange={handleCurrencyChange} defaultValue={formData.currency}>
                    <SelectTrigger id="currency"><SelectValue/></SelectTrigger>
                    <SelectContent>
                         {currencies.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer le Restaurant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
