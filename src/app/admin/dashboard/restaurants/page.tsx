
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RestaurantsList from "../RestaurantsList";
import { RestaurantBreadcrumb } from "./Breadcrumb";


export default function RestaurantsPage() {
    return (
        <div className="space-y-4">
            <RestaurantBreadcrumb />
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Restaurants</CardTitle>
                    <CardDescription>
                        Voici la liste de tous les restaurants enregistrés sur la plateforme. Cliquez sur "Voir plus" pour les détails.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RestaurantsList />
                </CardContent>
            </Card>
        </div>
    )
}
