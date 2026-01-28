'use client';

import { StatsCards } from './StatsCards';
import { PaymentChart } from './PaymentChart';
import { RecentPayments } from './RecentPayments';
import { QuickActions } from './QuickActions';

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Sistem Pembayaran SPP
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <QuickActions />
          <PaymentChart />
        </div>
        <RecentPayments />
      </div>
    </div>
  );
}