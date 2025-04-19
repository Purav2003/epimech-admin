'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, GripVertical } from 'lucide-react';

export default function SortableRow({ item, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative group"
    >
      {/* Drag handle overlay */}
      <div
        {...listeners}
        className="absolute -top-2 -left-2 z-10 cursor-grab p-2 rounded-full bg-white shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
      >
        <GripVertical size={16} className="text-gray-400" />
        {/* <GripHorizontal size={16} className="text-gray-400" /> */}
      </div>

      {children}
    </div>
  );
}
