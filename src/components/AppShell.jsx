'use client';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';
import AdminNavbar from '@/components/AdminNavbar';

export default function AppShell({ children }) {
  const pathname = usePathname();

  const hideNavbar = pathname === '/login';

  return (
    <>
      <NextTopLoader showSpinner={false} crawlSpeed={200} height={3} />
      <Toaster />
      {!hideNavbar && <AdminNavbar />}
      <div className="dark:bg-gray-900 min-h-screen">{children}</div>
    </>
  );
}
