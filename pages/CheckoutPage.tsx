import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import { OrderStatus } from '../types';
import { supabase } from '../supabaseClient';
import { saveOrderForSync } from '../utils/indexedDB';

const CheckoutPage: React.FC = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', contact: '', location: '' });
    const [errors, setErrors] = useState({ name: false, contact: false, location: false });
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'offline_submitted' | 'error'>('idle');
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (cartItems.length === 0 && submissionStatus !== 'submitted' && submissionStatus !== 'offline_submitted') {
            navigate('/');
        }
    }, [cartItems, submissionStatus, navigate]);

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
        if (!validateForm() || submissionStatus === 'submitting') return;

        setSubmissionStatus('submitting');
        setSubmitError(null);

        const newOrderData = {
            customer_name: formData.name,
            customer_contact: formData.contact,
            customer_location: formData.location,
            items: cartItems,
            total_price: totalPrice,
            status: 'New' as OrderStatus,
        };
        
        // Handle offline submission
        if (!navigator.onLine) {
            try {
                const orderWithClientId = { ...newOrderData, clientId: crypto.randomUUID() };
                await saveOrderForSync(orderWithClientId);

                // Register for background sync
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    const sw = await navigator.serviceWorker.ready;
                    // FIX: Cast `sw` to `any` to access the `sync` property. The Background Sync API
                    // is not included in the default TypeScript DOM library typings.
                    await (sw as any).sync.register('sync-new-orders');
                    console.log('Background sync for orders registered.');
                }
                
                setSubmissionStatus('offline_submitted');
                clearCart();
            } catch (err) {
                console.error('Failed to save order for sync:', err);
                setSubmitError('Could not save order offline. Please try again.');
                setSubmissionStatus('error');
            }
            return;
        }

        // Handle online submission
        const { error } = await supabase.from('orders').insert([newOrderData]);

        if (error) {
            console.error('Error submitting order:', error);
            setSubmitError('Failed to submit order. Please try again.');
            setSubmissionStatus('error');
        } else {
            console.log('Order Submitted Successfully');
            setSubmissionStatus('submitted');
            clearCart();
        }
    };
    
    if (submissionStatus === 'submitted' || submissionStatus === 'offline_submitted') {
        const isOffline = submissionStatus === 'offline_submitted';
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                 <svg className={`w-24 h-24 ${isOffline ? 'text-blue-400' : 'text-green-400'} mb-4`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isOffline ? (
                        <>
                           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                           <polyline points="7 10 12 15 17 10" />
                           <line x1="12" y1="15" x2="12" y2="3" />
                        </>
                    ) : (
                       <>
                           <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                           <polyline points="22 4 12 14.01 9 11.01"></polyline>
                       </>
                    )}
                </svg>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                    {isOffline ? 'Order Saved Offline!' : 'Order Confirmed!'}
                </h1>
                <p className="mt-2 text-lg text-gray-300">
                    {isOffline ? 'It will be submitted automatically when you reconnect.' : 'Thank you for your purchase.'}
                </p>
                <p className="text-gray-400">You will be redirected to the homepage shortly.</p>
                <script>{setTimeout(() => navigate('/'), 4000)}</script>
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
                             <button type="submit" className="mt-6 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 transition-colors duration-200 disabled:bg-gray-500" disabled={submissionStatus === 'submitting'}>
                                {submissionStatus === 'submitting' ? 'Submitting...' : 'Confirm Order'}
                            </button>
                            {submissionStatus === 'error' && <p className="text-red-500 text-sm text-center mt-2">{submitError}</p>}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CheckoutPage;