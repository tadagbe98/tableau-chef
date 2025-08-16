'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const monthlySalesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Fév', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Avr', sales: 4500 },
  { month: 'Mai', sales: 6000 },
  { month: 'Juin', sales: 5500 },
];

const topProductsData = [
  { name: 'Margherita', sales: 250 },
  { name: 'Cheeseburger', sales: 180 },
  { name: 'Salade César', sales: 150 },
  { name: 'Carbonara', sales: 120 },
  { name: 'Frites', sales: 300 },
];

const categorySalesData = [
  { name: 'Pizzas', value: 400, fill: 'var(--color-pizzas)' },
  { name: 'Burgers', value: 300, fill: 'var(--color-burgers)' },
  { name: 'Salades', value: 300, fill: 'var(--color-salads)' },
  { name: 'Pâtes', value: 200, fill: 'var(--color-pastas)' },
  { name: 'Accompagnements', value: 250, fill: 'var(--color-sides)' },
  { name: 'Boissons', value: 150, fill: 'var(--color-drinks)' },
];

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "hsl(var(--primary))",
  },
  pizzas: {
    label: "Pizzas",
    color: "hsl(var(--chart-1))",
  },
  burgers: {
    label: "Burgers",
    color: "hsl(var(--chart-2))",
  },
  salads: {
    label: "Salades",
    color: "hsl(var(--chart-3))",
  },
  pastas: {
    label: "Pâtes",
    color: "hsl(var(--chart-4))",
  },
  sides: {
    label: "Accompagnements",
    color: "hsl(var(--chart-5))",
  },
  drinks: {
    label: "Boissons",
    color: "hsl(var(--muted))",
  },
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
       <h1 className="text-2xl font-bold">Rapports et Analyses</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tendance des Ventes Mensuelles</CardTitle>
          <CardDescription>Un aperçu de vos revenus au cours des derniers mois.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <LineChart
              accessibilityLayer
              data={monthlySalesData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="sales"
                type="natural"
                stroke="var(--color-sales)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 des Produits les Plus Vendus</CardTitle>
            <CardDescription>Vos articles les plus populaires ce mois-ci.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={topProductsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false}/>
                    <XAxis type="number" dataKey="sales" hide/>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false}/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ventes par Catégorie</CardTitle>
             <CardDescription>Répartition des ventes par catégorie.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <PieChart accessibilityLayer>
                 <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categorySalesData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card>
          <CardHeader>
            <CardTitle>Analyse de la Marge Brute (Espace réservé)</CardTitle>
            <CardDescription>Comprendre votre rentabilité.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 bg-secondary rounded-lg">
            <p className="text-muted-foreground">Le graphique de la marge brute sera ici.</p>
          </CardContent>
        </Card>
    </div>
  );
}
