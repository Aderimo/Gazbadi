import { getAllItems } from '@/lib/data';
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminPage() {
  const items = getAllItems();
  return <AdminDashboardClient items={items} />;
}
