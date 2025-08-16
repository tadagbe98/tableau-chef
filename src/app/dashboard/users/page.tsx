
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
import { getUsers, updateUser, deleteUser, UserData } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const { toast } = useToast();
  const { user: adminUser, createUser } = useAuth(); // Using createUser from context

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les utilisateurs.' });
    }
  };

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
          // This only deletes from Firestore in the current implementation
          await deleteUser(userToDelete.uid);
          toast({ title: 'Succès', description: 'Utilisateur supprimé de la base de données. Supprimez-le aussi de la console Firebase Auth.' });
          fetchUsers();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'utilisateur."});
          console.error(error);
      }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | string, field: string) => {
    if (typeof e === 'string') {
        setFormData(prev => ({ ...prev, [field]: e }));
    } else {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (isEditMode && currentUser) {
            await updateUser(currentUser.uid, {
                name: formData.name,
                role: formData.role
            });
            toast({ title: 'Succès', description: "Utilisateur mis à jour avec succès." });
        } else {
             if (formData.password.length < 6) {
                toast({ variant: 'destructive', title: "Erreur", description: "Le mot de passe doit faire au moins 6 caractères." });
                return;
            }
            // Using the createUser function from AuthContext
            await createUser(formData.email, formData.password, formData.name, formData.role);
            toast({ title: 'Utilisateur créé', description: "L'administrateur a été déconnecté. Veuillez vous reconnecter." });
        }
        fetchUsers();
        setIsDialogOpen(false);
    } catch (error: any) {
        let description = "Une erreur est survenue.";
        if (error.code === 'auth/email-already-in-use') {
            description = "Cet email est déjà utilisé."
        } else if (error.message.includes("Veuillez vous reconnecter")) {
            description = error.message;
        }
        
        toast({ variant: 'destructive', title: 'Erreur', description });
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
          <CardDescription>Gérez les comptes et les permissions.</CardDescription>
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
