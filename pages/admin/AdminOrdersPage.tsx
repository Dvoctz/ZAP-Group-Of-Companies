import React, { useState, useMemo, ChangeEvent } from 'react';
import { Order, OrderStatus } from '../../types';

const getStoredOrders = (): Order[] => {
    const ordersJson = localStorage.getItem('orders');
    return ordersJson ? JSON.parse(ordersJson) : [];
};

const saveOrders = (orders: Order[]) => {
    localStorage.setItem('orders', JSON.stringify(orders));
};

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
    const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
    
    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        const updatedOrders = orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        saveOrders(updatedOrders);
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
                                        <div className="text-sm font-medium text-white" style={getRowStyle(order.status)}>{order.id}</div>
                                        <div className="text-sm text-gray-400">{new Date(order.timestamp).toLocaleString()}</div>
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
                                            disabled={order.status === 'Cancelled'}
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
        </div>
    );
};

export default AdminOrdersPage;