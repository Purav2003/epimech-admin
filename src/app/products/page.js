'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Package2, AlertCircle } from 'lucide-react';
import DragDropList from '../../components/DragDropList';

const categories = [
  { name: 'WaterPump', label: 'Water Pump', endpoint: '/api/waterpump' },
  { name: 'OtherParts', label: 'Other Parts', endpoint: '/api/otherparts' }
];

export default function ProductAdminPage() {
  const [tab, setTab] = useState('WaterPump');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const cat = categories.find((c) => c.name === tab);
        const res = await fetch(`${cat.endpoint}?search=${encodeURIComponent(search)}`);
        
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.status}`);
        }
        
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [tab, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Product Manager
        </h1>
        
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center transition-colors shadow-sm">
          <Plus size={18} className="mr-2" />
          Add New Product
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="inline-flex p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
              {categories.map((c) => (
                <button 
                  key={c.name} 
                  onClick={() => setTab(c.name)} 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    tab === c.name 
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Package2 size={16} />
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by part name or number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {search && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setSearch('')}
                >
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="py-8 flex justify-center">
              <div className="flex items-center text-red-500 dark:text-red-400">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            </div>
          ) : (
            <DragDropList items={items} category={tab} />
          )}
        </div>
      </div>
    </div>
  );
}