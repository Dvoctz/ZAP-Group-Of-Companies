import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import { OrderStatus } from '../types';
import { supabase } from '../supabaseClient';

const CheckoutPage: React.FC = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', contact: '', location: '' });
    const [errors, setErrors] = useState({ name: false, contact: false, location: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (cartItems.length === 0 && !isSubmitted) {
            navigate('/');
        }
    }, [cartItems, isSubmitted, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: !formData.name,
            contact: !formData.contact,
            location: !formData.location,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(Boolean);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError(null);

        const newOrderData = {
            customer_name: formData.name,
            customer_contact: formData.contact,
            customer_location: formData.location,
            items: cartItems,
            total_price: totalPrice,
            status: 'New' as OrderStatus,
        };

        const { error } = await supabase.from('orders').insert([newOrderData]);

        if (error) {
            console.error('Error submitting order:', error);
            setSubmitError('Failed to submit order. Please try again.');
            setIsSubmitting(false);
        } else {
            console.log('Order Submitted Successfully');
            setIsSubmitted(true);
            clearCart();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    };
    
    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                 <svg className="w-24 h-24 text-green-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Order Confirmed!</h1>
                <p className="mt-2 text-lg text-gray-300">Thank you for your purchase.</p>
                <p className="text-gray-400">You will be redirected to the homepage shortly.</p>
            </div>
        )
    }

    return (
        <div>
            <Header title="Checkout" showBackButton={true} />
            <main className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Delivery Information */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Delivery Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={`mt-1 block w-full bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500`} required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">Full name is required.</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-300">Contact Number</label>
                                    <input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleInputChange} className={`mt-1 block w-full bg-gray-700 border ${errors.contact ? 'border-red-500' : 'border-gray-600'} rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500`} required />
                                    {errors.contact && <p className="text-red-500 text-xs mt-1">Contact number is required.</p>}
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-300">Delivery Location / Address</label>
                                    <textarea id="location" name="location" value={formData.location} onChange={handleInputChange} rows={4} className={`mt-1 block w-full bg-gray-700 border ${errors.location ? 'border-red-500' : 'border-gray-600'} rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500`} required ></textarea>
                                    {errors.location && <p className="text-red-500 text-xs mt-1">Delivery location is required.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Order Summary</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <p className="text-gray-300">{item.name} <span className="text-gray-400">x {item.quantity}</span></p>
                                        <p className="font-medium text-white">Tsh {(item.price * item.quantity).toLocaleString('en-US')}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-700 mt-4 pt-4">
                                <div className="flex justify-between text-xl font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-cyan-400">Tsh {totalPrice.toLocaleString('en-US')}</span>
                                </div>
                            </div>
                             <button type="submit" className="mt-6 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 transition-colors duration-200 disabled:bg-gray-500" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Confirm Order'}
                            </button>
                            {submitError && <p className="text-red-500 text-sm text-center mt-2">{submitError}</p>}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CheckoutPage;
