
import { IdentitasSekolah } from '@/components/pengaturan/IdentitasSekolah';
import { AdminSettings } from '@/components/pengaturan/AdminSettings';
import { MultiAdminSettings } from '@/components/pengaturan/MultiAdminSettings';

export default function SekolahPage() {
  return (
    <div className="space-y-6">
      <IdentitasSekolah />
      <AdminSettings />
      <MultiAdminSettings />
    </div>
  );
}
