import { Suspense } from 'react';
import NewProductForm from '@/components/NewProductForm';

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-12">Loading form...</div>}>
      <NewProductForm />
    </Suspense>
  );
}
