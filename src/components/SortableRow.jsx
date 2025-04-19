'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableRow({ item, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className="border border-gray-200">
      <td className="p-2 cursor-grab text-center" {...listeners}>
        <GripVertical className="inline-block text-gray-400" />
      </td>
      {children}
    </tr>
  );
}
