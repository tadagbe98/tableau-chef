
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RestaurantsList from "../RestaurantsList";
import { RestaurantBreadcrumb } from "./Breadcrumb";
import AddRestaurantForm from "./AddRestaurantForm";

export default function RestaurantsPage() {
    return (
        <div className="space-y-4">
            <RestaurantBreadcrumb />
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold">Liste des Restaurants</h1>
                    <p className="text-muted-foreground">
                        Voici la liste de tous les restaurants enregistrés sur la plateforme.
                    </p>
                </div>
                <AddRestaurantForm />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Restaurants</CardTitle>
                    <CardDescription>
                        Cliquez sur "Voir plus" pour les détails ou la gestion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RestaurantsList />
                </CardContent>
            </Card>
        </div>
    )
}
