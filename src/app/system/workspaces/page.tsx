import { redirect } from 'next/navigation';

export default function WorkspacesPage() {
  // Redirect admin to customer dashboard
  redirect('/customer/dashboard');
}
