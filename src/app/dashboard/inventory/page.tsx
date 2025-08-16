'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, PlusCircle, MinusCircle, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const inventoryItems = [
  { id: 1, name: "Pâte à Pizza", category: "Ingrédients", stock: 80, maxStock: 100, unit: "kg" },
  { id: 2, name: "Sauce Tomate", category: "Ingrédients", stock: 50, maxStock: 100, unit: "litres" },
  { id: 3, name: "Fromage Mozzarella", category: "Ingrédients", stock: 25, maxStock: 50, unit: "kg" },
  { id: 4, name: "Steaks de Boeuf", category: "Ingrédients", stock: 120, maxStock: 200, unit: "unités" },
  { id: 5, name: "Pains à Burger", category: "Ingrédients", stock: 90, maxStock: 200, unit: "unités" },
  { id: 6, name: "Laitue", category: "Légumes", stock: 15, maxStock: 30, unit: "têtes" },
  { id: 7, name: "Canettes de Coca", category: "Boissons", stock: 180, maxStock: 240, unit: "canettes" },
];

export default function InventoryPage() {
    const [dialogType, setDialogType] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const openDialog = (type, item) => {
        setDialogType(type);
        setSelectedItem(item);
    }

    const closeDialog = () => {
        setDialogType(null);
        setSelectedItem(null);
    }
    
    const getDialogContent = () => {
        if (!selectedItem) return null;
        
        switch(dialogType) {
            case 'add':
                return (
                    <>
                        <DialogTitle>Ajouter du Stock</DialogTitle>
                        <DialogDescription>Ajouter du nouveau stock pour {selectedItem.name}. Stock actuel : {selectedItem.stock} {selectedItem.unit}.</DialogDescription>
                         <div className="grid gap-4 py-4">
                            <Label htmlFor="add-quantity">Quantité à Ajouter</Label>
                            <Input id="add-quantity" type="number" placeholder="0" />
                        </div>
                    </>
                );
            case 'use':
                 return (
                    <>
                        <DialogTitle>Utiliser du Stock</DialogTitle>
                        <DialogDescription>Enregistrer le stock utilisé pour {selectedItem.name}. Stock actuel : {selectedItem.stock} {selectedItem.unit}.</DialogDescription>
                         <div className="grid gap-4 py-4">
                            <Label htmlFor="use-quantity">Quantité à Utiliser</Label>
                            <Input id="use-quantity" type="number" placeholder="0" />
                        </div>
                    </>
                );
            case 'count':
                 return (
                    <>
                        <DialogTitle>Comptage Physique</DialogTitle>
                        <DialogDescription>Mettre à jour le stock pour {selectedItem.name} après un comptage physique. Stock actuel : {selectedItem.stock} {selectedItem.unit}.</DialogDescription>
                         <div className="grid gap-4 py-4">
                            <Label htmlFor="count-quantity">Nouvelle Quantité Totale</Label>
                            <Input id="count-quantity" type="number" placeholder={selectedItem.stock} />
                        </div>
                    </>
                );
            default:
                return null;
        }
    }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventaire</h1>
        <div className="flex gap-2">
            <Button variant="outline"><MinusCircle className="mr-2 h-4 w-4" /> Utiliser Stock</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Stock</Button>
            <Button variant="secondary"><CheckCircle className="mr-2 h-4 w-4" /> Comptage Physique</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Articles en Inventaire</CardTitle>
          <CardDescription>Suivez et gérez vos niveaux de stock.</CardDescription>
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
                        <Dialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Ouvrir le menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DialogTrigger asChild onClick={() => openDialog('add', item)}><DropdownMenuItem>Ajouter Stock</DropdownMenuItem></DialogTrigger>
                                <DialogTrigger asChild onClick={() => openDialog('use', item)}><DropdownMenuItem>Utiliser Stock</DropdownMenuItem></DialogTrigger>
                                <DialogTrigger asChild onClick={() => openDialog('count', item)}><DropdownMenuItem>Comptage Physique</DropdownMenuItem></DialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    {getDialogContent()}
                                </DialogHeader>
                                <DialogFooter>
                                    <Button type="submit">Enregistrer</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
