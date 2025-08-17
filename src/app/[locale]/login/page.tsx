
'use client';
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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      // The redirect is handled by the AuthContext now
      // router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de Connexion",
        description: "Email ou mot de passe incorrect.",
      });
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">TableauChef</span>
          </Link>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loadingButton') : t('submitButton')}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            {t('noAccount')}{" "}
            <Link href="/signup" className="underline">
              {t('signUp')}
            </Link>
          </div>
          <Separator className="my-4" />
           <div className="flex justify-center items-center text-sm gap-4">
                <Link href="/contact" className="underline">
                    {t('contactSupport')}
                </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
