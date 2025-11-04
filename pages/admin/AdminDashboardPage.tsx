import React, { useState, useMemo, useEffect } from 'react';
import { Order } from '../../types';
import { supabase, OrderRow } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-cyan-400">{value}</p>
    </div>
);

const AdminDashboardPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchOrders();
    }, []);

    const salesData = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalSales = 0;
        let todaySales = 0;
        let weekSales = 0;
        let monthSales = 0;

        orders.forEach(order => {
            if (order.status === 'Completed') {
                const orderDate = new Date(order.created_at);
                totalSales += order.totalPrice;
                if (orderDate >= today) {
                    todaySales += order.totalPrice;
                }
                if (orderDate >= startOfWeek) {
                    weekSales += order.totalPrice;
                }
                if (orderDate >= startOfMonth) {
                    monthSales += order.totalPrice;
                }
            }
        });
        
        const formatCurrency = (amount: number) => `Tsh ${amount.toLocaleString('en-US')}`;

        return {
            total: formatCurrency(totalSales),
            today: formatCurrency(todaySales),
            week: formatCurrency(weekSales),
            month: formatCurrency(monthSales),
        };
    }, [orders]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

            {loading ? (
                <p className="text-gray-400">Loading dashboard data...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Sales (Completed)" value={salesData.total} />
                        <StatCard title="Today's Sales" value={salesData.today} />
                        <StatCard title="This Week's Sales" value={salesData.week} />
                        <StatCard title="This Month's Sales" value={salesData.month} />
                    </div>
                    
                    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-400">Order ID</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-400">Customer</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-400">Total</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 5).map(order => (
                                            <tr key={order.id} className="border-b border-gray-700">
                                                <td className="px-4 py-2 whitespace-nowrap">{order.id.substring(0,8)}...</td>
                                                <td className="px-4 py-2 whitespace-nowrap">{order.customer.name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">Tsh {order.totalPrice.toLocaleString('en-US')}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">{order.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400">No recent orders found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboardPage;
