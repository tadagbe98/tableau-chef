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
  { name: 'Pizzas', value: 400 },
  { name: 'Burgers', value: 300 },
  { name: 'Salads', value: 300 },
  { name: 'Pastas', value: 200 },
  { name: 'Sides', value: 250 },
  { name: 'Drinks', value: 150 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Selling Products</CardTitle>
            <CardDescription>Your most popular items this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" background={{ fill: 'hsl(var(--secondary))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
             <CardDescription>Breakdown of sales across different categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                 <Tooltip
                    contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    }}
                />
              </PieChart>
            </ResponsiveContainer>
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
