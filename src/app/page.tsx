import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Package, Sprout, BarChart, Bell, Users, Heart, Menu } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex h-auto min-h-20 items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">TableauChef</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 sm:gap-4 md:flex">
           <ThemeSwitcher />
           <Button variant="ghost" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Demander un Accès</Link>
          </Button>
           <Button variant="secondary" asChild>
                <Link href="/contact">
                    <Heart className="mr-2 h-4 w-4" /> Faites un don
                </Link>
            </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Ouvrir le menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href="/contact">Contact</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/contact">Demander un Accès</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/contact">
                            <Heart className="mr-2 h-4 w-4" />Faites un don
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            La Plateforme Ultime de Gestion de Restaurant
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground">
            De l'inventaire et des recettes aux commandes et paiements, TableauChef rassemble toutes les opérations de votre restaurant en un seul tableau de bord élégant.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/contact">Commencer Gratuitement</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Nous Contacter</Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Tout ce dont vous avez besoin, rien de superflu.</h2>
              <p className="text-muted-foreground mt-2">Des fonctionnalités puissantes pour optimiser le succès de votre restaurant.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><UtensilsCrossed size={28}/></div>
                <h3 className="text-xl font-semibold">Gestion des Commandes</h3>
                <p className="mt-2 text-muted-foreground">Gérez les commandes sur place, à emporter et en livraison avec une interface intuitive.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Package size={28}/></div>
                <h3 className="text-xl font-semibold">Contrôle de l'Inventaire</h3>
                <p className="mt-2 text-muted-foreground">Suivez les niveaux de stock en temps réel, gérez les fournisseurs et réduisez le gaspillage.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Sprout size={28}/></div>
                <h3 className="text-xl font-semibold">Ingénierie des Recettes & Menus</h3>
                <p className="mt-2 text-muted-foreground">Gérez les recettes, calculez les coûts alimentaires et optimisez votre menu pour la rentabilité.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><BarChart size={28}/></div>
                <h3 className="text-xl font-semibold">Rapports Détaillés</h3>
                <p className="mt-2 text-muted-foreground">Obtenez des analyses détaillées sur les ventes, les produits phares et les marges bénéficiaires.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Bell size={28}/></div>
                <h3 className="text-xl font-semibold">Notifications Intelligentes</h3>
                <p className="mt-2 text-muted-foreground">Restez informé avec des alertes pour les stocks bas, les nouvelles commandes, et plus encore.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4"><Users size={28}/></div>
                <h3 className="text-xl font-semibold">Prêt pour Multi-Sites</h3>
                <p className="mt-2 text-muted-foreground">Gérez plusieurs succursales à partir d'un seul compte avec facilité.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} TableauChef. Tous droits réservés.</p>
        </div>
        <nav className="flex gap-4">
          <Link href="/user-guide" className="text-sm text-muted-foreground hover:text-foreground">Guide d'utilisation</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Confidentialité</Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Conditions</Link>
        </nav>
      </footer>
    </div>
  );
}
