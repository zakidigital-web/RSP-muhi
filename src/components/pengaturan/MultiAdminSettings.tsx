'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Save, Plus, Pencil, Check, X, Loader2, Info, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  id: number;
  name: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoginHintSettings {
  showLoginHint: boolean;
  loginHintText: string;
}

export function MultiAdminSettings() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [hintSettings, setHintSettings] = useState<LoginHintSettings>({
    showLoginHint: true,
    loginHintText: 'Hubungi administrator untuk mendapatkan password.',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', password: '' });
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [isSavingHint, setIsSavingHint] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', password: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/settings'),
      ]);
      const usersData = await usersRes.json();
      const settingsData = await settingsRes.json();

      if (usersRes.ok) setAdmins(Array.isArray(usersData) ? usersData : []);
      if (settingsRes.ok) {
        setHintSettings({
          showLoginHint: settingsData.showLoginHint ?? true,
          loginHintText: settingsData.loginHintText || 'Hubungi administrator untuk mendapatkan password.',
        });
      }
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (admin: AdminUser) => {
    setEditingId(admin.id);
    setEditForm({ name: admin.name, password: admin.password });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', password: '' });
  };

  const saveEdit = async (id: number) => {
    if (!editForm.name.trim() || !editForm.password.trim()) {
      toast.error('Nama dan password tidak boleh kosong');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, password: editForm.password }),
      });
      if (res.ok) {
        toast.success('Admin berhasil diperbarui');
        setEditingId(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal memperbarui admin');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const toggleActive = async (admin: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users?id=${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      if (res.ok) {
        toast.success(`Admin ${admin.name} ${!admin.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchData();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const addAdmin = async () => {
    if (!newAdmin.name.trim() || !newAdmin.password.trim()) {
      toast.error('Nama dan password wajib diisi');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
      if (res.ok) {
        toast.success('Admin baru berhasil ditambahkan');
        setIsAddingNew(false);
        setNewAdmin({ name: '', password: '' });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menambah admin');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const saveHintSettings = async () => {
    setIsSavingHint(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hintSettings),
      });
      if (res.ok) {
        toast.success('Pengaturan petunjuk login berhasil disimpan');
      } else {
        toast.error('Gagal menyimpan pengaturan');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSavingHint(false);
    }
  };

  const toggleShowPassword = (id: number) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-admin management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Manajemen Admin
              </CardTitle>
              <CardDescription className="mt-1">
                Kelola akun admin yang dapat masuk ke sistem. Nama admin akan tercatat di setiap transaksi.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Form tambah admin baru */}
          {isAddingNew && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-medium text-primary">Admin Baru</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nama Admin</Label>
                  <Input
                    placeholder="misal: Admin 4"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Password</Label>
                  <Input
                    placeholder="Password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => { setIsAddingNew(false); setNewAdmin({ name: '', password: '' }); }}>
                  <X className="h-4 w-4 mr-1" /> Batal
                </Button>
                <Button size="sm" onClick={addAdmin}>
                  <Check className="h-4 w-4 mr-1" /> Simpan
                </Button>
              </div>
            </div>
          )}

          {/* Daftar admin */}
          {admins.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">Belum ada admin. Klik "Tambah Admin" untuk membuat akun pertama.</p>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.id}
                className={`rounded-lg border p-4 transition-colors ${admin.isActive ? 'bg-card' : 'bg-muted/30 opacity-60'}`}
              >
                {editingId === admin.id ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nama Admin</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Password</Label>
                        <Input
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" /> Batal
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(admin.id)}>
                        <Check className="h-4 w-4 mr-1" /> Simpan
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{admin.name}</p>
                        <Badge variant={admin.isActive ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {admin.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-xs text-muted-foreground font-mono">
                          {showPassword[admin.id] ? admin.password : '•'.repeat(Math.min(admin.password.length, 10))}
                        </p>
                        <button
                          onClick={() => toggleShowPassword(admin.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword[admin.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(admin)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 ${admin.isActive ? 'text-orange-500 hover:text-orange-600' : 'text-green-600 hover:text-green-700'}`}
                        onClick={() => toggleActive(admin)}
                        title={admin.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {admin.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <p className="text-[11px] text-muted-foreground pt-1">
            💡 Nama admin akan otomatis tercatat sebagai <strong>dicatat oleh</strong> pada setiap transaksi pembayaran.
          </p>
        </CardContent>
      </Card>

      {/* Pengaturan petunjuk login */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Petunjuk Halaman Login
          </CardTitle>
          <CardDescription>
            Atur tampilan dan isi teks petunjuk yang muncul di halaman login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Tampilkan Petunjuk Login</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aktifkan untuk menampilkan pesan petunjuk di bawah tombol login
              </p>
            </div>
            <Switch
              checked={hintSettings.showLoginHint}
              onCheckedChange={(checked) => setHintSettings({ ...hintSettings, showLoginHint: checked })}
            />
          </div>

          {hintSettings.showLoginHint && (
            <div className="space-y-2">
              <Label htmlFor="loginHintText">Teks Petunjuk</Label>
              <textarea
                id="loginHintText"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Hubungi administrator untuk mendapatkan password."
                value={hintSettings.loginHintText}
                onChange={(e) => setHintSettings({ ...hintSettings, loginHintText: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground">
                Teks ini akan muncul di halaman login di bawah tombol masuk.
              </p>
            </div>
          )}

          {/* Preview */}
          {hintSettings.showLoginHint && hintSettings.loginHintText && (
            <div className="rounded-lg border border-dashed p-3">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Preview</p>
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {hintSettings.loginHintText}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={saveHintSettings} disabled={isSavingHint}>
              {isSavingHint ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Pengaturan Petunjuk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
