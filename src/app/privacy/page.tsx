
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-secondary p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex flex-col items-center text-center space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">TableauChef</span>
            </Link>
            <CardTitle className="text-3xl font-bold">Politique de Confidentialité</CardTitle>
        </header>

        <Card>
            <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
                <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
                <p>
                    Bienvenue sur TableauChef. Votre vie privée est d'une importance capitale pour nous. Cette politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons, et quels sont vos droits concernant ces informations.
                </p>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">1. Informations que nous collectons</h2>
                    <p>Nous collectons des informations lorsque vous vous inscrivez, utilisez nos services, ou communiquez avec nous :</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Informations de compte :</strong> Votre nom, nom de restaurant, adresse e-mail, et mot de passe.</li>
                        <li><strong>Données d'utilisation :</strong> Informations sur la manière dont vous utilisez notre plateforme, telles que les fonctionnalités utilisées, les données de vente, d'inventaire, et de produits que vous enregistrez.</li>
                        <li><strong>Informations techniques :</strong> Adresse IP, type de navigateur, système d'exploitation, et informations sur l'appareil.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">2. Comment nous utilisons vos informations</h2>
                    <p>Les informations que nous collectons sont utilisées pour :</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Fournir, maintenir et améliorer nos services.</li>
                        <li>Personnaliser votre expérience.</li>
                        <li>Communiquer avec vous concernant votre compte ou nos services.</li>
                        <li>Assurer la sécurité de notre plateforme.</li>
                        <li>Répondre à nos obligations légales et réglementaires.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">3. Partage d'informations</h2>
                    <p>
                        Nous ne vendons, n'échangeons, ni ne louons vos informations personnelles à des tiers. Vos données de restaurant (ventes, inventaire, etc.) sont confidentielles et ne sont accessibles que par les utilisateurs que vous autorisez au sein de votre organisation.
                    </p>
                </div>
                
                 <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">4. Sécurité des données</h2>
                    <p>
                       Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations contre l'accès non autorisé, la modification, la divulgation ou la destruction.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">5. Vos droits</h2>
                    <p>
                        Vous avez le droit d'accéder, de corriger ou de supprimer vos informations personnelles. Vous pouvez gérer les informations de votre profil directement depuis votre tableau de bord ou nous contacter pour toute demande.
                    </p>
                </div>

                 <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
                    <p>
                        Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter via notre <Link href="/contact" className="underline text-primary">page de contact</Link>.
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
