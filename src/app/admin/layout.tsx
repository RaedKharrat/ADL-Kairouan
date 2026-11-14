import { AdminLayout } from '@/components/admin/AdminLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backoffice | ADL Tunisie',
  description: 'Administration platform for ADL Tunisie',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
