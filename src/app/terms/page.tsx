
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-secondary p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex flex-col items-center text-center space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">TableauChef</span>
            </Link>
            <CardTitle className="text-3xl font-bold">Conditions Générales d'Utilisation</CardTitle>
        </header>

        <Card>
            <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
                <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
                <p>
                    Veuillez lire attentivement ces Conditions Générales d'Utilisation ("Conditions") avant d'utiliser le service TableauChef (le "Service") opéré par nous.
                </p>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">1. Comptes</h2>
                    <p>
                        Lorsque vous créez un compte chez nous, vous devez nous fournir des informations exactes, complètes et à jour. Tout manquement constitue une violation des Conditions, qui peut entraîner la résiliation immédiate de votre compte sur notre Service.
                    </p>
                    <p>
                        Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service et de toutes les activités ou actions effectuées sous votre mot de passe.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">2. Contenu</h2>
                    <p>
                       Notre Service vous permet de publier, lier, stocker, partager et rendre disponible certaines informations, textes, graphiques, ou autre matériel ("Contenu"). Vous êtes responsable du Contenu que vous publiez sur le Service, y compris de sa légalité, de sa fiabilité et de sa pertinence.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">3. Utilisation acceptable</h2>
                    <p>
                        Vous vous engagez à ne pas utiliser le Service à des fins illégales ou interdites par ces Conditions. Vous ne pouvez pas utiliser le Service d'une manière qui pourrait endommager, désactiver, surcharger ou nuire au Service.
                    </p>
                </div>
                
                 <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">4. Résiliation</h2>
                    <p>
                       Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans limitation, si vous violez les Conditions.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">5. Modifications des conditions</h2>
                    <p>
                        Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer ces Conditions à tout moment. Nous nous efforcerons de fournir un préavis d'au moins 30 jours avant l'entrée en vigueur de nouvelles conditions.
                    </p>
                </div>

                 <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
                    <p>
                        Si vous avez des questions concernant ces Conditions, veuillez nous contacter via notre <Link href="/contact" className="underline text-primary">page de contact</Link>.
                    </p>
                </div>
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
