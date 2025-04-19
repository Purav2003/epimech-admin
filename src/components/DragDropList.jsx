'use client';
import { useEffect, useState } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  arrayMove,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ProductTable from './ProductTable';

export default function DragDropList({ items, category, handleRefresh }) {
  const [currentItems, setCurrentItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setCurrentItems(items);
  }, [items]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setStatusMessage('');
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;

    const oldIndex = currentItems.findIndex((i) => i._id === active.id);
    const newIndex = currentItems.findIndex((i) => i._id === over.id);

    const reordered = arrayMove(currentItems, oldIndex, newIndex);
    setCurrentItems(reordered);
    
    setIsLoading(true);
    setStatusMessage('Saving new order...');
    
    try {
      const response = await fetch(`/api/${category.toLowerCase()}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reordered.map((item, idx) => ({ id: item._id, rank: idx + 1 })),
        }),
      });
      
      if (response.ok) {
        setStatusMessage('Order saved successfully');
        handleRefresh(); // Refresh the list to reflect changes
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setStatusMessage('Failed to save order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeItem = activeId ? currentItems.find(item => item._id === activeId) : null;

  return (
    <div className="relative">
      {/* Status message */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          statusMessage.includes('Failed') 
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
            : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {statusMessage}
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-500 dark:bg-blue-400 rounded-full animation-delay-150"></div>
            <div className="h-3 w-3 bg-blue-500 dark:bg-blue-400 rounded-full animation-delay-300"></div>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[70vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-medium text-gray-800 dark:text-gray-200">
            {category} Products
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentItems.length} {currentItems.length === 1 ? 'item' : 'items'} • Drag to reorder
          </div>
        </div>
        
        <DndContext 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd} 
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={currentItems.map((i) => i._id)}
            strategy={verticalListSortingStrategy}
          >
            {currentItems.length > 0 ? (
              <ProductTable items={currentItems} category={category} />
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <div className="mb-2">No products found</div>
                <div className="text-sm">Add products to this category to get started</div>
              </div>
            )}
          </SortableContext>
          
          <DragOverlay>
            {activeId && activeItem ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800 shadow-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {activeItem.name || activeItem.title}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}