
'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, MinusCircle, CreditCard, Smartphone, DollarSign, ShoppingBasket, Printer, ChefHat, Plus, AlertCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, onSnapshot, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/app/dashboard/products/page';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const tables = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `T${i + 1}`, status: 'disponible' }));

interface OrderItem extends Product {
    quantity: number;
}

function OrdersContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tout"]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState("Sur place");
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | string | null>(null);
  const [orderNumber, setOrderNumber] = useState(Math.floor(Math.random() * 1000) + 125);
  const [isTableInputDialogOpen, setIsTableInputDialogOpen] = useState(false);
  const [manualTableNumber, setManualTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const currency = user?.currency || 'EUR';


  const { toast } = useToast();
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const kitchenTicketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.restaurantName) return;
    const q = query(collection(db, 'products'), where("restaurantName", "==", user.restaurantName));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        setProducts(fetchedProducts);

        const fetchedCategories = ["Tout", ...Array.from(new Set(fetchedProducts.map(p => p.category)))];
        setCategories(fetchedCategories);
    }, (error) => {
        console.error("Erreur de chargement des produits:", error);
        toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les produits depuis la base de données.",
        });
    });

    return () => unsubscribe();
  }, [toast, user]);
  
  const handlePrint = (contentRef: React.RefObject<HTMLDivElement>) => {
    const content = contentRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Imprimer</title>');
        printWindow.document.write('<style>body { font-family: monospace; margin: 20px; } .receipt-logo { max-width: 100px; height: auto; margin-bottom: 1rem; } .text-center { text-align: center; } .mb-6 { margin-bottom: 1.5rem; } .mb-4 { margin-bottom: 1rem; } .mb-2 { margin-bottom: 0.5rem; } .h-12 { height: 3rem; } .w-12 { width: 3rem; } .mx-auto { margin-left: auto; margin-right: auto; } .text-2xl { font-size: 1.5rem; line-height: 2rem; } .font-bold { font-weight: 700; } .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; } .text-sm { font-size: 0.875rem; line-height: 1.25rem; } .flex { display: flex; } .justify-between { justify-content: space-between; } .my-4 { margin-top: 1rem; margin-bottom: 1rem; } .border-dashed { border-style: dashed; } .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; } .text-base { font-size: 1rem; line-height: 1.5rem; } .mt-6 { margin-top: 1.5rem; } .text-xl { font-size: 1.25rem; line-height: 1.75rem; } .text-lg { font-size: 1.125rem; line-height: 1.75rem; } .font-semibold { font-weight: 600; } .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; } .border-black { border-color: #000; } hr { border-width: 0; border-top-width: 1px; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };
  
  const handlePrintReceipt = () => handlePrint(receiptRef);
  const handlePrintKitchenTicket = () => handlePrint(kitchenTicketRef);


  const addToOrder = (product: Product) => {
    setOrderItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(currentItems => currentItems.filter(item => item.id !== productId));
    } else {
      setOrderItems(currentItems =>
        currentItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.20; // Assuming 20% tax for France
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Commande Vide",
        description: "Veuillez ajouter des articles à la commande avant de la valider.",
      });
      return;
    }
    if (orderType === 'Sur place' && !selectedTable) {
        toast({
            variant: "destructive",
            title: "Aucune Table Sélectionnée",
            description: "Veuillez sélectionner une table pour une commande 'Sur place'.",
        });
        return;
    }
    setIsPaymentDialogOpen(true);
  };
  
  const handlePayment = async (method: string) => {
    if (!user || !user.restaurantName) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non connecté ou restaurant non défini.' });
        return;
    }
    setPaymentMethod(method);

    try {
        const orderData = {
            orderNumber: orderNumber,
            customer: orderType === 'Sur place' ? `Table ${selectedTable}` : orderType,
            status: 'Nouvelle', // Initial status
            total: total,
            items: orderItems.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
            createdAt: serverTimestamp(),
            createdBy: user.displayName || user.email,
            restaurantName: user.restaurantName,
            paymentMethod: method,
            type: orderType,
        };
        
        await addDoc(collection(db, 'orders'), orderData);
        
        console.log(`Payé avec ${method}`);
        setIsPaymentDialogOpen(false);
        setIsReceiptDialogOpen(true);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de la commande:", error);
        toast({
            variant: "destructive",
            title: "Erreur de Sauvegarde",
            description: "Impossible d'enregistrer la commande. Veuillez réessayer."
        });
    }
  }

  const handleNewOrder = () => {
    setOrderItems([]);
    setSelectedTable(null);
    setOrderNumber(Math.floor(Math.random() * 1000) + 125);
    setIsReceiptDialogOpen(false);
    toast({
      title: "Nouvelle Commande Créée",
      description: "Vous pouvez maintenant ajouter des articles à la nouvelle commande.",
    })
  }

  const handleSelectManualTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTableNumber.trim()) {
      setSelectedTable(manualTableNumber.trim());
      setIsTableInputDialogOpen(false);
      setManualTableNumber('');
    }
  };

  const filteredProducts = activeCategory === "Tout"
    ? products
    : products.filter(p => p.category === activeCategory);
    
  const getOrderTitle = () => {
    if (orderType === 'Sur place') {
      return selectedTable ? `Commande: Table ${selectedTable}` : 'Commande: Sélectionnez une table';
    }
    return `Commande: ${orderType}`;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold mb-4">Point de Vente</h1>
            {orderType === 'Sur place' && (
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Plan de Salle</h2>
                    <div className="grid grid-cols-6 gap-2">
                        {tables.map(table => (
                            <Button 
                                key={table.id}
                                variant={selectedTable === table.id ? 'default' : 'outline'}
                                onClick={() => setSelectedTable(table.id)}
                            >
                                {table.name}
                            </Button>
                        ))}
                        <Dialog open={isTableInputDialogOpen} onOpenChange={setIsTableInputDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleSelectManualTable}>
                                    <DialogHeader>
                                        <DialogTitle>Entrer le numéro de table</DialogTitle>
                                        <DialogDescription>
                                            Saisissez le numéro de la table pour les commandes personnalisées.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Label htmlFor="table-number">Numéro de Table</Label>
                                        <Input
                                            id="table-number"
                                            value={manualTableNumber}
                                            onChange={(e) => setManualTableNumber(e.target.value)}
                                            placeholder="Ex: 25, A3, ..."
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Sélectionner la Table</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {categories.map(category => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? 'default' : 'outline'}
                        onClick={() => setActiveCategory(category)}
                        className="flex-shrink-0"
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
        <div className="flex-grow overflow-auto mt-4 pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
                <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => addToOrder(product)}>
                <CardContent className="p-0">
                    <Image src={product.image || 'https://placehold.co/300x200.png'} alt={product.name} width={300} height={200} className="rounded-t-lg object-cover aspect-video" data-ai-hint="product image" />
                    <div className="p-3">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-muted-foreground text-sm">{product.price.toFixed(2)} {currency}</p>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>
      </div>
      {/* Current Order */}
      <div className="lg:col-span-1 h-full">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{getOrderTitle()}</CardTitle>
            <div className="flex items-center gap-2 pt-2">
              {['Sur place', 'À emporter', 'Livraison'].map(type => (
                <Button key={type} size="sm" variant={orderType === type ? "default" : "outline"} onClick={() => setOrderType(type)}>
                  {type}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingBasket className="w-16 h-16 mb-4" />
                <p>Aucun article dans la commande</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map(item => (
                  <div key={item.id} className="flex items-center">
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} {currency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="w-16 text-right font-medium">{(item.price * item.quantity).toFixed(2)} {currency}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {orderItems.length > 0 && (
            <CardFooter className="flex-col !p-4 !mt-auto border-t">
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{tax.toFixed(2)} {currency}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total.toFixed(2)} {currency}</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handlePlaceOrder}>
                Valider la commande
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement de la Commande</DialogTitle>
            <DialogDescription>Montant total : <span className="font-bold text-foreground">{total.toFixed(2)} {currency}</span></DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePayment('Espèces')}>
                <DollarSign /> Espèces
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePayment('Carte')}>
                <CreditCard /> Carte
            </Button>
             <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePayment('Mobile')}>
                <Smartphone /> Mobile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">Paiement Réussi</DialogTitle>
             <DialogDescription className="text-center">
                Que souhaitez-vous faire maintenant ?
            </DialogDescription>
          </DialogHeader>
           <DialogFooter className="sm:justify-center pt-4 gap-2">
            <Button onClick={handlePrintReceipt}><Printer className="mr-2 h-4 w-4"/>Reçu Client</Button>
            <Button variant="secondary" onClick={handlePrintKitchenTicket}><ChefHat className="mr-2 h-4 w-4"/>Ticket Cuisine</Button>
            <Button variant="outline" onClick={handleNewOrder}><PlusCircle className="mr-2 h-4 w-4" />Commande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Printable Components */}
      <div className="hidden">
        <div ref={receiptRef}>
            <div className="text-center mb-6">
                {user?.restaurantLogo && <img src={user.restaurantLogo} alt="Restaurant Logo" className="mx-auto receipt-logo"/>}
                <h2 className="text-2xl font-bold">{user?.restaurantName || 'TableauChef'}</h2>
                 <p className="text-sm">{user?.restaurantAddress}</p>
                 <p className="text-sm">{user?.restaurantPhone}</p>
                 <p className="text-sm">{new Date().toLocaleString('fr-FR')}</p>
            </div>
            <div className="text-center mb-4">
              <p className="font-bold">Commande #{orderNumber}</p>
              {orderType === 'Sur place' && selectedTable && <p>Table: {selectedTable}</p>}
            </div>
            <div className="space-y-2 text-sm">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity} x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} {currency}</span>
                  </div>
                ))}
            </div>
            <hr className="my-4 border-dashed" />
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{tax.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{total.toFixed(2)} {currency}</span>
                </div>
            </div>
             <div className="text-center mt-6 space-y-1 text-sm">
                <p>Payé en {paymentMethod}</p>
                <p>Merci de votre visite et à bientôt !</p>
            </div>
        </div>
        <div ref={kitchenTicketRef}>
             <div className="text-center mb-4">
                <h2 className="text-xl font-bold">NOUVELLE COMMANDE</h2>
                <p className="text-lg">{new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
             <div className="text-left">
                <p className="text-lg font-semibold">Commande #{orderNumber}</p>
                <p className="text-lg font-semibold">Type: {orderType} {orderType === 'Sur place' && selectedTable ? `- T${selectedTable}`: ''}</p>
            </div>
            <hr className="my-3 border-dashed border-black" />
            <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.id} className="text-lg">
                    <span className="font-bold text-xl">{item.quantity}x</span> {item.name}
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { user, isRegisterOpen } = useAuth();
  
  if (user?.role === 'Caissier' && !isRegisterOpen) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <CardTitle>Caisse Fermée</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Vous devez ouvrir la caisse avant de pouvoir prendre des commandes.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/daily-point">Ouvrir la caisse</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return <OrdersContent />;
}
 
    

    