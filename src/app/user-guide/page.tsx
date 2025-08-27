
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { ArrowLeft, KeyRound, ChefHat, UserCog, Package, BarChart3, BookOpenCheck, Rocket, Crown, Users } from 'lucide-react';
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
            <CardTitle className="text-3xl font-bold">Guide de Démarrage Rapide</CardTitle>
        </header>

        <Card>
            <CardContent className="p-6 md:p-8 space-y-8 text-muted-foreground">
                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2"><Rocket/> Comment commencer ?</h2>
                    <p>
                        Que vous soyez propriétaire de restaurant ou membre du personnel, voici comment vous lancer sur TableauChef en deux minutes.
                    </p>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="p-4 border rounded-lg bg-background/50 flex flex-col">
                           <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <Crown className="text-amber-500"/> Pour les Propriétaires (Admin)
                           </h3>
                           <p className="mt-2 flex-grow">C'est vous qui créez l'espace de travail pour votre restaurant.</p>
                           <ol className="list-decimal pl-5 mt-2 space-y-1 flex-grow">
                               <li>Rendez-vous sur la <Link href="/" className="font-semibold text-primary underline">page d'accueil</Link>.</li>
                               <li>Cliquez sur le bouton <strong>"Commencer Gratuitement"</strong>.</li>
                               <li>Remplissez le formulaire avec vos informations.</li>
                           </ol>
                           <p className="mt-3 text-xs italic">
                               Félicitations ! Votre compte est le compte **Administrateur**. Vous avez le contrôle total pour configurer votre restaurant et inviter votre équipe.
                           </p>
                       </div>

                       <div className="p-4 border rounded-lg bg-background/50 flex flex-col">
                           <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <Users /> Pour les Employés
                           </h3>
                           <p className="mt-2 flex-grow">Vous êtes Caissier ou Gestionnaire de Stock ? C'est encore plus simple.</p>
                            <ol className="list-decimal pl-5 mt-2 space-y-1 flex-grow">
                               <li>Votre administrateur doit d'abord vous créer un compte.</li>
                               <li>Il vous fournira une <strong>adresse e-mail</strong> et un <strong>mot de passe</strong>.</li>
                               <li>Utilisez-les pour vous connecter sur la page de <Link href="/login" className="font-semibold text-primary underline">Connexion</Link>.</li>
                           </ol>
                           <p className="mt-3 text-xs italic">
                                Une fois connecté, vous n'aurez accès qu'aux outils nécessaires à votre rôle. Facile et sécurisé !
                           </p>
                       </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2"><UserCog/> Comprendre les Rôles</h2>
                    <p>TableauChef utilise un système de rôles pour s'assurer que chaque membre de l'équipe ait accès aux outils dont il a besoin, et uniquement à ceux-là. L'Administrateur du restaurant (celui qui a créé le compte) est responsable de l'attribution de ces rôles.</p>
                    
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
