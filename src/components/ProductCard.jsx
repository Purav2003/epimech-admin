'use client';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Eye, EyeOff, Tag, BarChart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ProductEditorModal from '@/components/ProductEditorModal';

export default function EnhancedProductCard({ item, category, isOverlay = false, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [local, setLocal] = useState(item);
  const [image, setImage] = useState(item.image || '/fallback.png');
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 100));
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    // Update local state when item prop changes
    setLocal(item);
    setImage(item.image || '/fallback.png');
  }, [item]);

  const handleSave = (updated) => {
    setLocal(updated);
    if (onRefresh) onRefresh();
  };

  const handleDelete = async () => {
    setShowConfirmDelete(false);
    try {
      setIsDeleting(true);
      await fetch(`/api/${category.toLowerCase()}/${local._id}`, {
        method: 'DELETE'
      });
      if (onRefresh) {
        onRefresh();
      } else {
        location.reload();
      }
    } catch (err) {
      alert('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    try {
      const updated = { ...local, is_hide: !local.is_hide };
      const res = await fetch(`/api/${category.toLowerCase()}/${local._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      setLocal(data);
      if (onRefresh) onRefresh();
    } catch {
      alert('Failed to update visibility status');
    }
  };

  const handleError = () => {
    setImage('/fallback.png');
  };

  const incrementViewCount = () => {
    setViewCount(prev => prev + 1);
  };

  const cardVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }
  };

  const formatPartNumbers = () => {
    if (!local.part_number || Object.keys(local.part_number).length === 0) {
      return <span className="italic text-gray-400">No part numbers</span>;
    }
    
    return Object.entries(local.part_number).map(([key, value], index) => (
      <span key={key} className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 mr-1 mb-1">
        <Tag size={12} className="mr-1" />
        {value}
      </span>
    )).slice(0, isExpanded ? undefined : 2);
  };

  return (
    <>
      <motion.div 
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow ${isOverlay ? 'opacity-80' : ''}`}
        initial="normal"
        whileHover="hover"
        variants={cardVariants}
        transition={{ duration: 0.2 }}
      >
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium ${
          local.is_hide 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' 
            : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
        }`}>
          {local.is_hide ? 'Hidden' : 'Active'}
        </div>

        {/* Image with Gradient Overlay */}
        <div className="relative w-full h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0" />
          {local.image ? (
            <img 
              src={image} 
              alt={local.part_name} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
              onError={handleError}
              onClick={incrementViewCount}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <img src="/fallback.png" alt="Fallback" className="max-w-[70%] max-h-[70%] object-contain opacity-50" />
            </div>
          )}
          
          {/* Rank Badge */}
          <div className="absolute bottom-2 left-2 flex items-center bg-black/60 text-white px-3 py-1 rounded-full text-xs">
            <BarChart size={14} className="mr-1" />
            Rank: {local.rank}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">{local.part_name}</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Part Numbers:</p>
            <div className="flex flex-wrap">
              {formatPartNumbers()}
              {!isExpanded && Object.keys(local.part_number || {}).length > 2 && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  +{Object.keys(local.part_number).length - 2} more
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            {/* <span className="inline-flex items-center">
              <Eye size={14} className="mr-1" /> {viewCount} views
            </span> */}
            <span className="inline-flex items-center">
              Category: <span className="font-medium ml-1">{category}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleToggle}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                local.is_hide
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
              }`}
            >
              {local.is_hide ? <EyeOff size={14} /> : <Eye size={14} />}
              {local.is_hide ? 'Unhide' : 'Hide'}
            </button>
            
            <button
              onClick={() => setEditing(local)}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              <Pencil size={14} /> Edit
            </button>
            
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={isDeleting}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg ${
                isDeleting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              }`}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <ProductEditorModal
        open={!!editing}
        onClose={() => setEditing(null)}
        product={editing}
        onSave={handleSave}
        category={category}
      />

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-semibold">{local.part_name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}