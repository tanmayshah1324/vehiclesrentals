import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
const AdminLayout = () => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
                <div className="text-lg font-medium">Verifying authorization...</div>
            </div>
        );
    }

    // Redirect if not an admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace/>;
    }
    return (<div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>);
};
export default AdminLayout;
