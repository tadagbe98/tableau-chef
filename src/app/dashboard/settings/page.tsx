import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Gérez vos informations personnelles et celles de votre restaurant.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Le formulaire de paramètres de profil sera ici.</p>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Facturation</CardTitle>
          <CardDescription>Gérez votre abonnement et vos méthodes de paiement.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">L'interface de gestion de la facturation sera ici.</p>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configurez vos préférences de notification.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les options de paramètres de notification seront ici.</p>
        </CardContent>
      </Card>
    </div>
  );
}
