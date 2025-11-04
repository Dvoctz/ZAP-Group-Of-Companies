import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => {
        setIsAdding(false);
    }, 1000); // Visual feedback for 1 second
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50 flex flex-col">
      {product.imageUrl ? (
        <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.name} />
      ) : (
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        <p className="text-gray-400 text-sm mt-1 flex-grow">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xl font-bold text-cyan-400">Tsh {product.price.toLocaleString('en-US')}</p>
          <button
            onClick={handleAddToCart}
            className={`font-bold py-2 px-4 rounded-md transition-all duration-200 w-32 ${
                isAdding
                ? 'bg-green-500 text-white'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;