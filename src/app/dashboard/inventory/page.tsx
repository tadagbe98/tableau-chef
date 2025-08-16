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
  { id: 1, name: "Pizza Dough", category: "Ingredients", stock: 80, maxStock: 100, unit: "kg" },
  { id: 2, name: "Tomato Sauce", category: "Ingredients", stock: 50, maxStock: 100, unit: "liters" },
  { id: 3, name: "Mozzarella Cheese", category: "Ingredients", stock: 25, maxStock: 50, unit: "kg" },
  { id: 4, name: "Beef Patties", category: "Ingredients", stock: 120, maxStock: 200, unit: "units" },
  { id: 5, name: "Burger Buns", category: "Ingredients", stock: 90, maxStock: 200, unit: "units" },
  { id: 6, name: "Lettuce", category: "Produce", stock: 15, maxStock: 30, unit: "heads" },
  { id: 7, name: "Coke Cans", category: "Beverages", stock: 180, maxStock: 240, unit: "cans" },
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
                        <DialogTitle>Add Stock</DialogTitle>
                        <DialogDescription>Add new stock for {selectedItem.name}. Current stock: {selectedItem.stock} {selectedItem.unit}.</DialogDescription>
                         <div className="grid gap-4 py-4">
                            <Label htmlFor="add-quantity">Quantity to Add</Label>
                            <Input id="add-quantity" type="number" placeholder="0" />
                        </div>
                    </>
                );
            case 'use':
                 return (
                    <>
                        <DialogTitle>Use Stock</DialogTitle>
                        <DialogDescription>Record used stock for {selectedItem.name}. Current stock: {selectedItem.stock} {selectedItem.unit}.</DialogDescription>
                         <div className="grid gap-4 py-4">
                            <Label htmlFor="use-quantity">Quantity to Use</Label>
                            <Input id="use-quantity" type="number" placeholder="0" />
                        </div>
                    </>
                );
            case 'count':
                 return (
                    <>
                        <DialogTitle>Physical Count</DialogTitle>
                        <DialogDescription>Update stock for {selectedItem.name} after a physical count. Current stock: {selectedItem.stock} {selectedItem.unit}.</DialogDescription>
                         <div className="grid gap-4 py-4">
                            <Label htmlFor="count-quantity">New Total Quantity</Label>
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
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
            <Button variant="outline"><MinusCircle className="mr-2 h-4 w-4" /> Use Stock</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Stock</Button>
            <Button variant="secondary"><CheckCircle className="mr-2 h-4 w-4" /> Physical Count</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Track and manage your stock levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
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
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DialogTrigger asChild onClick={() => openDialog('add', item)}><DropdownMenuItem>Add Stock</DropdownMenuItem></DialogTrigger>
                                <DialogTrigger asChild onClick={() => openDialog('use', item)}><DropdownMenuItem>Use Stock</DropdownMenuItem></DialogTrigger>
                                <DialogTrigger asChild onClick={() => openDialog('count', item)}><DropdownMenuItem>Physical Count</DropdownMenuItem></DialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    {getDialogContent()}
                                </DialogHeader>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
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
