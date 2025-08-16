import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Package, Sprout, BarChart, Bell, Users } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">TableauChef</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            The Ultimate Restaurant Management Platform
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground">
            From inventory and recipes to orders and payments, TableauChef brings all your restaurant operations into one single, elegant dashboard.
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started For Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#">Contact Sales</Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything you need, nothing you don't.</h2>
              <p className="text-muted-foreground mt-2">Powerful features to streamline your restaurant's success.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><UtensilsCrossed size={28}/></div>
                <h3 className="text-xl font-semibold">Order Management</h3>
                <p className="mt-2 text-muted-foreground">Handle dine-in, takeout, and delivery orders with a seamless, intuitive interface.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Package size={28}/></div>
                <h3 className="text-xl font-semibold">Inventory Control</h3>
                <p className="mt-2 text-muted-foreground">Track stock levels in real-time, manage suppliers, and reduce waste.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Sprout size={28}/></div>
                <h3 className="text-xl font-semibold">Recipe & Menu Engineering</h3>
                <p className="mt-2 text-muted-foreground">Manage recipes, calculate food costs, and optimize your menu for profitability.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><BarChart size={28}/></div>
                <h3 className="text-xl font-semibold">Insightful Reports</h3>
                <p className="mt-2 text-muted-foreground">Get detailed analytics on sales, top products, and profit margins.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Bell size={28}/></div>
                <h3 className="text-xl font-semibold">Smart Notifications</h3>
                <p className="mt-2 text-muted-foreground">Stay informed with alerts for low stock, new orders, and more.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Users size={28}/></div>
                <h3 className="text-xl font-semibold">Multi-Location Ready</h3>
                <p className="mt-2 text-muted-foreground">Manage multiple branches from a single account with ease.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} TableauChef. All rights reserved.</p>
        </div>
        <nav className="flex gap-4">
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
