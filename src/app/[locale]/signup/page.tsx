
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
import { useTranslations, useLocale } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currencies = ['EUR', 'USD', 'GBP', 'CHF'];
const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português (BR)' },
];

export default function SignupPage() {
  const t = useTranslations('SignupPage');
  const locale = useLocale();
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState(locale);
  const [currency, setCurrency] = useState('EUR');
  const [vatRate, setVatRate] = useState('20');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Erreur d'Inscription",
            description: "Le mot de passe doit contenir au moins 6 caractères.",
        });
        setLoading(false);
        return;
      }
      
      const signupData = {
          fullName,
          restaurantName,
          language,
          currency,
          vatRate: parseFloat(vatRate)
      }
      await signup(email, password, signupData);
      
      toast({
          title: "Compte créé !",
          description: "Votre compte administrateur a été créé avec succès."
      });

      router.push(`/${language}/dashboard`);

    } catch (error: any) {
       let description = "Impossible de créer le compte. Veuillez réessayer.";
       if (error.code === 'auth/email-already-in-use') {
           description = "Cet email est déjà utilisé par un autre compte.";
       }
       if (error.code === 'auth/weak-password') {
           description = "Le mot de passe doit contenir au moins 6 caractères.";
       }
       toast({
        variant: "destructive",
        title: "Erreur d'Inscription",
        description: description,
      });
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary py-12">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">TableauChef</span>
          </Link>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">{t('fullNameLabel')}</Label>
              <Input id="full-name" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="restaurant-name">{t('restaurantNameLabel')}</Label>
              <Input id="restaurant-name" placeholder="The Good Place" required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>
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
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="language">{t('languageLabel')}</Label>
                    <Select onValueChange={setLanguage} defaultValue={language}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currency">{t('currencyLabel')}</Label>
                    <Select onValueChange={setCurrency} defaultValue={currency}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                             {currencies.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="grid gap-2">
                <Label htmlFor="vatRate">{t('vatLabel')}</Label>
                <Input id="vatRate" type="number" step="0.01" placeholder="20" required value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
               {loading ? t('loadingButton') : t('submitButton')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('hasAccount')}{" "}
            <Link href="/login" className="underline">
              {t('logIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
