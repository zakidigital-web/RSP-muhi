'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  UserPlus, 
  FileText, 
  Download,
  Users,
  Receipt,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { QuickPaymentDialog } from './QuickPaymentDialog';

const actions = [
  {
    title: 'Catat Pembayaran',
    description: 'Input pembayaran baru',
    icon: CreditCard,
    href: '/pembayaran',
    color: 'text-green-500',
  },
  {
    title: 'Tambah Siswa',
    description: 'Daftarkan siswa baru',
    icon: UserPlus,
    href: '/siswa?action=tambah',
    color: 'text-blue-500',
  },
  {
    title: 'Lihat Tunggakan',
    description: 'Cek siswa belum bayar',
    icon: FileText,
    href: '/laporan/tunggakan',
    color: 'text-red-500',
  },
  {
    title: 'Cetak Kuitansi',
    description: 'Cetak bukti pembayaran',
    icon: Receipt,
    href: '/pembayaran/riwayat',
    color: 'text-purple-500',
  },
  {
    title: 'Daftar Siswa',
    description: 'Kelola data siswa',
    icon: Users,
    href: '/siswa',
    color: 'text-orange-500',
  },
  {
    title: 'Export Laporan',
    description: 'Download laporan Excel',
    icon: Download,
    href: '/laporan/bulanan',
    color: 'text-cyan-500',
  },
];

export function QuickActions() {
  const [showQuickPayment, setShowQuickPayment] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Menu yang sering digunakan</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Payment Button - Highlighted */}
          <Button
            onClick={() => setShowQuickPayment(true)}
            className="w-full mb-4 h-auto p-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
            size="lg"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6" />
              <div className="text-left">
                <p className="font-bold text-base">⚡ Pencatatan Cepat</p>
                <p className="text-xs opacity-90">
                  Input pembayaran tanpa meninggalkan dashboard
                </p>
              </div>
            </div>
          </Button>

          {/* Regular Actions Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-2 p-4 hover:bg-muted"
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <QuickPaymentDialog 
        open={showQuickPayment} 
        onOpenChange={setShowQuickPayment} 
      />
    </>
  );
}