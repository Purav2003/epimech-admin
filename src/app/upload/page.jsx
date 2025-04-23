'use client';

import { useState } from 'react';

export default function ImageUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first.');

    setUploading(true);

    try {
      const filename = encodeURIComponent(file.name);
      const filetype = encodeURIComponent(file.type);

      const res = await fetch(`/api/upload-url?filename=${filename}&filetype=${filetype}`);
      if (!res.ok) throw new Error('Failed to get upload URL');

      const { url } = await res.json();

      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      alert('Uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="block"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={uploading || !file}
      >
        {uploading ? 'Uploading...' : 'Upload to S3'}
      </button>
    </div>
  );
}
