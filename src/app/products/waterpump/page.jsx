'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Package2, AlertCircle, Plus, Filter, Search, ChevronDown, ArrowUpDown, Droplets } from 'lucide-react';
import DragDropList from '@/components/DragDropList';
import Link from 'next/link';

export default function WaterPumpPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('default');
  const [viewMode, setViewMode] = useState('list');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/waterpump');

      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.status}`);
      }

      const data = await res.json();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error('Failed to fetch water pump products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  useEffect(() => {
    let sorted = [...filteredItems];
    switch (sortCriteria) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Default sorting - preserves original order
        sorted = [...filteredItems];
    }
    setFilteredItems(sorted);
  }, [sortCriteria]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };

  // Sample filter categories for water pumps
  const filterCategories = [
    { name: 'Centrifugal Pumps', count: 12 },
    { name: 'Submersible Pumps', count: 8 },
    { name: 'Jet Pumps', count: 5 },
    { name: 'Booster Pumps', count: 3 },
    { name: 'Self-Priming Pumps', count: 4 }
  ];

  // Sample stats 
  const stats = [
    { label: 'Total Products', value: items.length },
    { label: 'Displaying Products', value: items.filter(i => i.is_hide === false).length },
    { label: 'Hidden Products', value: items.filter(i => i.is_hide === true).length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pb-16">
      {/* Decorative water-themed elements */}
      <div className="absolute top-0 left-0 w-full min-h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/5 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-cyan-400/5 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-blue-300/5 dark:bg-blue-300/10 rounded-full blur-3xl"></div>
        
        <svg className="absolute -bottom-10 -left-10 text-blue-100 dark:text-blue-900/20 opacity-30" width="300" height="300" viewBox="0 0 100 100">
          <path d="M50,5 C55,25 80,40 50,95 C20,40 45,25 50,5 Z" fill="currentColor" />
        </svg>
        
        <svg className="absolute top-40 right-0 text-cyan-100 dark:text-cyan-900/30 opacity-20 rotate-45" width="200" height="200" viewBox="0 0 100 100">
          <path d="M50,5 C55,25 80,40 50,95 C20,40 45,25 50,5 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12 relative z-10">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600 rounded-2xl p-6 mb-8 overflow-hidden shadow-lg">
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute -bottom-10 right-10 text-white/10" width="300" height="300" viewBox="0 0 100 100">
              <path d="M50,5 C55,25 80,40 50,95 C20,40 45,25 50,5 Z" fill="currentColor" />
            </svg>
            <svg className="absolute -top-20 -right-10 text-white/10 rotate-45" width="200" height="200" viewBox="0 0 100 100">
              <path d="M50,5 C55,25 80,40 50,95 C20,40 45,25 50,5 Z" fill="currentColor" />
            </svg>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4 backdrop-blur-sm">
                  <Droplets size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Water Pump Products
                </h1>
              </div>
              <p className="mt-2 text-blue-50">
                Manage and organize your water pump inventory
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading || refreshing}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLoading || refreshing
                  ? 'bg-white/20 text-white/60 cursor-not-allowed backdrop-blur-sm'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <Link href={`/products/add-product?category=Waterpump`}>
                <button className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white hover:bg-blue-50 text-blue-600 hover:shadow-md">
                  <Plus size={16} className="mr-2" />
                  Add Product
                </button>
              </Link>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-blue-50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

      
        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent">
            <h2 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <Package2 size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
              Water Pump Products
            </h2>
            {!isLoading && !error && (
              <div className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'} found
              </div>
            )}
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-100 dark:border-blue-900 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets size={16} className="text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading products...</p>
              </div>
            ) : error ? (
              <div className="py-12 flex justify-center">
                <div className="flex flex-col items-center text-red-500 dark:text-red-400 text-center">
                  <AlertCircle size={36} className="mb-2" />
                  <p>{error}</p>
                  <button 
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                  <Package2 size={32} className="text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
                  {searchTerm ? 'No products match your search criteria.' : 'Your product list is empty.'}
                </p>
                <Link href={`/products/add-product?category=Waterpump`}>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center">
                    <Plus size={16} className="mr-2" />
                    Add New Product
                  </button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
                <DragDropList 
                  items={filteredItems} 
                  category="WaterPump" 
                  handleRefresh={handleRefresh}
                  viewMode={viewMode} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}