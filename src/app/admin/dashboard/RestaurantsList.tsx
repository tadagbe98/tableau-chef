
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
                if (user.role === 'Super Admin') return acc; // Exclude Super Admin from any restaurant list

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
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Aucun Restaurant</CardTitle>
                    <CardDescription>
                        Aucun restaurant n'a encore été créé par un utilisateur Admin.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {restaurants.map(restaurant => (
                <Card key={restaurant.name} className="transition-shadow hover:shadow-md">
                    <AccordionItem value={restaurant.name} className="border-b-0">
                        <AccordionTrigger className="p-6 text-left">
                            <div className="flex flex-col items-start">
                                <CardTitle>{restaurant.name}</CardTitle>
                                {restaurant.admin ? (
                                     <CardDescription className="text-left mt-1">
                                        Admin: {restaurant.admin.name} ({restaurant.admin.email})
                                    </CardDescription>
                                ) : (
                                    <CardDescription className="text-left mt-1 text-orange-500">
                                        Aucun admin assigné à ce restaurant.
                                    </CardDescription>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="px-6 pb-6">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom de l'Employé</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rôle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {restaurant.employees.length > 0 ? (
                                        restaurant.employees.map(emp => (
                                            <TableRow key={emp.id}>
                                                <TableCell>{emp.name}</TableCell>
                                                <TableCell>{emp.email}</TableCell>
                                                <TableCell><Badge variant="secondary">{emp.role}</Badge></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-20">
                                                Aucun employé pour ce restaurant.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            ))}
        </Accordion>
    );
}
