import { AdminLayout } from '@/components/admin/AdminLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backoffice | ADL Kairouan',
  description: 'Administration platform for ADL Kairouan',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
