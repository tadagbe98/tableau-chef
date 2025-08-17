
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    restaurantName: string;
}

interface RestaurantDetails {
    name: string;
    admin: User | null;
    employees: User[];
}

export default function RestaurantDetailPage({ params }: { params: { name: string } }) {
    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const restaurantName = decodeURIComponent(params.name);

    useEffect(() => {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("restaurantName", "==", restaurantName));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setRestaurant(null);
                setLoading(false);
                return;
            }

            const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
            
            const admin = users.find(user => user.role === 'Admin') || null;
            const employees = users.filter(user => user.role !== 'Admin');

            setRestaurant({
                name: restaurantName,
                admin,
                employees
            });
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch restaurant details:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantName]);

    if (loading) {
        return <p>Chargement des détails du restaurant...</p>;
    }

    if (!restaurant) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Restaurant non trouvé</CardTitle>
                    <CardDescription>
                        Impossible de trouver les informations pour le restaurant "{restaurantName}".
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{restaurant.name}</CardTitle>
                    {restaurant.admin ? (
                        <CardDescription>
                           Administré par {restaurant.admin.name} ({restaurant.admin.email})
                        </CardDescription>
                    ) : (
                         <CardDescription className="text-orange-500">
                           Aucun administrateur principal n'est assigné à ce restaurant.
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Employés</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
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
                </CardContent>
            </Card>
        </div>
    );
}
