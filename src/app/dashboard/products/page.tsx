'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

const categories = ["Pizzas", "Burgers", "Salades", "Pâtes", "Accompagnements", "Boissons"];

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    recipeNotes?: string;
    image?: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        recipeNotes: '',
    });
    const { toast } = useToast();
    const productsCollectionRef = collection(db, 'products');

    useEffect(() => {
        const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
            setProducts(fetchedProducts);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setNewProduct(prev => ({...prev, [id]: value }));
    }

    const handleSelectChange = (value: string) => {
        setNewProduct(prev => ({ ...prev, category: value }));
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs obligatoires." });
            return;
        }

        try {
            await addDoc(productsCollectionRef, {
                name: newProduct.name,
                category: newProduct.category,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock, 10),
                recipeNotes: newProduct.recipeNotes || '',
                image: `https://placehold.co/40x40.png?text=${newProduct.name.charAt(0)}`
            });
            toast({ title: "Succès", description: "Le produit a été ajouté." });
            setIsDialogOpen(false);
            setNewProduct({ name: '', category: '', price: '', stock: '', recipeNotes: '' }); // Reset form
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter le produit." });
        }
    }


  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Produits</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Produit
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Ajouter un Nouveau Produit</DialogTitle>
                            <DialogDescription>
                                Remplissez les détails du nouveau produit. Cliquez sur enregistrer lorsque vous avez terminé.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nom</Label>
                                <Input id="name" value={newProduct.name} onChange={handleInputChange} placeholder="Pizza Margherita" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Catégorie</Label>
                                <Select onValueChange={handleSelectChange} value={newProduct.category}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionnez une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Prix</Label>
                                <Input id="price" type="number" value={newProduct.price} onChange={handleInputChange} placeholder="12.99" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">Stock Initial</Label>
                                <Input id="stock" type="number" value={newProduct.stock} onChange={handleInputChange} placeholder="50" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="image" className="text-right">Image</Label>
                                 <Input id="image" type="file" className="col-span-3" disabled />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="recipeNotes" className="text-right">Notes de Recette</Label>
                                <Textarea id="recipeNotes" value={newProduct.recipeNotes} onChange={handleInputChange} placeholder="Détails de la recette, ingrédients, etc." className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Enregistrer le produit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits</CardTitle>
          <CardDescription>Gérez vos produits et leurs détails.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Aucun produit trouvé. Ajoutez-en un pour commencer !
                    </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                    <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                        alt="Image du produit"
                        className="aspect-square rounded-md object-cover"
                        height="40"
                        src={product.image || "https://placehold.co/40x40.png"}
                        width="40"
                        data-ai-hint="product image"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{product.stock} en stock</TableCell>
                    <TableCell>{product.price.toFixed(2)} €</TableCell>
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
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>Voir les variantes</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
