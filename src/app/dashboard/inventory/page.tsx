'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, PlusCircle, MinusCircle, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    maxStock: number;
    unit: string;
    lowStockThreshold: number;
}

export default function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'add' | 'use' | 'count' | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = useState('');
    const { toast } = useToast();

    const inventoryCollectionRef = collection(db, 'inventory');
    const notificationsCollectionRef = collection(db, 'notifications');

    useEffect(() => {
        const unsubscribe = onSnapshot(inventoryCollectionRef, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
            setInventoryItems(fetchedItems);
        }, (error) => {
            console.error("Erreur de snapshot Firestore pour l'inventaire:", error);
            toast({
                variant: "destructive",
                title: "Erreur de chargement",
                description: "Impossible de charger l'inventaire. Vérifiez vos permissions Firestore.",
            });
        });
        return () => unsubscribe();
    }, []);

    const openDialog = (type: 'add' | 'use' | 'count', item: InventoryItem) => {
        setDialogType(type);
        setSelectedItem(item);
        setIsDialogOpen(true);
        setQuantity('');
    }

    const closeDialog = () => {
        setIsDialogOpen(false);
        setDialogType(null);
        setSelectedItem(null);
        setQuantity('');
    }

    const handleNotification = async (item: InventoryItem, newStock: number) => {
        const threshold = item.maxStock * (item.lowStockThreshold || 0.2); // 20% par défaut
        if (newStock <= threshold && item.stock > threshold) {
            await addDoc(notificationsCollectionRef, {
                message: `Stock bas : ${item.name} est à ${newStock} ${item.unit}.`,
                type: 'stock',
                isRead: false,
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Alerte de Stock Bas",
                description: `Une notification a été générée pour ${item.name}.`,
            });
        }
    };
    
    const handleUpdateStock = async () => {
        if (!selectedItem || !quantity) return;

        const currentStock = selectedItem.stock;
        const amount = parseInt(quantity, 10);
        let newStock: number;

        if (dialogType === 'add') {
            newStock = currentStock + amount;
        } else if (dialogType === 'use') {
            newStock = currentStock - amount;
        } else if (dialogType === 'count') {
            newStock = amount;
        } else {
            return;
        }
        
        if (newStock < 0) {
            toast({ variant: 'destructive', title: 'Stock Négatif', description: 'Le stock ne peut pas être négatif.'});
            return;
        }

        const itemDocRef = doc(db, 'inventory', selectedItem.id);
        try {
            await updateDoc(itemDocRef, { stock: newStock });
            await handleNotification(selectedItem, newStock);
            toast({ title: 'Succès', description: `Stock de ${selectedItem.name} mis à jour.`});
            closeDialog();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le stock.'});
            console.error(error);
        }
    }

    const getDialogContent = () => {
        if (!selectedItem) return null;
        
        switch(dialogType) {
            case 'add':
                return {
                    title: "Ajouter du Stock",
                    description: `Ajouter du nouveau stock pour ${selectedItem.name}. Stock actuel : ${selectedItem.stock} ${selectedItem.unit}.`,
                    label: "Quantité à Ajouter",
                    placeholder: "0"
                };
            case 'use':
                 return {
                    title: "Utiliser du Stock",
                    description: `Enregistrer le stock utilisé pour ${selectedItem.name}. Stock actuel : ${selectedItem.stock} ${selectedItem.unit}.`,
                    label: "Quantité à Utiliser",
                    placeholder: "0"
                };
            case 'count':
                 return {
                    title: "Comptage Physique",
                    description: `Mettre à jour le stock pour ${selectedItem.name} après un comptage physique. Stock actuel : ${selectedItem.stock} ${selectedItem.unit}.`,
                    label: "Nouvelle Quantité Totale",
                    placeholder: String(selectedItem.stock)
                };
            default:
                return null;
        }
    }
    
    const dialogContent = getDialogContent();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventaire</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Articles en Inventaire</CardTitle>
          <CardDescription>Suivez et gérez vos niveaux de stock. Les données sont en temps réel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Niveau de Stock</TableHead>
                <TableHead className="text-right">Stock Actuel</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map(item => {
                const stockPercentage = (item.stock / item.maxStock) * 100;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Progress value={stockPercentage} className="w-[60%]" />
                    </TableCell>
                    <TableCell className="text-right">{item.stock} / {item.maxStock} {item.unit}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => openDialog('add', item)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Ajouter Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDialog('use', item)}>
                                <MinusCircle className="mr-2 h-4 w-4"/> Utiliser Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDialog('count', item)}>
                                <CheckCircle className="mr-2 h-4 w-4"/> Comptage Physique
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{dialogContent?.title}</DialogTitle>
                <DialogDescription>{dialogContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="quantity">{dialogContent?.label}</Label>
                <Input 
                    id="quantity" 
                    type="number" 
                    placeholder={dialogContent?.placeholder} 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateStock}>Enregistrer</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}
