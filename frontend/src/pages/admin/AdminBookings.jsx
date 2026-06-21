import React, { useState, useEffect } from 'react';
import { Search, Calendar, Check, X, Clock, Trash2, ShieldAlert, Loader } from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
        document.title = 'Manage Bookings - TSWheels';
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await apiService.bookings.getAll();
            // Sort by createdAt descending (newest bookings first)
            const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setBookings(sorted);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, vehicleId, newStatus) => {
        try {
            // 1. Update Booking Status
            const success = await apiService.bookings.updateStatus(bookingId, newStatus);

            if (success) {
                // 2. If status becomes completed or cancelled, make vehicle available again
                if (newStatus === 'completed' || newStatus === 'cancelled') {
                    await apiService.vehicles.toggleAvailability(vehicleId, true);
                }
                
                // 3. Refresh list
                fetchBookings();
            } else {
                alert('Failed to update booking status');
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking record? This cannot be undone.')) return;
        
        try {
            const success = await apiService.bookings.delete(id);
            if (success) {
                setBookings(prev => prev.filter(b => b.id !== id));
            } else {
                alert('Failed to delete booking');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              b.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (b.userId && b.userId.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'completed':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'pending':
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <Check className="h-3.5 w-3.5 mr-1" />;
            case 'completed':
                return <Check className="h-3.5 w-3.5 mr-1" />;
            case 'cancelled':
                return <X className="h-3.5 w-3.5 mr-1" />;
            case 'pending':
            default:
                return <Clock className="h-3.5 w-3.5 mr-1" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Bookings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review, approve, complete, or cancel customer vehicle reservations.</p>
            </div>

            {/* Filter Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search bookings by ID, vehicle name, or customer ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Bookings</option>
                        <option value="pending">Pending Review</option>
                        <option value="confirmed">Active Rentals (Confirmed)</option>
                        <option value="completed">Completed Rentals</option>
                        <option value="cancelled">Cancelled Bookings</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="text-gray-500 dark:text-gray-400">Loading bookings...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        No bookings found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer Info</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle Details</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates & Total</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Manage Status / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                                            #{booking.id.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Customer #{booking.userId}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Pay: {booking.paymentMethod?.toUpperCase()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.vehicleName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Vehicle ID: {booking.vehicleId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white flex items-center">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                {booking.startDate} to {booking.endDate}
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Total Paid: ₹{booking.totalPrice}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getStatusStyles(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, booking.vehicleId, 'confirmed')}
                                                        className="px-2.5 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, booking.vehicleId, 'completed')}
                                                        className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, booking.vehicleId, 'cancelled')}
                                                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-950 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors ml-2"
                                                    title="Delete Booking Record"
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

export default AdminBookings;
