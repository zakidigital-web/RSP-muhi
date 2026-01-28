import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { AcademicYearProvider } from "@/hooks/useAcademicYearContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Sistem Pembayaran SPP",
  description: "Manajemen pembayaran SPP dan keuangan sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="cf99c5df-fc00-4e59-a101-0e00ffb8c07c"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "SPPManager", "version": "1.0.0"}'
        />
          <AuthProvider>
            <AcademicYearProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </AcademicYearProvider>
          </AuthProvider>
          <Toaster richColors closeButton position="top-center" />
          <VisualEditsMessenger />
        </body>
      </html>
  );
}
