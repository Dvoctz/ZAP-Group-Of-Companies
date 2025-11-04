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
      <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.name} />
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