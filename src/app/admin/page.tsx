import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons/logo"

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">TableauChef</span>
          </Link>
          <CardTitle className="text-2xl">Connexion Administrateur</CardTitle>
          <CardDescription>
            Accès réservé aux administrateurs du système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href="/dashboard">Se connecter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
