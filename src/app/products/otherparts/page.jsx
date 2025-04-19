'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Cog, AlertCircle } from 'lucide-react';
import DragDropList from '@/components/DragDropList';

export default function OtherPartsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/otherparts');
      
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.status}`);
      }
      
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch other parts products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Cog size={28} className="text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Other Parts
          </h1>
        </div>
        
        <button 
          onClick={handleRefresh} 
          disabled={isLoading || refreshing}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isLoading || refreshing
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
          }`}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-medium text-gray-800 dark:text-gray-200">
            Product List
          </h2>
          {!isLoading && !error && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {items.length} {items.length === 1 ? 'product' : 'products'} found
            </div>
          )}
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="animate-pulse flex space-x-2 mb-4">
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading products...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex justify-center">
              <div className="flex items-center text-red-500 dark:text-red-400">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            </div>
          ) : (
            <DragDropList items={items} category="OtherParts" />
          )}
        </div>
      </div>
    </div>
  );
}