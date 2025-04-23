'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'OtherParts'; // fallback
  const [form, setForm] = useState({
    part_name: '',
    image: '',
    part_number: { 'EMD 710 / EMD 645': '' },
    subimages: {},
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('info');
  const [fileHover, setFileHover] = useState(false);
  const [subFileHover, setSubFileHover] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('part_number.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        part_number: { ...prev.part_number, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadToS3 = async (file) => {
    const res = await fetch(`/api/upload-url?filename=${encodeURIComponent(file.name)}&filetype=${encodeURIComponent(file.type)}&category=${category}`);
    const { url } = await res.json();

    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    return url.split('?')[0];
  };

  // Simulate upload progress
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 300);

    return () => clearInterval(interval);
  };

  const handleMainImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const stopProgress = simulateProgress();
    const url = await uploadToS3(file);
    setForm((prev) => ({ ...prev, image: url }));
    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 500);
    stopProgress();
  };

  const handleSubImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const stopProgress = simulateProgress();

    const uploads = await Promise.all(files.map(uploadToS3));

    // Create a new object that adds to existing subimages rather than replacing
    const subimageObj = { ...form.subimages };
    const startIdx = Object.keys(subimageObj).length;

    uploads.forEach((url, i) => {
      subimageObj[`image${startIdx + i + 1}`] = url;
    });

    setForm((prev) => ({ ...prev, subimages: subimageObj }));
    setUploadProgress(100);

    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 500);

    stopProgress();
  };

  const removeSubImage = (keyToRemove) => {
    const newSubimages = { ...form.subimages };
    delete newSubimages[keyToRemove];

    // Reindex the keys to avoid gaps
    const reindexedSubimages = {};
    Object.values(newSubimages).forEach((url, i) => {
      reindexedSubimages[`image${i + 1}`] = url;
    });

    setForm(prev => ({ ...prev, subimages: reindexedSubimages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const res = await fetch(`/api/add-product?category=${category.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push(`/products/${category.toLowerCase()}`);
    } else {
      alert('Failed to create product');
    }

    setUploading(false);
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-purple-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-24 px-4">
      <div className="max-w-5xl mx-auto relative">
        {/* Header with animated text */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-gray-300 to-indigo-300 inline-block">
            Create {category} Product
          </h1>
          <div className="mt-3 text-purple-200 dark:text-gray-200 animate-pulse">
            Complete all sections to add your product
          </div>
        </div>

        {/* Main form container with glassmorphism */}
        <div className="backdrop-blur-md bg-white bg-opacity-10 dark:bg-opacity-5 rounded-2xl shadow-2xl overflow-hidden border border-white border-opacity-20">
          <div className="flex flex-col md:flex-row">
            {/* Navigation sidebar */}
            <div className="md:w-1/4 bg-black bg-opacity-30 p-6">
              <div className="space-y-4">
                <div
                  onClick={() => setActiveSection('info')}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeSection === 'info'
                    ? 'bg-purple-500 text-white font-medium translate-x-2'
                    : 'text-gray-300 hover:bg-gray-800 hover:bg-opacity-40'}`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-800 mr-3">1</span>
                    Basic Info
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('main_image')}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeSection === 'main_image'
                    ? 'bg-purple-500 text-white font-medium translate-x-2'
                    : 'text-gray-300 hover:bg-gray-800 hover:bg-opacity-40'}`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-800 mr-3">2</span>
                    Main Image
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('subimages')}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeSection === 'subimages'
                    ? 'bg-purple-500 text-white font-medium translate-x-2'
                    : 'text-gray-300 hover:bg-gray-800 hover:bg-opacity-40'}`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-800 mr-3">3</span>
                    Gallery Images
                    {Object.keys(form.subimages).length > 0 && (
                      <span className="ml-2 bg-purple-600 text-white rounded-full text-xs px-2 py-1">
                        {Object.keys(form.subimages).length}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('part_number')}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeSection === 'part_number'
                    ? 'bg-purple-500 text-white font-medium translate-x-2'
                    : 'text-gray-300 hover:bg-gray-800 hover:bg-opacity-40'}`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-800 mr-3">4</span>
                    Part Numbers
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <div className="text-xs text-gray-400 mb-2">Completion</div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-gray-500"
                    style={{
                      width: `${(form.part_name ? 25 : 0) +
                        (form.image ? 25 : 0) +
                        (Object.values(form.subimages).length > 0 ? 25 : 0) +
                        (form.part_number['EMD 710 / EMD 645'] ? 25 : 0)
                        }%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="md:w-3/4 p-8">
              <form onSubmit={handleSubmit} className="h-full">
                {/* Basic Info Section */}
                <div className={`transition-all duration-300 ${activeSection === 'info' ? 'opacity-100' : 'hidden opacity-0'}`}>
                  <h2 className="text-3xl font-light mb-6 text-white">What's this part called?</h2>

                  <div className="relative mt-6 group">
                    <input
                      type="text"
                      id="part_name"
                      name="part_name"
                      value={form.part_name}
                      onChange={handleChange}
                      required
                      className="peer w-full bg-transparent text-2xl text-white border-b-2 border-gray-300 border-opacity-50 focus:border-purple-300 outline-none px-2 py-3 placeholder-transparent transition-all"
                      placeholder="Enter part name"
                    />
                    <label
                      htmlFor="part_name"
                      className="absolute left-2 -top-5 text-sm text-gray-200 transition-all peer-placeholder-shown:text-xl peer-placeholder-shown:text-white peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-purple-300"
                    >
                      Enter part name
                    </label>

                    {form.part_name && (
                      <button
                        type="button"
                        onClick={() => setActiveSection('main_image')}
                        className="mt-8 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all transform hover:translate-y-1"
                      >
                        Continue to Images →
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Image Section */}
                <div className={`transition-all duration-300 ${activeSection === 'main_image' ? 'opacity-100' : 'hidden opacity-0'}`}>
                  <h2 className="text-3xl font-light mb-6 text-white">Upload main product image</h2>

                  <div
                    className={`mt-6 border-2 border-dashed rounded-lg p-12 text-center transition-all ${fileHover
                        ? 'border-purple-400 bg-purple-900 bg-opacity-20'
                        : 'border-gray-300 border-opacity-50 hover:border-purple-400'
                      }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setFileHover(true);
                    }}
                    onDragLeave={() => setFileHover(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setFileHover(false);
                      // Handle file drop
                    }}
                  >
                    <div className="relative">
                      <input
                        type="file"
                        id="main-image"
                        onChange={handleMainImage}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />

                      {!form.image ? (
                        <div>
                          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-4 text-xl text-gray-200">Drop image here or click to browse</p>
                          <p className="mt-2 text-sm text-gray-300">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      ) : (
                        <div>
                          <div className="relative mx-auto w-64 h-64 shadow-xl rounded-lg overflow-hidden">
                            <img
                              src={form.image}
                              alt="Main preview"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                            <div className="absolute bottom-3 left-0 right-0 text-center text-white">
                              <button
                                type="button"
                                className="text-xs underline"
                                onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                              >
                                Replace image
                              </button>
                            </div>
                          </div>


                        </div>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
                          <div className="text-purple-300 flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </div>
                          <div className="w-64 h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-gray-500 transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-purple-200 mt-1">{uploadProgress}%</div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('subimages')}
                      className="mt-8 z-[1000] bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all transform hover:translate-y-1"
                    >
                      Continue to Gallery →
                    </button>
                  </div>
                </div>

                {/* Sub Images Section - IMPROVED GALLERY */}
                <div className={`transition-all duration-300 ${activeSection === 'subimages' ? 'opacity-100' : 'hidden opacity-0'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-light text-white">Gallery Images</h2>
                    <span className="text-gray-200 text-sm">
                      {Object.keys(form.subimages).length} / 10 images
                    </span>
                  </div>

                  {/* Current Gallery */}
                  {Object.keys(form.subimages).length > 0 && (
                    <div className="mb-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(form.subimages).map(([key, url], i) => (
                          <div key={key} className="relative group rounded-lg overflow-hidden">
                            <div className="aspect-square bg-gray-900 bg-opacity-20">
                              <img
                                src={url}
                                alt={`Gallery image ${i + 1}`}
                                className="w-full h-full object-cover transition-all group-hover:scale-105"
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
                                <span className="text-white text-xs">Image {i + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSubImage(key)}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all transform hover:scale-110"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add more images button within gallery */}
                        {Object.keys(form.subimages).length < 10 && (
                          <div
                            className="w-48 h-48 aspect-square border-2 border-dashed border-gray-300 border-opacity-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-900 hover:bg-opacity-20 transition-all"
                          >
                            <input
                              type="file"
                              id="add-more-images"
                              onChange={handleSubImages}
                              accept="image/*"
                              multiple
                              className="absolute w-48 h-48 inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-gray-300 mt-2">Add More</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload area (shown when no images or as alternative to "Add more" button) */}
                  {Object.keys(form.subimages).length === 0 && (
                    <div
                      className={`mt-6 border-2 border-dashed rounded-lg p-8 text-center transition-all ${subFileHover
                          ? 'border-purple-400 bg-purple-900 bg-opacity-20'
                          : 'border-gray-300 border-opacity-50 hover:border-purple-400'
                        }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setSubFileHover(true);
                      }}
                      onDragLeave={() => setSubFileHover(false)}
                    >
                      <div className="relative">
                        <input
                          type="file"
                          id="sub-images-initial"
                          onChange={handleSubImages}
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        <div>
                          <svg className="w-12 h-12 mx-auto text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-3 text-lg text-gray-200">Drop multiple images or click to browse</p>
                          <p className="mt-2 text-sm text-gray-300">Select up to 10 gallery images</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50">
                      <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full">
                        <div className="text-purple-300 flex flex-col items-center">
                          <svg className="animate-spin h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <h3 className="text-white text-xl mb-3">Uploading Images</h3>
                          <div className="w-full h-3 bg-gray-700 rounded-full mb-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-gray-500 transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-purple-200">{uploadProgress}% complete</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveSection('main_image')}
                      className="bg-gray-800 bg-opacity-40 hover:bg-opacity-60 text-white px-6 py-2 rounded-full transition-all"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('part_number')}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Continue →
                    </button>
                  </div>
                </div>

                {/* Part Number Section */}
                <div className={`transition-all duration-300 ${activeSection === 'part_number' ? 'opacity-100' : 'hidden opacity-0'}`}>
                  <h2 className="text-3xl font-light mb-6 text-white">Part Number Details</h2>

                  <div className="space-y-6">
                    {Object.keys(form.part_number).map((engine) => (
                      <div key={engine} className="bg-gray-900 bg-opacity-20 backdrop-blur-sm p-6 rounded-lg">
                        <label className="block text-lg text-gray-200 mb-3">
                          {engine}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name={`part_number.${engine}`}
                            value={form.part_number[engine]}
                            onChange={handleChange}
                            className="w-full bg-gray-800 bg-opacity-30 text-white border-2 border-gray-500 border-opacity-50 focus:border-purple-400 rounded-lg px-4 py-3 outline-none transition-all"
                            placeholder="Enter part number"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="relative w-full bg-gradient-to-r from-purple-500 to-gray-600 text-white font-medium py-4 px-8 rounded-xl shadow-xl hover:shadow-purple-500/20 hover:from-purple-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="relative z-10">
                        {uploading ? 'Saving Product...' : 'Complete & Save Product'}
                      </span>
                    </button>

                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveSection('subimages')}
                        className="text-gray-300 hover:text-purple-300 text-sm"
                      >
                        ← Back to Gallery
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSection('info')}
                        className="text-gray-300 hover:text-purple-300 text-sm"
                      >
                        Review All Info
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}