
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ShieldAlert } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
    const [isDeleting, setIsDeleting] = useState(false);
    const restaurantName = decodeURIComponent(params.name);
    const router = useRouter();
    const { toast } = useToast();

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
    
    const handleDeleteRestaurant = async () => {
        setIsDeleting(true);
        try {
            const usersQuery = query(collection(db, 'users'), where("restaurantName", "==", restaurantName));
            const usersSnapshot = await getDocs(usersQuery);

            if (usersSnapshot.empty) {
                toast({ title: "Aucun utilisateur à supprimer." });
                router.push('/admin/dashboard/restaurants');
                return;
            }

            const batch = writeBatch(db);
            usersSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            toast({
                title: "Restaurant Supprimé",
                description: `Le restaurant "${restaurantName}" et tous ses utilisateurs ont été supprimés.`
            });
            
            router.push('/admin/dashboard/restaurants');

        } catch (error) {
            console.error("Failed to delete restaurant and users:", error);
            toast({
                variant: 'destructive',
                title: "Erreur lors de la suppression",
                description: "Une erreur est survenue. Veuillez réessayer."
            });
        } finally {
            setIsDeleting(false);
        }
    }


    if (loading) {
        return <p>Chargement des détails du restaurant...</p>;
    }

    if (!restaurant) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Restaurant non trouvé</CardTitle>
                    <CardDescription>
                        Impossible de trouver les informations pour le restaurant "{restaurantName}". Il a peut-être été supprimé.
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
            
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert /> Zone de Danger
                    </CardTitle>
                     <CardDescription>
                       Actions irréversibles concernant ce restaurant.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm mb-4">
                        La suppression d'un restaurant est définitive. Elle effacera le restaurant ainsi que tous les comptes utilisateurs (Admin et employés) qui y sont associés dans la base de données.
                    </p>
                </CardContent>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                {isDeleting ? "Suppression en cours..." : "Supprimer le Restaurant"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Le restaurant "{restaurantName}" et tous ses utilisateurs seront supprimés. Vous ne pourrez pas annuler cette action.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteRestaurant} className="bg-destructive hover:bg-destructive/90">
                                    Oui, supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>

        </div>
    );
}
