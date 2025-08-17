
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, Users, UtensilsCrossed, HelpCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Tooltip } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "hsl(var(--primary))",
  },
};

const topProductsData = [
  { name: 'Pizza Margherita', sales: 120 },
  { name: 'Cheeseburger', sales: 98 },
  { name: 'Salade César', sales: 75 },
  { name: 'Spaghetti Carbonara', sales: 62 },
  { name: 'Tiramisu', sales: 45 },
];

const recentOrders = [
    { id: '#125', customer: 'Table 3', status: 'Servie', total: '45.50 €' },
    { id: '#124', customer: 'John Doe', status: 'Prête', total: '22.00 €' },
    { id: '#123', customer: 'À emporter', status: 'En préparation', total: '15.75 €' },
    { id: '#122', customer: 'Jane Smith', status: 'Nouvelle', total: '30.10 €' },
    { id: '#121', customer: 'Table 5', status: 'Servie', total: '55.00 €' },
]

function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalRevenue: 0, userCount: 0 });
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.restaurantName) return;
        setLoading(true);

        const fetchStats = async () => {
            // Fetch users count
            const usersQuery = query(
                collection(db, 'users'), 
                where("restaurantName", "==", user.restaurantName)
            );
            const usersSnapshot = await getDocs(usersQuery);
            setStats(prev => ({ ...prev, userCount: usersSnapshot.size }));
        };

        fetchStats();
        
        // Listen for journal updates
        const journalsQuery = query(
            collection(db, 'journals'), 
            orderBy('date', 'desc')
        );
        
        const unsubscribe = onSnapshot(journalsQuery, (snapshot) => {
            const journals = snapshot.docs.map(doc => doc.data());
            
            const totalRevenue = journals.reduce((acc, journal) => acc + journal.totalSales, 0);
            
            const dailySales = journals.reduce((acc, journal) => {
                const date = new Date(journal.date).toLocaleDateString('fr-CA');
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date] += journal.totalSales;
                return acc;
            }, {});

            const formattedSalesData = Object.entries(dailySales)
                .map(([date, sales]) => ({
                    date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                    sales: sales
                }))
                .reverse();

            setSalesData(formattedSalesData);
            setStats(prev => ({ ...prev, totalRevenue }));
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user?.restaurantName]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="h-7 w-28 bg-muted animate-pulse rounded-md" />
            ) : (
                <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} {user?.currency}</div>
            )}
            <p className="text-xs text-muted-foreground">Basé sur toutes les clôtures de caisse</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded-md" />
            ) : (
                <div className="text-2xl font-bold">{stats.userCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Total des utilisateurs du restaurant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
             <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">À venir</div>
            <p className="text-xs text-muted-foreground">Sera disponible avec la gestion des commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
             <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">À venir</div>
            <p className="text-xs text-muted-foreground">Sera disponible avec la gestion des commandes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Aperçu des Ventes</CardTitle>
            <CardDescription>Performance des ventes sur les derniers jours d'activité.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <LineChart
                    accessibilityLayer
                    data={salesData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${value} ${user?.currency}`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                            formatter={(value) => `${(value as number).toFixed(2)} ${user?.currency}`}
                            indicator="dot" 
                        />}
                    />
                    <Line
                        dataKey="sales"
                        type="monotone"
                        stroke="var(--color-sales)"
                        strokeWidth={2}
                        dot={true}
                    />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Produits les Plus Vendus</CardTitle>
            <CardDescription>Vos meilleures ventes. (Données d'exemple)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={topProductsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="sales" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
                    <ChartTooltip 
                        cursor={false} 
                        content={<ChartTooltipContent 
                            indicator="dot" 
                            formatter={(value, name) => `${value} ventes`}
                        />} 
                    />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Suivi des Commandes en Temps Réel</CardTitle>
           <CardDescription>Les dernières commandes de votre restaurant. (Données d'exemple)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Commande</TableHead>
                <TableHead>Client / Table</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge variant={
                        order.status === 'Servie' ? 'default' : 
                        order.status === 'Prête' ? 'secondary' : 
                        order.status === 'En préparation' ? 'outline' :
                        order.status === 'Nouvelle' ? 'default' : 
                        'destructive'
                    } className={`capitalize ${order.status === 'Nouvelle' && 'bg-blue-500 text-white'} ${order.status === 'Prête' && 'bg-green-500 text-white'} ${order.status === 'Servie' && 'bg-primary'} ${order.status === 'En préparation' && 'bg-yellow-500 text-black'}`}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
    const { user } = useAuth();
    
    if (user?.role === 'Admin') {
        return <AdminDashboard />;
    }
    
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bienvenue, {user?.displayName || 'Utilisateur'}!</CardTitle>
                    <CardDescription>
                        Ceci est votre tableau de bord. Utilisez le menu de gauche pour naviguer vers les sections qui vous concernent.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        Votre rôle est : <Badge>{user?.role}</Badge>
                    </div>
                    <p className="mt-4 text-muted-foreground">Si vous pensez que vos accès sont incorrects, veuillez contacter un administrateur.</p>
                </CardContent>
            </Card>
        </div>
    )
}

    