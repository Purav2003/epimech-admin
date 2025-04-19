'use client';
import { useState, useEffect } from 'react';

export default function ProductEditorModal({ open, onClose, product, onSave, category }) {
  const [form, setForm] = useState(product || {});

  useEffect(() => {
    setForm(product || {});
  }, [product]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('part_number.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        part_number: { ...prev.part_number, [key]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/${category.toLowerCase()}/${product._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-color-gray-900 p-6 rounded-md w-[90%] max-w-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>

        <label className="block mb-2 font-medium">Part Name</label>
        <input
          name="part_name"
          value={form.part_name || ''}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded"
        />

        <label className="block mb-2 font-medium">Image URL</label>
        <input
          name="image"
          value={form.image || ''}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded"
        />

        <label className="block mb-2 font-medium">Part Numbers</label>
        {Object.entries(form.part_number || {}).map(([key, val]) => (
          <div key={key} className="mb-2">
            <span className="text-sm block text-gray-500 mb-1">{key}</span>
            <input
              name={`part_number.${key}`}
              value={val}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}

        <div className="flex justify-end mt-6 gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
