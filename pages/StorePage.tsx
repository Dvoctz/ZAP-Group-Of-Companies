import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';

const StorePage: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { stores, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default'); // 'default', 'price-asc', 'price-desc'

  const filteredAndSortedProducts = useMemo(() => {
    if (!companySlug || !stores[companySlug]) return [];

    const { products } = stores[companySlug];
    let filtered = [...products];

    // Filtering by search term (name or description)
    if (searchTerm) {
      filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'default':
      default:
        // Default sort by name, alphabetically
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [stores, companySlug, searchTerm, sortOption]);

  if (loading) {
    return (
       <div>
         <Header title="Loading..." showBackButton={true} />
         <main className="container mx-auto px-4 py-8 text-center">
            <p className="text-gray-400 text-lg">Fetching products, please wait...</p>
         </main>
       </div>
    );
  }

  if (!companySlug || !stores[companySlug]) {
    return <Navigate to="/" />;
  }

  const { companyName } = stores[companySlug];

  return (
    <div>
      <Header title={companyName} showBackButton={true} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Search products"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-auto bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Sort products"
            >
              <option value="default">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {filteredAndSortedProducts.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found.</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StorePage;