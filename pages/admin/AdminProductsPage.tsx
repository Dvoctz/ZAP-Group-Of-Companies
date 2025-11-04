import React, { useState, FormEvent, useRef } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';

const INITIAL_FORM_STATE = {
    companySlug: 'zap-stationers',
    name: '',
    price: '',
    description: '',
    imageUrl: '',
};

const AdminProductsPage: React.FC = () => {
    const { stores, addProduct, updateProduct, deleteProduct, loading } = useProducts();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const formRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (product: Product, slug: string) => {
        setEditingProduct(product);
        setFormData({
            companySlug: slug,
            name: product.name,
            price: String(product.price),
            description: product.description,
            imageUrl: product.imageUrl,
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (productId: number, companySlug: string) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            await deleteProduct(companySlug, productId);
        }
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData(INITIAL_FORM_STATE);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingProduct) {
            const productData: Product = {
                ...editingProduct,
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                imageUrl: formData.imageUrl,
            };
            await updateProduct(formData.companySlug, productData);
            setSubmitMessage('Product updated successfully!');
        } else {
            const productData: Omit<Product, 'id'> = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                imageUrl: formData.imageUrl,
            };
            await addProduct(formData.companySlug, productData);
            setSubmitMessage('Product added successfully!');
        }
        
        setIsSubmitting(false);
        handleCancelEdit();
        setTimeout(() => setSubmitMessage(''), 3000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Manage Products</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add/Edit Product Form */}
                <div className="lg:col-span-1" ref={formRef}>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="companySlug" className="block text-sm font-medium text-gray-300">Company</label>
                                <select id="companySlug" name="companySlug" value={formData.companySlug} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    {Object.keys(stores).map(slug => (
                                        <option key={slug} value={slug}>{stores[slug].companyName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Product Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price (Tsh)</label>
                                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                             <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image URL</label>
                                <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} required placeholder="https://picsum.photos/..." className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                            </div>
                            <div className="pt-2 space-y-2">
                                <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors duration-200 disabled:bg-gray-500" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                                {editingProduct && (
                                    <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors duration-200">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                            {submitMessage && <p className="text-green-400 text-sm text-center mt-2">{submitMessage}</p>}
                        </form>
                    </div>
                </div>

                {/* Existing Products List */}
                <div className="lg:col-span-2">
                     <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                         <h2 className="text-2xl font-bold text-cyan-400 mb-4">Existing Products</h2>
                         {loading ? <p className="text-gray-400">Loading products...</p> : (
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                {Object.keys(stores).map(slug => (
                                    <div key={slug}>
                                        <h3 className="text-lg font-semibold text-white mb-2">{stores[slug].companyName}</h3>
                                        {stores[slug].products.length > 0 ? (
                                            <ul className="space-y-2">
                                                {stores[slug].products.map(product => (
                                                    <li key={product.id} className="text-sm bg-gray-700 p-3 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                                        <div className="flex-grow">
                                                            <span className="font-semibold block text-white">{product.name}</span>
                                                            <span className="text-gray-400">Tsh {product.price.toLocaleString('en-US')}</span>
                                                        </div>
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <button onClick={() => handleEdit(product, slug)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md transition-colors">Edit</button>
                                                            <button onClick={() => handleDelete(product.id, slug)} className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition-colors">Delete</button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                        <p className="text-gray-500 text-sm">No products in this store yet.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductsPage;
