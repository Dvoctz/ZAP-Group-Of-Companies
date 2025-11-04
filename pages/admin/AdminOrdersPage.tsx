import React, { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { supabase, OrderRow } from '../../supabaseClient';

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'All'>('All');

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else if (data) {
             const mappedOrders: Order[] = data.map((o: OrderRow) => ({
                id: o.id,
                created_at: o.created_at,
                customer: {
                    name: o.customer_name,
                    contact: o.customer_contact,
                    location: o.customer_location,
                },
                items: o.items,
                totalPrice: o.total_price,
                status: o.status,
            }));
            setOrders(mappedOrders);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);
    
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const originalOrders = [...orders];
        const updatedOrders = orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Failed to update order status:', error);
            setOrders(originalOrders); // Revert on failure
            // Consider adding a user-facing error message here
        }
    };

    const filteredOrders = useMemo(() => {
        if (filter === 'All') return orders;
        return orders.filter(order => order.status === filter);
    }, [orders, filter]);

    const getRowStyle = (status: OrderStatus) => {
        if (status === 'Cancelled') {
            return { color: '#9ca3af', textDecoration: 'line-through' };
        }
        return {};
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-white">Manage Orders</h1>
                <div>
                    <select
                        value={filter}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as OrderStatus | 'All')}
                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-auto"
                    >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

             {loading ? (
                <div className="text-center py-10 text-gray-400">Loading orders...</div>
            ) : (
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                    <tr key={order.id} style={getRowStyle(order.status)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white" style={getRowStyle(order.status)}>{order.id.substring(0,8)}...</div>
                                            <div className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white" style={getRowStyle(order.status)}>{order.customer.name}</div>
                                            <div className="text-sm text-gray-400">{order.customer.contact}</div>
                                            <div className="text-sm text-gray-400">{order.customer.location}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <ul className="text-sm text-gray-400 list-disc list-inside">
                                                {order.items.map(item => (
                                                    <li key={item.id}>{item.name} x {item.quantity}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white" style={getRowStyle(order.status)}>Tsh {order.totalPrice.toLocaleString('en-US')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                                                disabled={order.status === 'Cancelled' || order.status === 'Completed'}
                                            >
                                                <option value="New">New</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancel Order</option>
                                            </select>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400">No orders found for this filter.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
