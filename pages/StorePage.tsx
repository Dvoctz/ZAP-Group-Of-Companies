import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';

const StorePage: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { stores } = useProducts();

  if (!companySlug || !stores[companySlug]) {
    return <Navigate to="/" />;
  }

  const { companyName, products } = stores[companySlug];

  return (
    <div>
      <Header title={companyName} showBackButton={true} />
      <main className="container mx-auto px-4 py-8">
        {products.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products available in this store yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StorePage;