'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  GraduationCap, 
  Receipt, 
  BarChart3, 
  AlertCircle, 
  BookOpen, 
  Building, 
  Calendar, 
  Database, 
  ChevronDown, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAcademicYear } from '@/hooks/useAcademicYearContext';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Siswa',
    href: '/siswa',
    icon: <Users className="h-5 w-5" />,
    children: [
      { title: 'Daftar Siswa', href: '/siswa', icon: <Users className="h-4 w-4" /> },
      { title: 'Kelas', href: '/siswa/kelas', icon: <GraduationCap className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Pembayaran',
    href: '/pembayaran',
    icon: <CreditCard className="h-5 w-5" />,
    children: [
      { title: 'Catat Pembayaran', href: '/pembayaran', icon: <CreditCard className="h-4 w-4" /> },
      { title: 'Riwayat', href: '/pembayaran/riwayat', icon: <Receipt className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Laporan',
    href: '/laporan',
    icon: <FileText className="h-5 w-5" />,
    children: [
      { title: 'Tracking Tahunan', href: '/laporan/tracking', icon: <BarChart3 className="h-4 w-4" /> },
      { title: 'Laporan Bulanan', href: '/laporan/bulanan', icon: <FileText className="h-4 w-4" /> },
      { title: 'Buku Besar', href: '/laporan/buku-besar', icon: <BookOpen className="h-4 w-4" /> },
      { title: 'Tunggakan', href: '/laporan/tunggakan', icon: <AlertCircle className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Pengaturan',
    href: '/pengaturan',
    icon: <Settings className="h-5 w-5" />,
    children: [
      { title: 'Jenis Pembayaran', href: '/pengaturan/jenis-pembayaran', icon: <CreditCard className="h-4 w-4" /> },
      { title: 'Identitas Sekolah', href: '/pengaturan/sekolah', icon: <Building className="h-4 w-4" /> },
      { title: 'Tahun Ajaran', href: '/pengaturan/tahun-ajaran', icon: <Calendar className="h-4 w-4" /> },
      { title: 'Database', href: '/pengaturan/database', icon: <Database className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Petunjuk',
    href: '/petunjuk',
    icon: <BookOpen className="h-5 w-5" />,
  },
];

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    item.children?.some(child => pathname === child.href) || pathname === item.href
  );

  const isActive = pathname === item.href || 
    (item.children?.some(child => pathname === child.href) && !item.children);

  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive || isOpen
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.title}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === child.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.icon}
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        pathname === item.href
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {item.icon}
      <span>{item.title}</span>
    </Link>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeYear } = useAcademicYear();
  const { logout } = useAuth();
  const [branding, setBranding] = useState({ name: 'SPP Manager', logo: '' });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setBranding({ 
            name: data.appName || 'SPP Manager', 
            logo: data.appLogo || '' 
          });
        }
      })
      .catch(err => console.error('Error fetching branding:', err));
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform lg:translate-x-0 flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary overflow-hidden">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-semibold truncate max-w-[140px]">{branding.name}</h1>
              <p className="text-xs text-muted-foreground">Manajemen Sekolah</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>

        <div className="border-t border-border p-4 space-y-2">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium">Tahun Ajaran</p>
            <p className="text-sm font-semibold text-primary">
              {activeYear ? activeYear.name : 'Memuat...'}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Aplikasi</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
