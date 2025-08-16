'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, MinusCircle, Trash2, CreditCard, Smartphone, DollarSign, X, ShoppingBasket } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const products = [
  { id: 1, name: "Pizza Margherita", price: 12.99, image: "https://placehold.co/300x200.png", category: "Pizzas", "data-ai-hint": "pizza food" },
  { id: 2, name: "Cheeseburger", price: 8.99, image: "https://placehold.co/300x200.png", category: "Burgers", "data-ai-hint": "burger food" },
  { id: 3, name: "Salade César", price: 7.50, image: "https://placehold.co/300x200.png", category: "Salades", "data-ai-hint": "salad food" },
  { id: 4, name: "Spaghetti Carbonara", price: 14.00, image: "https://placehold.co/300x200.png", category: "Pâtes", "data-ai-hint": "pasta food" },
  { id: 5, name: "Frites", price: 3.99, image: "https://placehold.co/300x200.png", category: "Accompagnements", "data-ai-hint": "fries food" },
  { id: 6, name: "Coca-Cola", price: 1.99, image: "https://placehold.co/300x200.png", category: "Boissons", "data-ai-hint": "soda drink" },
  { id: 7, name: "Pizza Pepperoni", price: 14.99, image: "https://placehold.co/300x200.png", category: "Pizzas", "data-ai-hint": "pizza food" },
  { id: 8, name: "Burger Végétarien", price: 9.50, image: "https://placehold.co/300x200.png", category: "Burgers", "data-ai-hint": "burger food" },
];

const categories = ["Tout", "Pizzas", "Burgers", "Salades", "Pâtes", "Accompagnements", "Boissons"];

export default function OrdersPage() {
  const [orderItems, setOrderItems] = useState([]);
  const [orderType, setOrderType] = useState("Sur place");
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const { toast } = useToast();

  const addToOrder = (product) => {
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
  
  const updateQuantity = (productId, newQuantity) => {
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
  const tax = subtotal * 0.08;
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
    setIsPaymentDialogOpen(true);
  };
  
  const handlePayment = (method) => {
    console.log(`Payé avec ${method}`);
    setIsPaymentDialogOpen(false);
    setIsReceiptDialogOpen(true);
  }

  const handleNewOrder = () => {
    setOrderItems([]);
    setIsReceiptDialogOpen(false);
    toast({
      title: "Nouvelle Commande Créée",
      description: "Vous pouvez maintenant ajouter des articles à la nouvelle commande.",
    })
  }

  const filteredProducts = activeCategory === "Tout"
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 flex flex-col h-full">
        <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold mb-4">Point de Vente</h1>
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
                    <Image src={product.image} alt={product.name} width={300} height={200} className="rounded-t-lg object-cover aspect-video" data-ai-hint={product['data-ai-hint']} />
                    <div className="p-3">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-muted-foreground text-sm">${product.price.toFixed(2)}</p>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>
      </div>
      <div className="lg:col-span-1 h-full">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Commande Actuelle</CardTitle>
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
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
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
                    <p className="w-16 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</p>
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxe (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handlePlaceOrder}>
                Valider la commande
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement de la Commande</DialogTitle>
            <DialogDescription>Montant total : <span className="font-bold text-foreground">${total.toFixed(2)}</span></DialogDescription>
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
      
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Reçu</DialogTitle>
             <DialogDescription className="text-center">Commande #125</DialogDescription>
          </DialogHeader>
          <div className="p-4 my-4 border rounded-lg bg-secondary/30">
             <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity} x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
               <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxe</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
          </div>
           <DialogFooter>
            <Button className="w-full" onClick={handleNewOrder}>Commencer une Nouvelle Commande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
