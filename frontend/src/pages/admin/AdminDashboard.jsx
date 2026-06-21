import React, { useEffect } from 'react';
import { apiService } from '../../services/apiService';
import MapComponent from '../../components/common/MapComponent';
import { Search, MapPin, CheckCircle, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

const INDORE_COORDINATES = [
  { lat: 22.7219, lng: 75.8011, name: "Indore Airport" },
  { lat: 22.7196, lng: 75.8577, name: "Indore Junction Railway Station" },
  { lat: 22.7253, lng: 75.8655, name: "Palasia Hub" },
  { lat: 22.7533, lng: 75.8937, name: "Vijay Nagar Square" },
  { lat: 22.7185, lng: 75.8538, name: "Rajwada Palace" },
  { lat: 22.6953, lng: 75.8362, name: "Annapurna Temple Area" },
  { lat: 22.7382, lng: 75.8976, name: "Khajrana Temple Area" },
  { lat: 22.6897, lng: 75.8652, name: "Bhawarkua Square" },
  { lat: 22.7445, lng: 75.8752, name: "LIG Square" },
  { lat: 22.7092, lng: 75.8821, name: "Bengali Square" },
  { lat: 22.7305, lng: 75.8205, name: "Chandan Nagar" },
  { lat: 22.7051, lng: 75.8354, name: "Sudama Nagar" }
];

const AdminDashboard = () => {
    const [bookings, setBookings] = React.useState([]);
    const [vehicles, setVehicles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    // UI state
    const [activeTab, setActiveTab] = React.useState('overview');
    const [mapCenter, setMapCenter] = React.useState({ lat: 22.7196, lng: 75.8577 });
    const [selectedVehicleId, setSelectedVehicleId] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsData, vehiclesData] = await Promise.all([
                apiService.bookings.getAll(),
                apiService.vehicles.getAll()
            ]);
            setBookings(bookingsData);
            setVehicles(vehiclesData);
            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching admin data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        document.title = 'Admin Dashboard - TSWheels';
    }, []);

    const getVehicleStatus = (vehicle) => {
        if (vehicle.availability) {
            return 'available';
        }
        // Check if there is an active/confirmed booking
        const hasActiveBooking = bookings.some(b => b.vehicleId === vehicle.id && (b.status === 'confirmed' || b.status === 'pending'));
        return hasActiveBooking ? 'rented' : 'maintenance';
    };

    const getVehicleCoordinates = (vehicle) => {
        const index = (parseInt(vehicle.id) || 0) % INDORE_COORDINATES.length;
        return INDORE_COORDINATES[index];
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicleId(vehicle.id);
        const coord = getVehicleCoordinates(vehicle);
        setMapCenter({ lat: coord.lat, lng: coord.lng });
    };

    const stats = [
        { id: 1, name: 'Total Bookings', value: bookings.length.toString() },
        { id: 2, name: 'Active Rentals', value: bookings.filter(b => b.status === 'confirmed').length.toString() },
        { id: 3, name: 'Available Vehicles', value: vehicles.filter(v => v.availability).length.toString() },
        { id: 4, name: 'Total Revenue', value: '₹' + bookings.reduce((acc, curr) => acc + parseFloat(curr.totalPrice || 0), 0).toFixed(2) },
    ];

    const filteredVehiclesForMap = vehicles.filter(v => {
        const status = getVehicleStatus(v);
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const mapMarkers = filteredVehiclesForMap.map(v => {
        const coord = getVehicleCoordinates(v);
        const status = getVehicleStatus(v);
        const color = status === 'available' ? '#10B981' : (status === 'rented' ? '#EF4444' : '#6B7280');
        const isOpen = selectedVehicleId === v.id;
        
        return {
            lat: coord.lat,
            lng: coord.lng,
            color: color,
            openPopup: isOpen,
            popupText: `
                <div style="font-family: Inter, sans-serif; min-width: 180px;">
                    <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #1F2937;">${v.name}</h3>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">${v.brand} ${v.model} (${v.year})</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 12px;">
                        <span style="font-weight: 600; color: #2563EB;">₹${v.price?.daily || v.price}/day</span>
                        <span style="padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; 
                            background-color: ${status === 'available' ? '#D1FAE5' : (status === 'rented' ? '#FEE2E2' : '#F3F4F6')};
                            color: ${status === 'available' ? '#065F46' : (status === 'rented' ? '#991B1B' : '#374151')};">
                            ${status}
                        </span>
                    </div>
                </div>
            `
        };
    });

    if (loading && bookings.length === 0 && vehicles.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                </button>
            </div>

            {/* Premium Tabbed Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-all duration-200 ${
                        activeTab === 'overview'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-all duration-200 flex items-center gap-2 ${
                        activeTab === 'map'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('map')}
                >
                    <MapPin className="h-4 w-4" />
                    Live Fleet Tracker
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat) => (
                            <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</h2>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Recent Bookings</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Vehicle
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No bookings found</td>
                                        </tr>
                                    ) : (
                                        bookings.slice(0, 10).map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {booking.id.substring(0, 8)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Customer #{booking.userId}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.vehicleName}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{booking.paymentMethod === 'upi' ? 'UPI' : 'Card'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {booking.startDate} - {booking.endDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        booking.status === 'confirmed'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : booking.status === 'completed'
                                                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            : booking.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Popular Vehicles */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Popular Vehicles</h2>
                            <ul className="space-y-4">
                                <li className="flex items-center">
                                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">1</span>
                                    <span className="ml-3 flex-1">
                                        <span className="block font-medium text-gray-900 dark:text-white">Toyota Innova Crysta</span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">42 bookings</span>
                                    </span>
                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        94% Availability
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">2</span>
                                    <span className="ml-3 flex-1">
                                        <span className="block font-medium text-gray-900 dark:text-white">Royal Enfield Classic 350</span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">38 bookings</span>
                                    </span>
                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        89% Availability
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">3</span>
                                    <span className="ml-3 flex-1">
                                        <span className="block font-medium text-gray-900 dark:text-white">Hyundai Creta</span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">35 bookings</span>
                                    </span>
                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                        76% Availability
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">4</span>
                                    <span className="ml-3 flex-1">
                                        <span className="block font-medium text-gray-900 dark:text-white">KTM Duke 390</span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">28 bookings</span>
                                    </span>
                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        92% Availability
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">5</span>
                                    <span className="ml-3 flex-1">
                                        <span className="block font-medium text-gray-900 dark:text-white">Mahindra Thar</span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">26 bookings</span>
                                    </span>
                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        65% Availability
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Monthly Revenue Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Monthly Revenue</h2>
                            <div className="h-60 flex items-end space-x-2">
                                {[60, 85, 70, 92, 80, 95, 100, 110, 90, 105, 120, 95].map((height, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all duration-300 hover:opacity-85" style={{ height: `${height}%` }}></div>
                                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Annual Revenue</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    ₹{bookings.reduce((acc, curr) => acc + parseFloat(curr.totalPrice || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* Live Fleet Tracker Tab */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Search by vehicle name or brand..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">Status:</span>
                            {['all', 'available', 'rented', 'maintenance'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                                        statusFilter === filter
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        {/* Vehicle Sidebar Selector */}
                        <div className="border-r border-gray-200 dark:border-gray-700 h-[500px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {filteredVehiclesForMap.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
                                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium">No matching fleet vehicles found</p>
                                </div>
                            ) : (
                                filteredVehiclesForMap.map((v) => {
                                    const status = getVehicleStatus(v);
                                    const coord = getVehicleCoordinates(v);
                                    const isSelected = selectedVehicleId === v.id;
                                    
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => handleSelectVehicle(v)}
                                            className={`w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 ${
                                                isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{v.name}</h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        status === 'available'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : status === 'rented'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            status === 'available' ? 'bg-green-500' : status === 'rented' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`}></span>
                                                        {status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{v.brand} • {v.type} ({v.year})</p>
                                                
                                                <div className="flex justify-between items-center mt-3 text-xs">
                                                    <span className="text-gray-400 flex items-center gap-1 truncate max-w-[150px]">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                        {coord.name}
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white shrink-0">₹{v.price?.daily || v.price}/day</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Interactive Fleet Tracker Map */}
                        <div className="col-span-2 relative h-[500px]">
                            <MapComponent
                                lat={mapCenter.lat}
                                lng={mapCenter.lng}
                                zoom={13}
                                markers={mapMarkers}
                                className="h-full w-full"
                            />
                            
                            {/* Map Floating Legend Overlay */}
                            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 text-xs space-y-2 z-[999] pointer-events-auto">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1.5">Fleet Legend</h4>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm"></span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Available ({filteredVehiclesForMap.filter(v => getVehicleStatus(v) === 'available').length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-red-500 shadow-sm"></span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Active Rental ({filteredVehiclesForMap.filter(v => getVehicleStatus(v) === 'rented').length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-gray-500 shadow-sm"></span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">In Maintenance ({filteredVehiclesForMap.filter(v => getVehicleStatus(v) === 'maintenance').length})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
