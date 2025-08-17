
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    restaurantName: string;
}

interface Restaurant {
    name: string;
    admin: User | null;
    employees: User[];
}

export default function RestaurantsList() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
            
            const restaurantsMap = users.reduce((acc, user) => {
                if (user.role === 'Super Admin') return acc;

                const restaurantName = user.restaurantName || 'Non assigné';
                if (!acc[restaurantName]) {
                    acc[restaurantName] = {
                        name: restaurantName,
                        admin: null,
                        employees: []
                    };
                }

                if (user.role === 'Admin') {
                    acc[restaurantName].admin = user;
                } else {
                    acc[restaurantName].employees.push(user);
                }
                
                return acc;
            }, {} as Record<string, Restaurant>);

            setRestaurants(Object.values(restaurantsMap));
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch users for restaurant list:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <p>Chargement de la liste des restaurants...</p>;
    }

    if (restaurants.length === 0) {
        return (
             <Card className="mt-4 border-dashed">
                <CardHeader className="text-center">
                    <CardTitle>Aucun Restaurant</CardTitle>
                    <CardDescription>
                        Aucun restaurant n'a encore été créé.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {restaurants.map(restaurant => (
                    <TableRow key={restaurant.name}>
                        <TableCell className="font-medium">{restaurant.name}</TableCell>
                        <TableCell>
                            {restaurant.admin ? (
                                <div className="flex flex-col">
                                    <span>{restaurant.admin.name}</span>
                                    <span className="text-xs text-muted-foreground">{restaurant.admin.email}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-orange-500">Aucun admin</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="outline" size="sm">
                               <Link href={`/admin/dashboard/restaurants/${encodeURIComponent(restaurant.name)}`}>
                                   Voir plus
                                   <ArrowRight className="ml-2 h-4 w-4"/>
                               </Link>
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
