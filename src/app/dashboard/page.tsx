'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, Users, UtensilsCrossed } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';

const salesData = [
  { date: 'Lun', sales: 4000 },
  { date: 'Mar', sales: 3000 },
  { date: 'Mer', sales: 2000 },
  { date: 'Jeu', sales: 2780 },
  { date: 'Ven', sales: 1890 },
  { date: 'Sam', sales: 2390 },
  { date: 'Dim', sales: 3490 },
];

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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 €</div>
            <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.50 €</div>
            <p className="text-xs text-muted-foreground">+5.2% par rapport au mois dernier</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Aperçu des Ventes</CardTitle>
            <CardDescription>Performance des ventes de cette semaine.</CardDescription>
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
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Line
                    dataKey="sales"
                    type="monotone"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                    dot={false}
                    />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Produits les Plus Vendus</CardTitle>
            <CardDescription>Vos meilleures ventes cette semaine.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={topProductsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="sales" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Suivi des Commandes en Temps Réel</CardTitle>
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
