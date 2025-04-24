'use client';
import { useState, useEffect, useRef } from 'react';
import {
  X, Upload, Save, Image as ImageIcon, Trash2, CheckCircle,
  PlusCircle, Move, Info, RotateCcw, Camera, Layers, Sparkles,
  Grid, List, Eye,
  Tag,
  Trash2Icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

export default function ProductEditorModal({ open, onClose, product, onSave, category }) {
  // Main state
  const [form, setForm] = useState(product || {});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [subimages, setSubimages] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [previewMode, setPreviewMode] = useState(false);
  const [galleryView, setGalleryView] = useState('grid');
  const [draggedImage, setDraggedImage] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const modalRef = useRef(null);

  // History for undo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (product) {
      setForm(product || {});
      // Extract and flatten subimages
      const subImages = product.subimages ?
        (Array.isArray(product.subimages) ? product.subimages : Object.values(product.subimages)) :
        [];
      setSubimages(subImages || []);

      // Reset history when editing a new product
      setHistory([product]);
      setHistoryIndex(0);
    }
  }, [product]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  // Track changes for history
  useEffect(() => {
    if (JSON.stringify(form) !== JSON.stringify(history[historyIndex])) {
      // Add new state to history, removing any "future" states
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ ...form });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [form, subimages]);

  const { getRootProps: getMainImageRootProps, getInputProps: getMainImageInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await uploadImage(acceptedFiles[0], true);
      }
    },
    disabled: uploading,
    multiple: false,
  });

  // Subimages dropzone
  const { getRootProps: getSubimagesRootProps, getInputProps: getSubimagesInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const uploads = acceptedFiles.map(file => uploadImage(file, false));
        await Promise.all(uploads);
        toast.success(`${acceptedFiles.length} image${acceptedFiles.length > 1 ? 's' : ''} uploaded`);
      }
    },
    disabled: uploading,
    multiple: true,
  });
  if (!open) return null;

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setForm({ ...history[historyIndex - 1] });

      // If history contains subimages, also restore them
      if (history[historyIndex - 1].subimages) {
        setSubimages(
          Array.isArray(history[historyIndex - 1].subimages)
            ? history[historyIndex - 1].subimages
            : Object.values(history[historyIndex - 1].subimages)
        );
      }

      toast.success('Change undone');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('part_number.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        part_number: { ...(prev.part_number || {}), [key]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddPartNumberField = () => {
    const newFieldName = `field_${Object.keys(form.part_number || {}).length + 1}`;
    setForm((prev) => ({
      ...prev,
      part_number: { ...(prev.part_number || {}), [newFieldName]: '' }
    }));
  };

  const handleRemovePartNumberField = (keyToRemove) => {
    setForm((prev) => {
      const updatedPartNumbers = { ...(prev.part_number || {}) };
      delete updatedPartNumbers[keyToRemove];
      return {
        ...prev,
        part_number: updatedPartNumbers
      };
    });
  };

  // Enhanced image upload with progress
  const uploadImage = async (file, isMain = false) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get signed URL
      const res = await fetch(
        `/api/upload-url?filename=${encodeURIComponent(file.name)}&filetype=${encodeURIComponent(file.type)}&category=${category}`
      );
      const { url } = await res.json();

      // 2. Create XMLHttpRequest for tracking progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.onload = () => {
          if (xhr.status === 200) {
            const imageUrl = url.split('?')[0];

            // Update state based on whether it's main image or subimage
            if (isMain) {
              setForm((prev) => ({ ...prev, image: imageUrl }));
            } else {
              const newSubimages = [...subimages, imageUrl];
              setSubimages(newSubimages);
              setForm((prev) => ({ ...prev, subimages: newSubimages }));
            }

            resolve(imageUrl);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));

        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Image upload failed. Please try again.');
      return null;
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Main image dropzone


  const removeSubimage = (index) => {
    const newSubimages = [...subimages];
    newSubimages.splice(index, 1);
    setSubimages(newSubimages);
    setForm((prev) => ({ ...prev, subimages: newSubimages }));
    toast.success('Image removed');
  };

  const handleDragStart = (index) => {
    setDraggedImage(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedImage === null || draggedImage === index) return;

    // Reorder images
    const newSubimages = [...subimages];
    const draggedItem = newSubimages[draggedImage];
    newSubimages.splice(draggedImage, 1);
    newSubimages.splice(index, 0, draggedItem);

    setSubimages(newSubimages);
    setForm((prev) => ({ ...prev, subimages: newSubimages }));
    setDraggedImage(index);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
  };

  const handleSubmit = async () => {
    try {
      const subimagesObject = subimages.reduce((acc, url, i) => {
        acc[`image${i + 1}`] = url;
        return acc;
      }, {});

      const payload = {
        ...form,
        subimages: subimagesObject,
      };


      const res = await fetch(`/api/${category.toLowerCase()}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save product');

      const data = await res.json();
      toast.success('Product updated successfully');
      onSave(data);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to save product. Please try again.');
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 500 } }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  // // Close on escape key
  // useEffect(() => {
  //   const handleEsc = (e) => {
  //     if (e.key === 'Escape') {
  //       onClose();
  //     }
  //   };

  //   window.addEventListener('keydown', handleEsc);
  //   return () => window.removeEventListener('keydown', handleEsc);
  // }, [onClose]);

  // Close when clicking outside
  // useEffect(() => {
  //   const handleOutsideClick = (e) => {
  //     if (modalRef.current && !modalRef.current.contains(e.target)) {
  //       onClose();
  //     }
  //   };

  //   if (open) {
  //     document.addEventListener('mousedown', handleOutsideClick);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleOutsideClick);
  //   };
  // }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4 overflow-y-auto backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] mt-12 flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            ref={modalRef}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-t-2xl">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  {previewMode ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Eye size={24} />
                      <h2 className="text-2xl font-bold">Preview Mode</h2>
                    </motion.div>
                  ) : (
                    <h2 className="text-2xl font-bold">Edit {category}</h2>
                  )}

                  {!previewMode && historyIndex > 0 && (
                    <button
                      onClick={handleUndo}
                      className="ml-4 flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-sm rounded-full transition-all"
                      title="Undo last change"
                    >
                      <RotateCcw size={14} />
                      Undo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${previewMode
                        ? 'bg-white text-purple-600 font-medium'
                        : 'text-white bg-white bg-opacity-20 hover:bg-opacity-30'
                      }`}
                  >
                    <Eye size={16} />
                    {previewMode ? 'Exit Preview' : 'Preview'}
                  </button>

                  <button
                    onClick={onClose}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                    aria-label="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              {!previewMode && (
                <div className="px-6 pb-2 flex space-x-2">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'details'
                        ? 'bg-white text-purple-600 font-medium shadow-md'
                        : 'text-white bg-white bg-opacity-10 hover:bg-opacity-20'
                      }`}
                  >
                    <Info size={16} />
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('subimages')}
                    className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'subimages'
                        ? 'bg-white text-purple-600 font-medium shadow-md'
                        : 'text-white bg-white bg-opacity-10 hover:bg-opacity-20'
                      }`}
                  >
                    <Layers size={16} />
                    Gallery ({subimages.length})
                  </button>
                </div>
              )}
            </div>

            {/* Content area with scroll */}
            <div className="flex-1 overflow-y-auto">
              {previewMode ? (
                <div className="p-6">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Main image */}
                      <div className="w-full md:w-1/3">
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 mb-4">
                          {form.image ? (
                            <img
                              src={form.image}
                              alt={form.part_name || 'Product'}
                              className="w-full h-64 object-contain rounded"
                            />
                          ) : (
                            <div className="w-full h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded">
                              <ImageIcon size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Thumbnails */}
                        {subimages.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {subimages.slice(0, 4).map((img, i) => (
                              <div key={i} className="w-16 h-16 flex-shrink-0 bg-white dark:bg-gray-700 rounded shadow-sm">
                                <img src={img} alt="" className="w-full h-full object-cover rounded" />
                              </div>
                            ))}
                            {subimages.length > 4 && (
                              <div className="w-16 h-16 flex-shrink-0 bg-white dark:bg-gray-700 rounded shadow-sm flex items-center justify-center text-gray-500">
                                +{subimages.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="md:w-2/3">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                          {form.part_name || 'Product Name'}
                        </h2>

                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-4">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Part Numbers</h3>
                          <div className="space-y-2">
                            {Object.entries(form.part_number || {}).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="text-gray-500 dark:text-gray-400 capitalize w-1/3">{key.replace('_', ' ')}:</span>
                                <span className="text-gray-800 dark:text-gray-200 font-medium">{value}</span>
                              </div>
                            ))}
                            {(!form.part_number || Object.keys(form.part_number).length === 0) && (
                              <p className="text-gray-400 italic">No part numbers added</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${form.is_hide
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                            {form.is_hide ? 'Hidden' : 'Visible'}
                          </span>

                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            Rank: {form.rank || 'Not set'}
                          </span>

                          <span className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            {category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6"
                  >
                    {activeTab === 'details' ? (
                      <div className="space-y-6">
                        {/* Part Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Part Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="part_name"
                            value={form.part_name || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="Enter product name"
                          />
                        </div>

                        {/* Main Image */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Main Image
                          </label>
                          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                            {form.image ? (
                              <div className="w-full flex flex-col items-center">
                                <div className="mb-3 w-64 h-64 relative overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800">
                                  <img
                                    src={form.image}
                                    alt="Product"
                                    className="w-full h-full object-contain"
                                  />
                                  <button
                                    onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                                    title="Remove image"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div {...getMainImageRootProps()} className="cursor-pointer text-sm flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all">
                                  <Upload size={16} />
                                  Change Image
                                  <input {...getMainImageInputProps()} />
                                </div>
                              </div>
                            ) : (
                              <div {...getMainImageRootProps()} className="text-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                                <div className="w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                                  <Camera size={48} className="text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium text-purple-600 dark:text-purple-400">Click to upload</span> or drag and drop
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                <input {...getMainImageInputProps()} />
                              </div>
                            )}

                            {/* Upload progress */}
                            {uploading && (
                              <div className="mt-4">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{uploadProgress}% uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Part Numbers */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Part Numbers</h3>
                            <button
                              onClick={handleAddPartNumberField}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                            >
                              <PlusCircle size={16} />
                              Add Field
                            </button>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                            {Object.entries(form.part_number || {}).length > 0 ? (
                              Object.entries(form.part_number || {}).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-4">
                                  <div className="w-1/3">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Field Name
                                    </label>
                                    <input
                                      type="text"
                                      value={key.replace('_', ' ')}
                                      disabled
                                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Value
                                    </label>
                                    <input
                                      type="text"
                                      name={`part_number.${key}`}
                                      value={val || ''}
                                      onChange={handleChange}
                                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                    />
                                  </div>
                                  <div className="pt-6">
                                    <button
                                      onClick={() => handleRemovePartNumberField(key)}
                                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                                      title="Remove field"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-3">
                                  <Tag size={24} />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">No part numbers added yet</p>
                                <button
                                  onClick={handleAddPartNumberField}
                                  className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                                >
                                  <PlusCircle size={16} />
                                  Add First Field
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional fields could be added here */}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            Product Gallery
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                              ({subimages.length} images)
                            </span>
                          </h3>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                              <button
                                onClick={() => setGalleryView('grid')}
                                className={`p-1.5 rounded ${galleryView === 'grid'
                                    ? 'bg-white dark:bg-gray-700 shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                  }`}
                                title="Grid view"
                              >
                                <Grid size={16} />
                              </button>
                              <button
                                onClick={() => setGalleryView('list')}
                                className={`p-1.5 rounded ${galleryView === 'list'
                                    ? 'bg-white dark:bg-gray-700 shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                  }`}
                                title="List view"
                              >
                                <List size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => setReorderMode(!reorderMode)}
                              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-all ${reorderMode
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                }`}
                              title={reorderMode ? 'Stop Reordering' : 'Reorder Images'}
                            >
                              {reorderMode ? <X size={16} /> : <Move size={16} />}
                              {reorderMode ? 'Stop Reordering' : 'Reorder Images'}
                            </button>
                          </div>
                        </div>

                        <div
                          {...getSubimagesRootProps()}
                          className={`grid ${galleryView === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}
                        >
                          {subimages.map((img, index) => (
                            <div
                              key={index}
                              className={`relative rounded-lg overflow-hidden shadow-md transition-transform duration-200 ${reorderMode ? 'cursor-move' : 'cursor-pointer'}`}
                              draggable={reorderMode}
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                            >
                              <img
                                src={img}
                                alt={`Subimage ${index + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* {reorderMode && ( */}
                                <button
                                  onClick={() => removeSubimage(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                                  title="Remove image"
                                >
                                  <Trash2Icon size={16} />
                                </button>
                              {/* )} */}
                            </div>
                          ))}

                          {subimages.length === 0 && (
                            <div className="col-span-full text-center py-8">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-3">
                                <ImageIcon size={24} />
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">No images uploaded yet</p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>


            {/* Footer with buttons */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg text-white transition-all ${previewMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {previewMode ? 'Save Preview' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
