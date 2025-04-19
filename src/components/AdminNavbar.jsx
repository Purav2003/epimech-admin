'use client';
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Mail', href: '/mail' },
  { label: 'Water Pump', href: '/products/waterpump' },
  { label: 'Other Parts', href: '/products/otherparts' }
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/mail" className="flex-shrink-0 font-bold text-xl">
              Admin Panel
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-2 text-sm font-medium transition-all ${
                  pathname.startsWith(tab.href)
                    ? 'bg-blue-700 dark:bg-gray-700 rounded-md'
                    : 'hover:bg-blue-500 dark:hover:bg-gray-700 hover:rounded-md'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          
          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-full hover:bg-blue-500 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? 
                <Moon size={20} /> : 
                <Sun size={20} />
              }
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-blue-500 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-blue-500 dark:border-gray-700">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                  pathname.startsWith(tab.href)
                    ? 'bg-blue-700 dark:bg-gray-700'
                    : 'hover:bg-blue-500 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}