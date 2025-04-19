import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SortableRow from './SortableRow'; // this is now a card wrapper
import ProductCard from './ProductCard'; // we'll move product UI here for cleanliness

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
          items: reordered.map((item, idx) => ({ id: item._id, rank: idx + 1 }))
        })
      });

      if (response.ok) {
        setStatusMessage('Order saved successfully');
        handleRefresh();
      } else throw new Error();
    } catch (error) {
      setStatusMessage('Failed to save order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeItem = activeId ? currentItems.find(i => i._id === activeId) : null;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }
    })
  );

  return (
    <div className="relative">
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          statusMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {statusMessage}
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-black/30 flex items-center justify-center z-10">
          <div className="flex gap-2 animate-pulse">
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={currentItems.map((i) => i._id)}
          strategy={rectSortingStrategy} // 🆕 better for grid-based

        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((item) => (
              <SortableRow key={item._id} item={item}>
                <ProductCard item={item} category={category} />
              </SortableRow>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <div className="w-[280px]">
              <ProductCard item={activeItem} category={category} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
