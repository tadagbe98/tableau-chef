
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, PlusCircle, MinusCircle, CheckCircle, Lock, PackagePlus, PackageMinus, ListOrdered } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, where, getDocs, writeBatch, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";


interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    maxStock: number;
    unit: string;
    lowStockThreshold: number;
}

interface InventoryLog {
    id: string;
    itemName: string;
    quantityChange: number;
    newStock: number;
    type: 'add' | 'use' | 'count';
    userName: string;
    timestamp: { seconds: number; nanoseconds: number };
}


export default function InventoryPage() {
    const { user } = useAuth();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'add' | 'use' | 'count' | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = useState('');
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        stock: '',
        maxStock: '',
        unit: '',
        lowStockThreshold: '20',
    });
    const { toast } = useToast();
    const isAuthorized = user?.role === 'Admin' || user?.role === 'Gestionnaire de Stock';

    const inventoryCollectionRef = collection(db, 'inventory');
    const notificationsCollectionRef = collection(db, 'notifications');
    const logsCollectionRef = collection(db, 'inventory_logs');

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
    }, [toast]);
    
    useEffect(() => {
        if (user?.role === 'Admin') {
            const q = query(logsCollectionRef, orderBy('timestamp', 'desc'), limit(15));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedLogs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryLog));
                setInventoryLogs(fetchedLogs);
            }, (error) => {
                console.error("Erreur de chargement des logs d'inventaire:", error);
                toast({
                    variant: "destructive",
                    title: "Erreur de chargement",
                    description: "Impossible de charger l'historique de l'inventaire.",
                });
            });
            return () => unsubscribe();
        }
    }, [user, toast]);

    const openUpdateDialog = (type: 'add' | 'use' | 'count', item: InventoryItem) => {
        if (!isAuthorized) return;
        setDialogType(type);
        setSelectedItem(item);
        setIsUpdateDialogOpen(true);
        setQuantity('');
    }

    const closeUpdateDialog = () => {
        setIsUpdateDialogOpen(false);
        setDialogType(null);
        setSelectedItem(null);
        setQuantity('');
    }

    const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewItem(prev => ({ ...prev, [id]: value }));
    };

    const handleAddNewItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, category, stock, maxStock, unit, lowStockThreshold } = newItem;
        if (!name || !category || !stock || !maxStock || !unit) {
            toast({ variant: 'destructive', title: 'Champs Manquants', description: 'Veuillez remplir tous les champs.' });
            return;
        }

        try {
            await addDoc(inventoryCollectionRef, {
                name,
                category,
                stock: Number(stock),
                maxStock: Number(maxStock),
                unit,
                lowStockThreshold: Number(lowStockThreshold),
            });
            toast({ title: 'Succès', description: `L'article ${name} a été ajouté à l'inventaire.` });
            setIsAddDialogOpen(false);
            setNewItem({ name: '', category: '', stock: '', maxStock: '', unit: '', lowStockThreshold: '20' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter l\'article.' });
            console.error(error);
        }
    };

    const handleNotification = async (itemBeforeUpdate: InventoryItem, newStock: number) => {
        const thresholdValue = itemBeforeUpdate.maxStock * (itemBeforeUpdate.lowStockThreshold / 100);

        // Stock goes from OK to LOW
        if (newStock <= thresholdValue && itemBeforeUpdate.stock > thresholdValue) {
            await addDoc(notificationsCollectionRef, {
                message: `Stock bas : ${itemBeforeUpdate.name} est à ${newStock} ${itemBeforeUpdate.unit}.`,
                type: 'stock',
                isRead: false,
                createdAt: serverTimestamp(),
                productId: itemBeforeUpdate.id,
            });
            toast({
                title: "Alerte de Stock Bas",
                description: `Une notification a été générée pour ${itemBeforeUpdate.name}.`,
            });
        }
        
        // Stock goes from LOW to OK
        if (newStock > thresholdValue && itemBeforeUpdate.stock <= thresholdValue) {
             const q = query(notificationsCollectionRef, where("productId", "==", itemBeforeUpdate.id), where("isRead", "==", false));
             const querySnapshot = await getDocs(q);
             if (!querySnapshot.empty) {
                const batch = writeBatch(db);
                querySnapshot.forEach(doc => {
                    batch.update(doc.ref, { isRead: true });
                });
                await batch.commit();
                console.log(`Notifications pour ${itemBeforeUpdate.name} marquées comme lues.`);
             }
        }
    };
    
    const handleUpdateStock = async () => {
        if (!selectedItem || !quantity || !user) return;

        const currentStock = selectedItem.stock;
        const amount = parseInt(quantity, 10);
        let newStock: number;
        let quantityChange = 0;

        if (dialogType === 'add') {
            newStock = currentStock + amount;
            quantityChange = amount;
        } else if (dialogType === 'use') {
            newStock = currentStock - amount;
            quantityChange = -amount;
        } else if (dialogType === 'count') {
            newStock = amount;
            quantityChange = amount - currentStock; // Represents the adjustment
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
            await addDoc(logsCollectionRef, {
                itemId: selectedItem.id,
                itemName: selectedItem.name,
                quantityChange: quantityChange,
                newStock: newStock,
                type: dialogType,
                userId: user.uid,
                userName: user.displayName || 'Inconnu',
                timestamp: serverTimestamp(),
            });

            await handleNotification(selectedItem, newStock);
            toast({ title: 'Succès', description: `Stock de ${selectedItem.name} mis à jour.`});
            closeUpdateDialog();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le stock.'});
            console.error(error);
        }
    }

    const getUpdateDialogContent = () => {
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
    
    const updateDialogContent = getUpdateDialogContent();

  return (
    <TooltipProvider>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Inventaire</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div tabIndex={isAuthorized ? undefined : 0}>
                            <DialogTrigger asChild>
                                <Button disabled={!isAuthorized}>
                                    { !isAuthorized && <Lock className="mr-2 h-4 w-4" /> }
                                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article
                                </Button>
                            </DialogTrigger>
                        </div>
                    </TooltipTrigger>
                    {!isAuthorized && (
                        <TooltipContent>
                            <p>Seuls les Admins et Gestionnaires de Stock peuvent ajouter des articles.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajouter un Nouvel Article à l'Inventaire</DialogTitle>
                        <DialogDescription>
                            Remplissez les détails du nouvel article à suivre.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddNewItem} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nom</Label>
                            <Input id="name" value={newItem.name} onChange={handleNewItemChange} className="col-span-3" placeholder="Ex: Farine de blé" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Catégorie</Label>
                            <Input id="category" value={newItem.category} onChange={handleNewItemChange} className="col-span-3" placeholder="Ex: Épicerie" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">Stock Actuel</Label>
                            <Input id="stock" type="number" value={newItem.stock} onChange={handleNewItemChange} className="col-span-3" placeholder="0" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maxStock" className="text-right">Stock Idéal (Max)</Label>
                            <Input id="maxStock" type="number" value={newItem.maxStock} onChange={handleNewItemChange} className="col-span-3" placeholder="100" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">Unité</Label>
                            <Input id="unit" value={newItem.unit} onChange={handleNewItemChange} className="col-span-3" placeholder="kg, L, unités..." />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lowStockThreshold" className="text-right">Seuil d'Alerte (%)</Label>
                            <Input id="lowStockThreshold" type="number" value={newItem.lowStockThreshold} onChange={handleNewItemChange} className="col-span-3" />
                        </div>
                         <DialogFooter>
                            <Button type="submit">Enregistrer l'Article</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
                    const stockPercentage = item.maxStock > 0 ? (item.stock / item.maxStock) * 100 : 0;
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
                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!isAuthorized}>
                                    { !isAuthorized && <Lock className="h-4 w-4" /> }
                                    { isAuthorized && <MoreHorizontal className="h-4 w-4" /> }
                                    <span className="sr-only">Ouvrir le menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                            {isAuthorized && (
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions de Stock</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => openUpdateDialog('add', item)}>
                                        <PlusCircle className="mr-2 h-4 w-4"/> Ajouter Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openUpdateDialog('use', item)}>
                                        <MinusCircle className="mr-2 h-4 w-4"/> Utiliser Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openUpdateDialog('count', item)}>
                                        <CheckCircle className="mr-2 h-4 w-4"/> Comptage Physique
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                            )}
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>

      {user?.role === 'Admin' && (
        <Card>
            <CardHeader>
                <CardTitle>Historique des Mouvements</CardTitle>
                <CardDescription>Derniers mouvements de stock enregistrés.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Article</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Par</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventoryLogs.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Aucun mouvement de stock enregistré.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inventoryLogs.map(log => {
                                const actionDetails = {
                                    add: { icon: PackagePlus, text: `+${log.quantityChange}`, color: 'text-green-500' },
                                    use: { icon: PackageMinus, text: `${log.quantityChange}`, color: 'text-orange-500' },
                                    count: { icon: ListOrdered, text: `Ajust: ${log.quantityChange > 0 ? '+':''}${log.quantityChange}`, color: 'text-blue-500' }
                                };
                                const details = actionDetails[log.type];
                                return (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.itemName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={details.color}>
                                            <details.icon className="mr-2 h-3.5 w-3.5" />
                                            {details.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.userName}</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        {log.timestamp ? formatDistanceToNow(new Date(log.timestamp.seconds * 1000), { addSuffix: true, locale: fr }) : '...'}
                                    </TableCell>
                                </TableRow>
                            )})
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
      
      <Dialog open={isUpdateDialogOpen} onOpenChange={closeUpdateDialog}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{updateDialogContent?.title}</DialogTitle>
                <DialogDescription>{updateDialogContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="quantity">{updateDialogContent?.label}</Label>
                <Input 
                    id="quantity" 
                    type="number" 
                    placeholder={updateDialogContent?.placeholder} 
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
    </TooltipProvider>
  );
}

    