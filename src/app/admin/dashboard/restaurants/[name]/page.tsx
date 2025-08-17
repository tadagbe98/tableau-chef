
'use client';
import { useState, useEffect, use } from 'react';
import { collection, onSnapshot, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Ban, CheckCircle } from 'lucide-react';
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
    status: 'actif' | 'inactif';
}

interface RestaurantDetails {
    name: string;
    admin: User | null;
    staff: User[]; // Combined list of admin and employees
    status: 'actif' | 'inactif';
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = use(params);
    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const restaurantName = decodeURIComponent(name);
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
                staff: sortedUsers,
                status: admin?.status || 'actif',
            });
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch restaurant details:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantName]);
    
    const handleToggleStatus = async () => {
        if (!restaurant) return;
        setIsProcessing(true);
        const newStatus = restaurant.status === 'actif' ? 'inactif' : 'actif';
        try {
            const usersQuery = query(collection(db, 'users'), where("restaurantName", "==", restaurantName));
            const usersSnapshot = await getDocs(usersQuery);
            
            const batch = writeBatch(db);
            usersSnapshot.forEach(doc => {
                batch.update(doc.ref, { status: newStatus });
            });
            
            await batch.commit();
            
            toast({
                title: `Restaurant ${newStatus === 'actif' ? 'Réactivé' : 'Désactivé'}`,
                description: `Le statut du restaurant "${restaurantName}" est maintenant "${newStatus}".`
            });

        } catch (error) {
             console.error("Failed to toggle restaurant status:", error);
             toast({
                variant: 'destructive',
                title: "Erreur de mise à jour",
                description: "Une erreur est survenue. Veuillez réessayer."
            });
        } finally {
            setIsProcessing(false);
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
                    <div className="flex justify-between items-start">
                        <div>
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
                        </div>
                        <Badge variant={restaurant.status === 'actif' ? 'default' : 'secondary'} className={restaurant.status === 'actif' ? 'bg-green-500' : 'bg-gray-500'}>
                           {restaurant.status === 'actif' ? <CheckCircle className="mr-2 h-4 w-4"/> : <Ban className="mr-2 h-4 w-4"/>}
                           {restaurant.status}
                        </Badge>
                    </div>
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
                                <TableHead>Statut</TableHead>
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
                                        <TableCell>
                                            <Badge variant={member.status === 'actif' ? 'outline' : 'secondary'}>
                                                {member.status || 'actif'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-20">
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
                       Actions importantes concernant ce restaurant.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Désactiver / Réactiver le restaurant</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                               Désactiver un restaurant empêchera tous ses utilisateurs (y compris l'admin) de se connecter. Leurs données sont conservées et vous pouvez les réactiver à tout moment.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={isProcessing}>
                                {restaurant.status === 'actif' ? (
                                    <><Ban className="mr-2 h-4 w-4" /> Désactiver</>
                                ) : (
                                    <><CheckCircle className="mr-2 h-4 w-4" /> Réactiver</>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la modification de statut</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Vous êtes sur le point de {restaurant.status === 'actif' ? 'désactiver' : 'réactiver'} le restaurant "{restaurantName}". 
                                    {restaurant.status === 'actif' 
                                        ? " Ses utilisateurs ne pourront plus se connecter." 
                                        : " Ses utilisateurs pourront de nouveau se connecter."
                                    }
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleToggleStatus}>
                                    Oui, {restaurant.status === 'actif' ? 'désactiver' : 'réactiver'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </CardFooter>
            </Card>

        </div>
    );
}
