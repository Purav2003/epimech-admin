'use client';
import { useState } from 'react';
import { GripVertical, Trash2, Pencil, EyeOff, Eye } from 'lucide-react';
import SortableRow from './SortableRow';
import ProductEditorModal from '@/components/ProductEditorModal';

export default function ProductTable({ items, category }) {
  const [products, setProducts] = useState(items);
  const [editing, setEditing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleSave = (updated) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(id);
      if (!confirm('Are you sure you want to delete this item?')) return;
      
      await fetch(`/api/${category.toLowerCase()}/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleHide = async (product) => {
    try {
      const updated = { ...product, is_hide: !product.is_hide };
      const res = await fetch(`/api/${category.toLowerCase()}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!res.ok) throw new Error('Failed to update visibility');
      
      const data = await res.json();
      handleSave(data);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update product visibility. Please try again.');
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-sm">
              <th className="p-2 w-8 text-center border-b border-gray-200 dark:border-gray-600"></th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-600">Image</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-600 text-left">Part Name</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-600 text-left">Part Number</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-600 text-center">Rank</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-600 text-center">Status</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {products.map((item) => (
              <SortableRow key={item._id} item={item}>
                <td className="p-3">
                  <div className="relative w-24 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.part_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                  {item.part_name}
                </td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                  {Object.values(item.part_number || {}).length > 0 
                    ? Object.values(item.part_number || {}).join(', ')
                    : <span className="text-gray-400 dark:text-gray-500 italic">No part number</span>
                  }
                </td>
                <td className="p-3 text-center">
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                    {item.rank}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleToggleHide(item)}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      item.is_hide 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {item.is_hide ? (
                      <>
                        <EyeOff size={14} className="mr-1" />
                        <span>Hidden</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} className="mr-1" />
                        <span>Visible</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditing(item)}
                      className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-xs font-medium"
                    >
                      <Pencil size={14} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={isDeleting === item._id}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                        isDeleting === item._id
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      }`}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </SortableRow>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          No products available
        </div>
      )}

      {/* Edit Modal */}
      <ProductEditorModal
        open={!!editing}
        onClose={() => setEditing(null)}
        product={editing}
        onSave={handleSave}
        category={category}
      />
    </>
  );
}