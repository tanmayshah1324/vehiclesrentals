import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Users, Calendar, Settings, LogOut, ChevronRight, List, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const AdminSidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const menuItems = [
        {
            path: '/admin',
            icon: <LayoutDashboard className="h-5 w-5"/>,
            title: 'Dashboard',
            exact: true
        },
        {
            path: '/admin/vehicles',
            icon: <Car className="h-5 w-5"/>,
            title: 'Vehicles',
            exact: false
        },
        {
            path: '/admin/categories',
            icon: <List className="h-5 w-5"/>,
            title: 'Categories',
            exact: false
        },
        {
            path: '/admin/hubs',
            icon: <MapPin className="h-5 w-5"/>,
            title: 'Rental Hubs',
            exact: false
        },
        {
            path: '/admin/bookings',
            icon: <Calendar className="h-5 w-5"/>,
            title: 'Bookings',
            exact: false
        },
        {
            path: '/admin/users',
            icon: <Users className="h-5 w-5"/>,
            title: 'Users',
            exact: false
        },
        {
            path: '/admin/settings',
            icon: <Settings className="h-5 w-5"/>,
            title: 'Settings',
            exact: false
        }
    ];
    const isActive = (path, exact) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };
    return (<div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-orange-500"/>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            TS<span className="text-orange-500">Wheels</span>
          </span>
        </Link>
      </div>
      
      <div className="p-4">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Admin Panel
        </span>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (<li key={item.path}>
              <Link to={item.path} className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive(item.path, item.exact)
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                {item.icon}
                <span className="ml-3">{item.title}</span>
                {isActive(item.path, item.exact) && (<ChevronRight className="h-4 w-4 ml-auto"/>)}
              </Link>
            </li>))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={logout} className="flex items-center px-4 py-3 w-full text-left rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="h-5 w-5"/>
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>);
};
export default AdminSidebar;
