'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, CreditCard, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function BottomNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    {
      title: 'Beranda',
      href: '/',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Siswa',
      href: '/siswa',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Bayar',
      href: '/pembayaran',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: 'Tracking',
      href: '/laporan/tracking',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Keluar',
      href: '#',
      icon: <LogOut className="h-5 w-5" />,
      onClick: logout,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card/80 backdrop-blur-lg px-2 pb-safe lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = item.href !== '#' && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
        const isCenter = item.title === 'Bayar';
        
        const content = (
          <div className={cn(
            'flex items-center justify-center transition-transform',
            isActive && !isCenter && 'scale-110'
          )}>
            {item.icon}
          </div>
        );

        if (item.onClick) {
          return (
            <button
              key={item.title}
              onClick={item.onClick}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-all duration-200 rounded-md px-3 py-1 text-destructive hover:bg-destructive/10'
              )}
            >
              {content}
              <span className="text-[10px] font-medium text-destructive">{item.title}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 transition-all duration-200',
              isCenter 
                ? 'h-14 w-14 -translate-y-4 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95' 
                : 'rounded-md px-3 py-1',
              !isCenter && (isActive ? 'text-primary' : 'text-muted-foreground')
            )}
          >
            {content}
            {!isCenter && (
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            )}
            {isActive && !isCenter && (
              <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
