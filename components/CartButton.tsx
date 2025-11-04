import React from 'react';
import { useCart } from '../context/CartContext';

const CartButton: React.FC = () => {
    const { totalItems, toggleCart } = useCart();

    const CartIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );

    return (
        <button
            onClick={toggleCart}
            className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
            aria-label={`Open cart with ${totalItems} items`}
        >
            <CartIcon />
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white border-2 border-cyan-600">
                    {totalItems > 9 ? '9+' : totalItems}
                </span>
            )}
        </button>
    );
};

export default CartButton;
