
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const categories = ["Pizzas", "Burgers", "Salades", "Pâtes", "Accompagnements", "Boissons", "Atiéké", "Sauces", "Plats Africains"];
const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500 KB

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
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        recipeNotes: '',
        image: '',
    });
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    const productsCollectionRef = collection(db, 'products');

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
            setProducts(fetchedProducts);
        }, (error) => {
            console.error("Erreur de snapshot Firestore:", error);
            toast({
                variant: "destructive",
                title: "Erreur de chargement",
                description: "Impossible de charger les produits. Vérifiez vos permissions Firestore.",
            });
        });

        return () => unsubscribe();
    }, [user, toast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                toast({
                    variant: "destructive",
                    title: "Image trop lourde",
                    description: `Veuillez sélectionner une image de moins de ${MAX_IMAGE_SIZE_BYTES / 1024} Ko.`,
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSelectChange = (value: string) => {
        if (value === 'Autre') {
            setShowCustomCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setShowCustomCategory(false);
            setCustomCategory('');
            setFormData(prev => ({ ...prev, category: value }));
        }
    }
    
    const resetForm = () => {
        setFormData({ name: '', category: '', price: '', stock: '', recipeNotes: '', image: '' });
        setCustomCategory('');
        setShowCustomCategory(false);
        setIsEditMode(false);
        setCurrentProduct(null);
    }
    
    const handleOpenDialog = (product: Product | null = null) => {
        if (product) {
            setIsEditMode(true);
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: String(product.price),
                stock: String(product.stock),
                recipeNotes: product.recipeNotes || '',
                image: product.image || '',
            });
            if (!categories.includes(product.category)) {
                setShowCustomCategory(true);
                setCustomCategory(product.category);
            }
        } else {
            resetForm();
            setIsEditMode(false);
        }
        setIsDialogOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteDoc(doc(db, 'products', productId));
            toast({ title: 'Succès', description: 'Le produit a été supprimé.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le produit.' });
            console.error("Error deleting document: ", error);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalCategory = showCustomCategory ? customCategory : formData.category;

        if (!formData.name || !finalCategory || !formData.price || !formData.stock) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs obligatoires." });
            return;
        }

        const productData = {
            name: formData.name,
            category: finalCategory,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            recipeNotes: formData.recipeNotes || '',
            image: formData.image || `https://placehold.co/40x40.png?text=${formData.name.charAt(0)}`
        };

        try {
            if (isEditMode && currentProduct) {
                await updateDoc(doc(db, 'products', currentProduct.id), productData);
                toast({ title: "Succès", description: "Le produit a été mis à jour." });
            } else {
                await addDoc(productsCollectionRef, productData);
                toast({ title: "Succès", description: "Le produit a été ajouté." });
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error writing document: ", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'enregistrer le produit." });
        }
    }


  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Produits</h1>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) resetForm();
            }}>
                <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Produit
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{isEditMode ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}</DialogTitle>
                            <DialogDescription>
                                Remplissez les détails du produit. Cliquez sur enregistrer lorsque vous avez terminé.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nom</Label>
                                <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Pizza Margherita" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Catégorie</Label>
                                <Select onValueChange={handleSelectChange} value={showCustomCategory ? 'Autre' : formData.category}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionnez une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                        <SelectItem value="Autre">Autre...</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {showCustomCategory && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="customCategory" className="text-right">Cat. Perso.</Label>
                                    <Input 
                                        id="customCategory" 
                                        value={customCategory} 
                                        onChange={(e) => setCustomCategory(e.target.value)} 
                                        placeholder="Entrez une catégorie" 
                                        className="col-span-3" />
                                </div>
                            )}
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Prix</Label>
                                <Input id="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="12.99" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">Stock</Label>
                                <Input id="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="50" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="recipeNotes" className="text-right">Notes de Recette</Label>
                                <Textarea id="recipeNotes" value={formData.recipeNotes} onChange={handleInputChange} placeholder="Détails de la recette, ingrédients, etc." className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="image" className="text-right">Image</Label>
                                <Input id="image" type="file" onChange={handleImageChange} accept="image/*" className="col-span-3" />
                            </div>
                             {formData.image && (
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Aperçu</Label>
                                    <div className="col-span-3">
                                        <Image src={formData.image} alt="Aperçu" width={60} height={60} className="rounded-md object-cover"/>
                                    </div>
                                 </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Enregistrer</Button>
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
                        alt={product.name || "Image du produit"}
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
                        <AlertDialog>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ouvrir le menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleOpenDialog(product)}>Modifier</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Supprimer</DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible et supprimera définitivement ce produit.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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

    