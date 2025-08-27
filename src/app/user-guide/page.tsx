
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { ArrowLeft, KeyRound, ChefHat, UserCog, Package, BarChart3, BookOpenCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UserGuidePage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-secondary p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex flex-col items-center text-center space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">TableauChef</span>
            </Link>
            <CardTitle className="text-3xl font-bold">Guide d'Utilisation</CardTitle>
        </header>

        <Card>
            <CardContent className="p-6 md:p-8 space-y-8 text-muted-foreground">
                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2"><KeyRound/> Accès et Connexion</h2>
                    <p>
                        Bienvenue sur TableauChef ! Pour commencer, l'Administrateur de votre restaurant vous créera un compte et vous fournira vos identifiants de connexion (adresse e-mail et mot de passe initial).
                    </p>
                    <p className="mt-2">
                        Rendez-vous sur la page de connexion de l'application et utilisez ces identifiants pour accéder à votre tableau de bord.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2"><UserCog/> Comprendre les Rôles</h2>
                    <p>TableauChef utilise un système de rôles pour s'assurer que chaque membre de l'équipe ait accès aux outils dont il a besoin, et uniquement à ceux-là. Voici les rôles disponibles :</p>
                    
                    <div className="mt-4 space-y-4">
                        <div className="p-4 border rounded-lg">
                           <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><Badge>Administrateur (Admin)</Badge></h3>
                           <p className="mt-1">
                                C'est le chef d'orchestre du restaurant sur la plateforme. L'Admin a un accès quasi total et peut tout gérer :
                           </p>
                           <ul className="list-disc pl-6 mt-2 space-y-1">
                               <li><span className="font-semibold">Gestion des utilisateurs :</span> Créer, modifier et supprimer les comptes des autres employés.</li>
                               <li><span className="font-semibold">Gestion des produits et de l'inventaire :</span> Ajouter de nouveaux plats, mettre à jour les stocks.</li>
                               <li><span className="font-semibold">Point de Vente :</span> Accéder au point de vente pour prendre des commandes.</li>
                               <li><span className="font-semibold">Rapports :</span> Consulter tous les rapports de ventes et d'analyse.</li>
                               <li><span className="font-semibold">Point Journalier :</span> Ouvrir et fermer la caisse, consulter l'historique.</li>
                               <li><span className="font-semibold">Paramètres :</span> Configurer les informations du restaurant.</li>
                           </ul>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                           <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><Badge variant="secondary">Caissier</Badge></h3>
                           <p className="mt-1">
                                Le Caissier est au cœur de l'action quotidienne. Son rôle est centré sur les ventes.
                           </p>
                           <ul className="list-disc pl-6 mt-2 space-y-1">
                               <li><span className="font-semibold">Point de Vente :</span> Accès principal pour prendre les commandes des clients.</li>
                               <li><span className="font-semibold">Point Journalier :</span> Peut ouvrir et fermer la caisse en début et fin de service.</li>
                               <li><span className="font-semibold">Accès limité :</span> Ne peut pas voir les rapports financiers détaillés, ni gérer les utilisateurs ou les produits.</li>
                           </ul>
                        </div>

                         <div className="p-4 border rounded-lg">
                           <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><Badge variant="outline">Gestionnaire de Stock</Badge></h3>
                           <p className="mt-1">
                               Ce rôle est crucial pour le contrôle des coûts et l'approvisionnement.
                           </p>
                           <ul className="list-disc pl-6 mt-2 space-y-1">
                               <li><span className="font-semibold">Gestion des produits :</span> Ajouter, modifier ou supprimer des articles du menu.</li>
                               <li><span className="font-semibold">Gestion de l'inventaire :</span> Mettre à jour les niveaux de stock, faire des comptages et suivre les mouvements.</li>
                               <li><span className="font-semibold">Accès limité :</span> Ne peut pas accéder au point de vente, aux rapports ou à la gestion des utilisateurs.</li>
                           </ul>
                        </div>
                    </div>
                </section>
                
                 <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2"><ChefHat/> Aperçu Rapide des Fonctionnalités</h2>
                    <ul className="list-disc pl-6 space-y-2">
                       <li><strong className="text-foreground">Tableau de Bord :</strong> Votre page d'accueil avec un résumé des activités clés.</li>
                       <li><strong className="text-foreground">Commandes :</strong> L'interface de point de vente pour enregistrer les commandes.</li>
                       <li><strong className="text-foreground">Produits :</strong> Gérez la liste de tous vos plats, boissons et autres articles à vendre.</li>
                       <li><strong className="text-foreground">Inventaire :</strong> Suivez vos matières premières pour éviter les ruptures de stock.</li>
                       <li><strong className="text-foreground">Rapports :</strong> (Admin uniquement) Analysez vos ventes et performances.</li>
                       <li><strong className="text-foreground">Point Journalier :</strong> (Admin & Caissier) Gérez l'ouverture et la fermeture de la caisse.</li>
                    </ul>
                </section>

                <section>
                     <h2 className="text-2xl font-semibold text-foreground mb-4">Besoin d'Aide ?</h2>
                     <p>
                        Si vous avez des questions ou rencontrez un problème, n'hésitez pas à contacter votre administrateur de restaurant ou à utiliser notre <Link href="/contact" className="underline text-primary">page de contact</Link> pour joindre le support.
                     </p>
                </section>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
