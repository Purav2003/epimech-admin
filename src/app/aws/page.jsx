'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun, Trash2, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Gallery() {
  const [category, setCategory] = useState('waterpump');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    fetchImages();
  }, [category]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/images?category=${category}`);
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (image, e) => {
    e.stopPropagation(); // Prevent opening the image when clicking delete
    setDeleteConfirmation(image);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    
    setIsDeleting(true);
    try {
      await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: deleteConfirmation.key }),
      });
      setImages((prev) => prev.filter((img) => img.key !== deleteConfirmation.key));
      
      // If the deleted image was selected in the viewer, close the viewer
      if (selectedImage && selectedImage.key === deleteConfirmation.key) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation(null);
    }
  };

  const openImageViewer = (image) => {
    setSelectedImage(image);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.key === selectedImage.key);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex + direction;
    
    // Loop around if we reach the end or beginning
    if (newIndex >= images.length) newIndex = 0;
    if (newIndex < 0) newIndex = images.length - 1;
    
    setSelectedImage(images[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (selectedImage) {
      if (e.key === 'ArrowRight') navigateImage(1);
      if (e.key === 'ArrowLeft') navigateImage(-1);
      if (e.key === 'Escape') closeImageViewer();
    }
  };

  // Add keyboard navigation for image viewer
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, images]);


  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with title and dark mode toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Parts Gallery
          </h1>
         
        </div>
        
        {/* Category Selector with 3D effect */}
        <div className="mb-8 flex justify-center mb-16">
          <div className="flex p-1 rounded-xl shadow-lg dark:shadow-blue-900/20 bg-white dark:bg-gray-800">
            <button
              className={`px-5 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                category === 'waterpump' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md transform scale-105' 
                  : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCategory('waterpump')}
            >
              Water Pumps
            </button>
            <button
              className={`px-5 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                category === 'otherParts' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md transform scale-105' 
                  : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCategory('otherParts')}
            >
              Other Parts
            </button>
          </div>
        </div>

     

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin-slow"></div>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white dark:bg-gray-800 shadow-md">
            <div className="mb-4 text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No images found in this category</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Upload some images to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div 
                key={img.key} 
                onClick={() => openImageViewer(img)}
                className="group relative overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800 cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.key} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-medium truncate text-sm">
                    {img.key.split('/').pop()}
                  </h3>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => confirmDelete(img, e)}
                  className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 transform hover:scale-110"
                  aria-label="Delete image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Confirm Deletion</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete this image? This action cannot be undone.</p>
              <div className="overflow-hidden rounded-lg border-2 border-red-200 dark:border-red-900/30">
                <img 
                  src={deleteConfirmation.url} 
                  alt={deleteConfirmation.key} 
                  className="w-full h-48 object-cover" 
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg transition-all duration-300 ${
                  isDeleting ? 'opacity-70 cursor-not-allowed' : 'hover:from-red-600 hover:to-red-700'
                }`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : 'Delete Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Viewer */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={closeImageViewer}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-50"
            onClick={closeImageViewer}
          >
            <X size={24} />
          </button>
          
          {/* Navigation Buttons */}
          <button 
            className="absolute left-4 md:left-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition-all z-50"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage(-1);
            }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute right-4 md:right-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition-all z-50"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage(1);
            }}
          >
            <ChevronRight size={24} />
          </button>
          
          <div 
            className="relative max-w-4xl max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.url} 
              alt={selectedImage.key} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 rounded-b-lg">
              <h3 className="font-medium text-lg">
                {selectedImage.key.split('/').pop()}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}