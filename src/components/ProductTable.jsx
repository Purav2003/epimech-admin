'use client';
import { useState } from 'react';
import { Trash2, Pencil, EyeOff, Eye, GripVertical } from 'lucide-react';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {products.map((item) => (
          <SortableRow key={item._id} item={item}>
            <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow transition hover:shadow-md">
              <div className="absolute top-2 left-2 cursor-grab text-gray-400" title="Drag">
                <GripVertical size={18} />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.part_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">{item.part_name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.values(item.part_number || {}).join(', ') || <i>No part number</i>}
                  </p>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Rank: <span className="font-medium">{item.rank}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <button
                  onClick={() => handleToggleHide(item)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                    item.is_hide
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {item.is_hide ? <EyeOff size={14} /> : <Eye size={14} />}
                  {item.is_hide ? 'Hidden' : 'Visible'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(item)}
                    className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={isDeleting === item._id}
                    className={`px-2 py-1 rounded ${
                      isDeleting === item._id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </SortableRow>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">No products available</div>
      )}

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
