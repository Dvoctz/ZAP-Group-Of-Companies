import React, { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';
import { uploadProductImage } from '../../supabaseClient';
import { GoogleGenAI } from '@google/genai';

const INITIAL_FORM_STATE = {
    companySlug: 'zap-stationers',
    name: '',
    price: '',
    description: '',
};

type SubmitMessage = {
    text: string;
    type: 'success' | 'error';
};

const AdminProductsPage: React.FC = () => {
    const { stores, addProduct, updateProduct, deleteProduct, loading } = useProducts();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<SubmitMessage | null>(null);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = (product: Product, slug: string) => {
        setEditingProduct(product);
        setFormData({
            companySlug: slug,
            name: product.name,
            price: String(product.price),
            description: product.description,
        });
        setImageFile(null);
        setImagePreview(product.imageUrl);
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
        setImageFile(null);
        setImagePreview(null);
        setSubmitMessage(null);
    };

    const handleGenerateDescription = async () => {
        if (!formData.name || !formData.companySlug) {
            setSubmitMessage({ text: 'Please enter a Product Name and select a Company first.', type: 'error' });
            setTimeout(() => setSubmitMessage(null), 5000);
            return;
        }

        setIsGeneratingDescription(true);
        setSubmitMessage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const companyName = stores[formData.companySlug]?.companyName || 'our store';
            const prompt = `Write a compelling and concise product description (under 1000 characters) for a product named "${formData.name}" from the company "${companyName}". Focus on its key features and benefits for the customer.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const generatedText = response.text;
            const truncatedText = generatedText.substring(0, 1000);
            
            setFormData(prev => ({ ...prev, description: truncatedText }));

        } catch (error: any) {
            console.error("Failed to generate description:", error);
            setSubmitMessage({ text: `AI Error: ${error.message}`, type: 'error' });
            setTimeout(() => setSubmitMessage(null), 5000);
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            let finalImageUrl = editingProduct ? editingProduct.imageUrl : '';

            if (imageFile) {
                const { publicUrl, error } = await uploadProductImage(imageFile);
                if (error || !publicUrl) {
                    throw error || new Error('Image upload failed.');
                }
                finalImageUrl = publicUrl;
            }

            if (editingProduct) {
                const productData: Product = {
                    ...editingProduct,
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    imageUrl: finalImageUrl,
                };
                await updateProduct(formData.companySlug, productData);
                setSubmitMessage({ text: 'Product updated successfully!', type: 'success' });
            } else {
                const productData: Omit<Product, 'id'> = {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    imageUrl: finalImageUrl,
                };
                await addProduct(formData.companySlug, productData);
                setSubmitMessage({ text: 'Product added successfully!', type: 'success' });
            }
            
            handleCancelEdit();

        } catch (error: any) {
            console.error("Failed to save product:", error);
            setSubmitMessage({ text: `Error: ${error.message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitMessage(null), 5000);
        }
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
                                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-300">Product Image</label>
                                <input type="file" id="imageFile" name="imageFile" onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200 cursor-pointer"/>
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img src={imagePreview} alt="Product Preview" className="h-32 w-32 object-cover rounded-md shadow-md" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={isGeneratingDescription || !formData.name}
                                        className="text-xs bg-gray-600 hover:bg-gray-500 text-cyan-300 font-semibold py-1 px-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingDescription ? 'Generating...' : '✨ Generate with AI'}
                                    </button>
                                </div>
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    rows={3} 
                                    required 
                                    maxLength={1000}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                <p className="text-right text-xs text-gray-400 mt-1">
                                    {formData.description.length} / 1000
                                </p>
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
                            {submitMessage && (
                                <p className={`text-sm text-center mt-2 ${submitMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {submitMessage.text}
                                </p>
                            )}
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