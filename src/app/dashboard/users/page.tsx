
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

export interface UserData {
    id: string; 
    uid: string; 
    name: string;
    email: string;
    role: 'Admin' | 'Caissier' | 'Gestionnaire de Stock';
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const { toast } = useToast();
  const { user: adminUser, createUser } = useAuth();

  const fetchUsers = async () => {
    if (!adminUser?.restaurantName) {
      // Don't fetch if the admin doesn't have a restaurant name, to avoid showing all users.
      setUsers([]);
      return;
    }
    
    try {
      const usersCollectionRef = collection(db, 'users');
      // Create a query to get users only for the current admin's restaurant
      const q = query(
        usersCollectionRef, 
        where("restaurantName", "==", adminUser.restaurantName),
        where("role", "!=", "Super Admin") // Also explicitly exclude Super Admins
      );

      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserData));
      // Ensure we have the uid from the doc id if it's missing in the data
      const finalUsers = fetchedUsers.map(u => ({...u, uid: u.uid || u.id }));
      setUsers(finalUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les utilisateurs. Vérifiez les règles de sécurité de Firestore.' });
    }
  };

  useEffect(() => {
    if (adminUser) { // Only fetch if admin is logged in
        fetchUsers();
    }
  }, [adminUser]);

  const handleDialogOpen = (user: UserData | null = null) => {
    if (user) {
      setIsEditMode(true);
      setCurrentUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setIsEditMode(false);
      setCurrentUser(null);
      setFormData({ name: '', email: '', password: '', role: '' });
    }
    setIsDialogOpen(true);
  };
  
  const handleDeleteUser = async (userToDelete: UserData) => {
      if (userToDelete.uid === adminUser?.uid) {
          toast({ variant: 'destructive', title: 'Action impossible', description: 'Vous ne pouvez pas supprimer votre propre compte.' });
          return;
      }
      try {
          // Note: This only deletes the Firestore document. The Firebase Auth user still exists.
          // A cloud function would be needed for a complete deletion.
          const userDocRef = doc(db, 'users', userToDelete.uid);
          await deleteDoc(userDocRef);
          toast({ title: 'Succès', description: "Utilisateur supprimé de la base de données. L'authentification reste active." });
          fetchUsers(); // Refresh the list
      } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'utilisateur."});
          console.error(error);
      }
  }

    const handleUpdateUser = async () => {
        if (!currentUser) return;
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                name: formData.name,
                role: formData.role,
            });
            toast({ title: 'Succès', description: "Utilisateur mis à jour." });
            fetchUsers();
            setIsDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de mettre à jour l'utilisateur."});
            console.error(error);
        }
    }


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | string, field: string) => {
    if (typeof e === 'string') {
        setFormData(prev => ({ ...prev, [field]: e }));
    } else {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
        await handleUpdateUser();
        return;
    }

    try {
        if (formData.password.length < 6) {
            toast({ variant: 'destructive', title: "Erreur", description: "Le mot de passe doit faire au moins 6 caractères." });
            return;
        }
        await createUser(formData.email, formData.password, formData.name, formData.role as string);
        toast({
            title: "Utilisateur créé avec succès !",
            description: `Le compte pour ${formData.name} a été créé.`,
            duration: 5000,
        });
        fetchUsers(); // Refresh the list after creation
        setIsDialogOpen(false);
    } catch (error: any) {
        let description = "Une erreur est survenue lors de la création.";
        if (error.code === 'auth/email-already-in-use') {
            description = "Cet email est déjà utilisé."
        }
        toast({ variant: 'destructive', title: 'Erreur de création', description });
        console.error("Form submission error:", error);
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogOpen()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                <DialogTitle>{isEditMode ? "Modifier l'Utilisateur" : "Ajouter un Nouvel Utilisateur"}</DialogTitle>
                <DialogDescription>
                    {isEditMode ? "Modifiez les informations de l'utilisateur." : "Remplissez les détails du nouvel utilisateur."}
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nom Complet</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleFormChange(e, 'name')} placeholder="John Doe" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleFormChange(e, 'email')} placeholder="john@example.com" className="col-span-3" required disabled={isEditMode}/>
                </div>
                {!isEditMode && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Mot de passe</Label>
                        <Input id="password" type="password" value={formData.password} onChange={(e) => handleFormChange(e, 'password')} placeholder="********" className="col-span-3" required />
                    </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Rôle</Label>
                    <Select onValueChange={(value) => handleFormChange(value, 'role')} value={formData.role} required>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Caissier">Caissier</SelectItem>
                        <SelectItem value="Gestionnaire de Stock">Gestionnaire de Stock</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
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
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>Gérez les comptes et les permissions de votre restaurant.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Gestionnaire de Stock' ? 'outline' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.uid === adminUser?.uid}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ouvrir le menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDialogOpen(user)}>Modifier</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Supprimer</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Le compte de l'utilisateur sera supprimé de la base de données (mais pas de Firebase Auth).
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user)}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
