import { redirect } from 'next/navigation';

export default function AdminHomeRedirect() {
  redirect('/admin/mail');
}
