// @ts-nocheck
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
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 4500 },
  { month: 'May', sales: 6000 },
  { month: 'Jun', sales: 5500 },
];

const topProductsData = [
  { name: 'Margherita', sales: 250 },
  { name: 'Cheeseburger', sales: 180 },
  { name: 'Caesar Salad', sales: 150 },
  { name: 'Carbonara', sales: 120 },
  { name: 'Fries', sales: 300 },
];

const categorySalesData = [
  { name: 'Pizzas', value: 400, fill: 'var(--color-pizzas)' },
  { name: 'Burgers', value: 300, fill: 'var(--color-burgers)' },
  { name: 'Salads', value: 300, fill: 'var(--color-salads)' },
  { name: 'Pastas', value: 200, fill: 'var(--color-pastas)' },
  { name: 'Sides', value: 250, fill: 'var(--color-sides)' },
  { name: 'Drinks', value: 150, fill: 'var(--color-drinks)' },
];

const chartConfig = {
  sales: {
    label: "Sales",
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
    label: "Salads",
    color: "hsl(var(--chart-3))",
  },
  pastas: {
    label: "Pastas",
    color: "hsl(var(--chart-4))",
  },
  sides: {
    label: "Sides",
    color: "hsl(var(--chart-5))",
  },
  drinks: {
    label: "Drinks",
    color: "hsl(var(--muted))",
  },
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
       <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Trend</CardTitle>
          <CardDescription>A look at your revenue over the past few months.</CardDescription>
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
            <CardTitle>Top 5 Selling Products</CardTitle>
            <CardDescription>Your most popular items this month.</CardDescription>
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
            <CardTitle>Sales by Category</CardTitle>
             <CardDescription>Breakdown of sales across different categories.</CardDescription>
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
            <CardTitle>Gross Margin Analysis (Placeholder)</CardTitle>
            <CardDescription>Understanding your profitability.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 bg-secondary rounded-lg">
            <p className="text-muted-foreground">Chart for Gross Margin will be here.</p>
          </CardContent>
        </Card>
    </div>
  );
}
