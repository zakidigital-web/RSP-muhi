
import { IdentitasSekolah } from '@/components/pengaturan/IdentitasSekolah';
import { AdminSettings } from '@/components/pengaturan/AdminSettings';

export default function SekolahPage() {
  return (
    <div className="space-y-6">
      <IdentitasSekolah />
      <AdminSettings />
    </div>
  );
}
