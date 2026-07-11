'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GraduationCap, Lock, AlertCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface LoginSettings {
  appName: string;
  appLogo: string | null;
  showLoginHint: boolean;
  loginHintText: string;
}

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<LoginSettings>({
    appName: 'SPP Manager',
    appLogo: null,
    showLoginHint: true,
    loginHintText: 'Hubungi administrator untuk mendapatkan password.',
  });
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            appName: data.appName || 'SPP Manager',
            appLogo: data.appLogo || null,
            showLoginHint: data.showLoginHint ?? true,
            loginHintText: data.loginHintText || 'Hubungi administrator untuk mendapatkan password.',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(password);
    if (success) {
      toast.success('Login berhasil! Selamat datang kembali.');
      router.push('/');
    } else {
      setError('Password salah. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg overflow-hidden">
              {settings.appLogo ? (
                <img
                  src={settings.appLogo}
                  alt={settings.appName}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <GraduationCap className="h-6 w-6" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Login Admin</CardTitle>
          <CardDescription>
            Masukkan password untuk mengakses {settings.appName}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk ke Aplikasi'
              )}
            </Button>
            {settings.showLoginHint && settings.loginHintText && (
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 w-full">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {settings.loginHintText}
                </p>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
