'use client';
import { useState, useEffect } from 'react';
import InquiryList from '@/components/InquiryList';

export default function MailAdminPage() {
  const [tab, setTab] = useState('CONTACT-US');
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 -mt-20 mt-0 relative z-10 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Mail Inbox
        </h1>
        
        <div className="inline-flex items-center p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
          <button 
            onClick={() => setTab('CONTACT-US')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === 'CONTACT-US' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Contact Us
          </button>
          <button 
            onClick={() => setTab('PRODUCT')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === 'PRODUCT' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Product Quotation
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {tab === 'CONTACT-US' ? 'Contact Messages' : 'Product Inquiries'}
            </h2>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {inquiries.length} {inquiries.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : (
            <InquiryList inquiries={inquiries} />
          )}
        </div>
      </div>
    </div>
  );
}