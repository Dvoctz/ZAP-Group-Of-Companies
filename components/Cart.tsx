import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';

const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                ) : (
                    <div className="w-16 h-16 bg-gray-700 flex items-center justify-center rounded-md mr-4 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div>
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-gray-400 text-sm">Tsh {item.price.toLocaleString('en-US')}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center border border-gray-600 rounded">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-lg font-bold">-</button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-lg font-bold">+</button>
                </div>
                <p className="font-semibold w-28 text-right">Tsh {(item.price * item.quantity).toLocaleString('en-US')}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300" aria-label={`Remove ${item.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


const Cart: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleCart}
        aria-hidden="true"
      ></div>

      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
      >
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 id="cart-heading" className="text-2xl font-bold text-cyan-400">Your Cart</h2>
                <button onClick={toggleCart} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close cart">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto">
                {cartItems.length > 0 ? (
                    cartItems.map(item => <CartItemCard key={item.id} item={item} />)
                ) : (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <p className="text-lg">Your cart is empty.</p>
                        <p className="text-sm">Add some products to get started!</p>
                    </div>
                )}
            </div>
            
            {cartItems.length > 0 && (
                <div className="p-6 border-t border-gray-700 space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>Tsh {totalPrice.toLocaleString('en-US')}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 transition-colors duration-200"
                    >
                        Proceed to Checkout
                    </button>
                    <button 
                        onClick={clearCart}
                        className="w-full text-center text-red-400 hover:text-red-300 font-semibold py-2"
                    >
                        Clear Cart
                    </button>
                </div>
            )}
        </div>