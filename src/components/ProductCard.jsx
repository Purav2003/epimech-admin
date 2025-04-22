'use client';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import ProductEditorModal from '@/components/ProductEditorModal';
import Image from 'next/image';

export default function ProductCard({ item, category, isOverlay = false }) {
  const [editing, setEditing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [local, setLocal] = useState(item);
  const [image, setImage] = useState(item.image || '/fallback.png');

  const handleSave = (updated) => {
    setLocal(updated);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return;
    try {
      setIsDeleting(true);
      await fetch(`/api/${category.toLowerCase()}/${local._id}`, {
        method: 'DELETE'
      });
      location.reload(); // or better: call handleRefresh
    } catch (err) {
      alert('Failed to delete');
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
    } catch {
      alert('Failed to update status');
    }
  };

  const handleError = (e) => {

    setImage('/fallback.png'); // update state to trigger re-render
  }
    

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm ${isOverlay ? 'opacity-80' : ''}`}>
        {/* Image */}
        <div className="w-full h-60 bg-gray-100 dark:bg-white rounded mb-4 overflow-hidden flex items-center justify-center">
          {local.image ? (
            <img src={image} alt={local.part_name} className="w-full h-full object-contain" onError={handleError}/>
          ) : (
            <img src={'/fallback.png'} alt="Fallback" className="w-full h-full object-contain" />
)}
        </div>

        {/* Info */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{local.part_name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {Object.values(local.part_number || {}).join(', ') || <span className="italic text-gray-400">No part numbers</span>}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            Rank: {local.rank}
          </span>
          <button onClick={handleToggle} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full transition ${
            local.is_hide
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {local.is_hide ? <EyeOff size={14} /> : <Eye size={14} />}
            {local.is_hide ? 'Hidden' : 'Visible'}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={() => setEditing(local)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded ${
              isDeleting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
            }`}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

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
