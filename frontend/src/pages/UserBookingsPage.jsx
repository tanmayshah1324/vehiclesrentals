import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Calendar, MapPin, Package, AlertCircle, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveTracker from '../components/booking/LiveTracker';
import BookingReceiptModal from '../components/booking/BookingReceiptModal';

const UserBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTrackingBooking, setActiveTrackingBooking] = useState(null);
    const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await apiService.bookings.getByUserId(user?.id);
                setBookings(data);
                setLoading(false);
            }
            catch (error) {
                console.error('Error fetching bookings:', error);
                setLoading(false);
            }
        };
        if (user) {
            fetchBookings();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto animate-pulse"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mb-6">
                        <Package size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">You haven't made any bookings yet. Start your journey today!</p>
                    <Link to="/vehicles" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        Browse Vehicles
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                            <div className="md:flex">
                                <div className="p-8 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                                                    booking.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                                        : booking.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                                                        : booking.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{booking.vehicleName}</h2>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                                            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">₹{booking.totalPrice}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                            <Calendar className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
                                            <span>{booking.startDate} to {booking.endDate}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                            <MapPin className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
                                            <span>Pick-up Location Provided</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                            <Package className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
                                            <span>Trans ID: {booking.transactionId}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <AlertCircle className="mr-1.5 h-4 w-4 text-gray-400" />
                                            <span>Need help? Contact support</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                                <button 
                                                    onClick={() => setActiveTrackingBooking(booking)}
                                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all duration-200"
                                                >
                                                    <Navigation className="h-4 w-4 mr-1.5 animate-pulse" />
                                                    Track Location
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setSelectedReceiptBooking(booking)}
                                                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm"
                                            >
                                                View Receipt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTrackingBooking && (
                <LiveTracker 
                    booking={activeTrackingBooking} 
                    onClose={() => setActiveTrackingBooking(null)} 
                />
            )}

            {selectedReceiptBooking && (
                <BookingReceiptModal 
                    booking={selectedReceiptBooking} 
                    onClose={() => setSelectedReceiptBooking(null)} 
                />
            )}
        </div>
    );
};

export default UserBookingsPage;
