'use client';
import { useState, useEffect } from 'react';
import InquiryList from '@/components/InquiryList';

export default function MailAdminPage() {
  const [tab, setTab] = useState('CONTACT-US');
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchInquiries = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/inquiries');
        const data = await res.json();
        const filtered = data.filter((i) => i.type === tab);
        setInquiries(filtered);
      } catch (error) {
        console.error('Failed to fetch inquiries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInquiries();
  }, [tab]);

  // Search and filter functionality
  const filteredInquiries = inquiries.filter(inquiry => 
    inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort functionality
  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === 'alphabetical') {
      return a.name?.localeCompare(b.name);
    }
    return 0;
  });

  // Stats calculations
  const unreadCount = inquiries.filter(item => !item.read).length;
  const readPercentage = inquiries.length > 0 
    ? Math.round(((inquiries.length - unreadCount) / inquiries.length) * 100) 
    : 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col space-y-6">
          {/* Header with stats cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 h-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg shadow-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mail Inbox</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all your incoming inquiries in one place</p>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-700 backdrop-blur-sm shadow-inner">
                    <button 
                      onClick={() => setTab('CONTACT-US')} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        tab === 'CONTACT-US' 
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md transform scale-105' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Contact Us
                      </div>
                    </button>
                    <button 
                      onClick={() => setTab('PRODUCT')} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        tab === 'PRODUCT' 
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md transform scale-105' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Product Quotation
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">INBOX STATS</h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tab === 'CONTACT-US' ? 'Contact' : 'Product'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{inquiries.length}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unread</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Read Progress</span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{readPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${readPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
          
          {/* Main content area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  {tab === 'CONTACT-US' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Contact Messages
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Product Inquiries
                    </>
                  )}
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {inquiries.length} {inquiries.length === 1 ? 'item' : 'items'}
                  </span>
                </h2>
                
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-64 pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Sort dropdown */}
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                    <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin absolute top-2 left-2"></div>
                  </div>
                </div>
              ) : sortedInquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-full p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No messages found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    {searchTerm ? 'No results match your search criteria.' : 'Your inbox is empty. New messages will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <InquiryList inquiries={sortedInquiries} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}