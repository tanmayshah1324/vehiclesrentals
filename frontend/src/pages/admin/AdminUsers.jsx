import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Shield, Trash2, Mail, Loader } from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
        document.title = 'Manage Users - TSWheels';
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiService.users.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const success = await apiService.users.updateRole(userId, newRole);

            if (success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                alert('Failed to update user role');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleDeleteUser = async (id) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id === id) {
            alert("You cannot delete your own admin account while logged in!");
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user account? All booking associations might remain historical.')) return;
        
        try {
            const success = await apiService.users.delete(id);
            if (success) {
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Accounts</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage platform membership, permissions, and administrative access.</p>
            </div>

            {/* Filter Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Access Level:</label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Users</option>
                        <option value="admin">Administrators</option>
                        <option value="user">Regular Customers</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="text-gray-500 dark:text-gray-400">Loading user list...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        No users found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">User ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email Address</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role / Access</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                                            #{user.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white flex items-center">
                                                <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${
                                                user.role === 'admin'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-800'
                                            }`}>
                                                <Shield className="h-3.5 w-3.5 mr-1" />
                                                {user.role === 'admin' ? 'Administrator' : 'Customer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => handleChangeRole(user.id, user.role)}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 px-2 py-1 rounded transition-colors"
                                                    title="Toggle User/Admin status"
                                                >
                                                    {user.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-950 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                                                    title="Delete User Account"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
