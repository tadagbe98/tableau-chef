
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
    staff: User[]; // Combined list of admin and employees
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
            
            // Sort users so that Admin is always on top
            const sortedUsers = users.sort((a, b) => {
                if (a.role === 'Admin') return -1;
                if (b.role === 'Admin') return 1;
                return a.name.localeCompare(b.name);
            });

            setRestaurant({
                name: restaurantName,
                admin,
                staff: sortedUsers
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
    
    const getRoleBadgeVariant = (role: string) => {
        switch(role) {
            case 'Admin': return 'default';
            case 'Gestionnaire de Stock': return 'secondary';
            case 'Caissier': return 'outline';
            default: return 'secondary';
        }
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
                    <CardTitle>Liste du Personnel</CardTitle>
                    <CardDescription>
                        Voici la liste de tous les employés et administrateurs de ce restaurant.
                    </CardDescription>
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
                            {restaurant.staff.length > 0 ? (
                                restaurant.staff.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(member.role)}>
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-20">
                                        Aucun personnel assigné à ce restaurant.
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
