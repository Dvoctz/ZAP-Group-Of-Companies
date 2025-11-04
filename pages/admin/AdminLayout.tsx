import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-cyan-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;
    
    const staticLinkClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <div className="relative flex h-screen bg-gray-900 text-white md:static">
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="text-center py-4">
                    <h1 className="text-2xl font-bold text-cyan-400">ZAP Admin</h1>
                </div>
                <nav className="mt-8 space-y-2 flex-grow">
                    <NavLink to="/admin/dashboard" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>Dashboard</NavLink>
                    <NavLink to="/admin/orders" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>Orders</NavLink>
                    <NavLink to="/admin/products" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>Products</NavLink>
                </nav>

                <div className="mt-auto">
                    <Link to="/" className={staticLinkClasses}>
                        <HomeIcon />
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center md:justify-end">
                    <button 
                        className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <MenuIcon />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="font-semibold py-2 px-4 rounded-md transition-all duration-200 bg-red-600 text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;