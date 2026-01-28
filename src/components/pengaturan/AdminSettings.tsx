'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Save, Globe, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    password: '',
    appName: '',
    appLogo: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (response.ok) {
        setSettings({
          password: data.password,
          appName: data.appName,
          appLogo: data.appLogo || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Pengaturan admin berhasil diperbarui');
        // Reload to apply changes to sidebar/branding
        window.location.reload();
      } else {
        toast.error('Gagal memperbarui pengaturan');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold tracking-tight">Pengaturan Aplikasi & Keamanan</h2>
        <p className="text-muted-foreground text-sm">
          Kelola nama aplikasi, icon, dan password akses admin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Branding Aplikasi</CardTitle>
            </div>
            <CardDescription>
              Ubah nama dan icon yang muncul di menu samping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Nama Aplikasi / Instansi</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                placeholder="SPP Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appLogo">URL Icon / Logo (Gambar)</Label>
              <div className="flex gap-2">
                <Input
                  id="appLogo"
                  value={settings.appLogo}
                  onChange={(e) => setSettings({ ...settings, appLogo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {settings.appLogo && (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <img 
                      src={settings.appLogo} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Masukkan URL gambar atau base64 untuk mengganti icon Graduation Cap default.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-500" />
              <CardTitle>Keamanan Admin</CardTitle>
            </div>
            <CardDescription>
              Ganti password untuk masuk ke aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input
                id="password"
                type="text"
                value={settings.password}
                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                placeholder="Password Baru"
              />
            </div>
            <div className="rounded-lg bg-orange-50 p-3 border border-orange-100">
              <p className="text-xs text-orange-700"><strong>Catatan:</strong> Jangan berikan password ini kepada siapapun selain pengelola keuangan.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="min-w-[200px]">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
}
