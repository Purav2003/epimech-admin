'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { LogOut, Moon, Sun, Menu, X, Bell, User, Settings, Home, Mail, Droplet, Package } from 'lucide-react';

export default function RedesignedAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginPath, setLoginPath] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order received', time: '5m ago', read: false },
    { id: 2, text: 'System update scheduled', time: '1h ago', read: false },
    { id: 3, text: 'Inventory low alert', time: '3h ago', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: 'Mail', href: '/mail', icon: <Mail size={18} /> },
    { label: 'Water Pump', href: '/products/waterpump', icon: <Droplet size={18} /> },
    { label: 'Other Parts', href: '/products/otherparts', icon: <Package size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      Cookies.remove('token');
      Cookies.remove('otp');
      localStorage.removeItem('user');
      
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Cookies.remove('token');
      Cookies.remove('otp');
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const handleScroll = () => {
    if (window.scrollY > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');

    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/register') {
      setLoginPath(true);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications || isUserMenuOpen) {
        if (!event.target.closest('.notification-panel') && 
            !event.target.closest('.user-menu') && 
            !event.target.closest('.notification-button') &&
            !event.target.closest('.user-menu-button')) {
          setShowNotifications(false);
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, isUserMenuOpen]);

  if (loginPath) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white dark:bg-gray-900 shadow-lg backdrop-blur bg-opacity-90 dark:bg-opacity-90' 
          : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="bg-blue-600 dark:bg-blue-500 w-8 h-8 rounded flex items-center justify-center mr-2">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-white">Epimech Admin</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    pathname.startsWith(item.href)
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Actions area */}
            <div className="flex items-center space-x-3">
              {/* Notification bell */}
             

              {/* Theme toggle */}
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setShowNotifications(false);
                  }}
                  className="user-menu-button flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Admin User</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">info@epimech.com</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                    >
                      <div className="flex items-center">
                        {isLoggingOut ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          <LogOut size={16} className="mr-2" />
                        )}
                        Log Out
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith(item.href)
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}