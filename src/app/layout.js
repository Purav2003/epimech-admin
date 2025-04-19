// src/app/layout.js
import './globals.css';
import { Toaster } from 'react-hot-toast';

import NextTopLoader from 'nextjs-toploader';
import AdminNavbar from '@/components/AdminNavbar';


export const metadata = {
  title: 'Epimech',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Ponomar&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" type="application/manifest+json" />
        <link rel="apple-touch-icon" href="/fav.png" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/fav.png" />
      </head>
      <body className="antialiased custom-cursor outline-none">
        <NextTopLoader showSpinner={false} crawlSpeed={200} height={3} />
        <Toaster />
        <AdminNavbar />
        <div className='dark:bg-gray-900 h-screen'>
          {/* <CustomCursor /> ⬅ Add this here */}
          {children}
        </div>
      </body>
    </html>
  );
}
