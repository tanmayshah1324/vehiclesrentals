import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, Car, Bike, Loader, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const AdminVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        type: 'car',
        year: new Date().getFullYear(),
        imageUrl: '',
        priceHourly: '',
        priceDaily: '',
        priceWeekly: '',
        priceMonthly: '',
        registrationNumber: '',
        category: '',
        rentalHub: '',
        insuranceExpiry: '',
        pucExpiry: '',
        seats: '5',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        engineCapacity: '',
        mileage: '',
        features: '',
        availability: true
    });

    useEffect(() => {
        fetchAdminData();
        document.title = 'Manage Vehicles - TSWheels';
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [vehiclesData, categoriesData, hubsData] = await Promise.all([
                apiService.vehicles.getAll(),
                apiService.categories.getAll(),
                apiService.hubs.getAll()
            ]);
            setVehicles(vehiclesData);
            setCategories(categoriesData);
            setHubs(hubsData);
        } catch (error) {
            console.error('Error fetching admin vehicles data:', error);
            toast.error('Failed to load fleet dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingVehicleId(null);
        setFormData({
            name: '',
            brand: '',
            model: '',
            type: 'car',
            year: new Date().getFullYear(),
            imageUrl: '',
            priceHourly: '100',
            priceDaily: '600',
            priceWeekly: '3500',
            priceMonthly: '12000',
            registrationNumber: '',
            category: categories[0]?.name || 'SUV',
            rentalHub: hubs[0]?.name || 'Vijay Nagar Downtown Hub',
            insuranceExpiry: '',
            pucExpiry: '',
            seats: '5',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            engineCapacity: '1.5L',
            mileage: '15 km/l',
            features: 'AC, Power Steering, Bluetooth, GPS',
            availability: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vehicle) => {
        setModalMode('edit');
        setEditingVehicleId(vehicle.id);
        setFormData({
            name: vehicle.name,
            brand: vehicle.brand,
            model: vehicle.model,
            type: vehicle.type || 'car',
            year: vehicle.year,
            imageUrl: vehicle.images?.[0] || '',
            priceHourly: vehicle.price?.hourly?.toString() || '0',
            priceDaily: vehicle.price?.daily?.toString() || '0',
            priceWeekly: vehicle.price?.weekly?.toString() || '0',
            priceMonthly: vehicle.price?.monthly?.toString() || '0',
            registrationNumber: vehicle.registrationNumber || '',
            category: vehicle.category || (categories[0]?.name || 'SUV'),
            rentalHub: vehicle.rentalHub || (hubs[0]?.name || 'Vijay Nagar Downtown Hub'),
            insuranceExpiry: vehicle.insuranceExpiry || '',
            pucExpiry: vehicle.pucExpiry || '',
            seats: vehicle.specifications?.seats?.toString() || '5',
            fuelType: vehicle.specifications?.fuelType || 'Petrol',
            transmission: vehicle.specifications?.transmission || 'Automatic',
            engineCapacity: vehicle.specifications?.engineCapacity || '',
            mileage: vehicle.specifications?.mileage || '',
            features: vehicle.specifications?.features?.join(', ') || '',
            availability: vehicle.availability
        });
        setIsModalOpen(true);
    };

    const handleDeleteVehicle = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle from the fleet directory?')) return;
        
        try {
            const success = await apiService.vehicles.delete(id);
            if (success) {
                toast.success('Vehicle deleted successfully');
                setVehicles(prev => prev.filter(v => v.id !== id));
            } else {
                toast.error('Failed to delete vehicle');
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            toast.error('Connection failed, vehicle not deleted');
        }
    };

    const handleToggleAvailability = async (vehicle) => {
        const updatedAvailability = !vehicle.availability;
        try {
            const success = await apiService.vehicles.toggleAvailability(vehicle.id, updatedAvailability);
            if (success) {
                toast.success(`Vehicle status set to ${updatedAvailability ? 'Available' : 'Unavailable'}`);
                setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, availability: updatedAvailability } : v));
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
            toast.error('Failed to toggle availability status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        const payload = {
            name: formData.name,
            brand: formData.brand,
            model: formData.model,
            type: formData.type,
            year: parseInt(formData.year) || new Date().getFullYear(),
            images: [formData.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'],
            price: {
                hourly: parseFloat(formData.priceHourly) || 0,
                daily: parseFloat(formData.priceDaily) || 0,
                weekly: parseFloat(formData.priceWeekly) || 0,
                monthly: parseFloat(formData.priceMonthly) || 0
            },
            registrationNumber: formData.registrationNumber,
            category: formData.category,
            rentalHub: formData.rentalHub,
            insuranceExpiry: formData.insuranceExpiry,
            pucExpiry: formData.pucExpiry,
            specifications: {
                engineCapacity: formData.engineCapacity,
                mileage: formData.mileage,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                seats: parseInt(formData.seats) || 5,
                fuelType: formData.fuelType,
                transmission: formData.transmission
            },
            availability: formData.availability,
            rating: 5.0,
            reviews: 0
        };

        try {
            let result;
            if (modalMode === 'add') {
                payload.id = Date.now().toString();
                result = await apiService.vehicles.create(payload);
            } else {
                result = await apiService.vehicles.update(editingVehicleId, payload);
            }

            if (result) {
                toast.success(`Vehicle ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
                setIsModalOpen(false);
                fetchAdminData();
            } else {
                toast.error('Operation failed');
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            toast.error('An error occurred while saving the vehicle');
        } finally {
            setSaving(false);
        }
    };

    // Filter logic
    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (v.registrationNumber && v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || v.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || 
                              (statusFilter === 'available' && v.availability) || 
                              (statusFilter === 'rented' && !v.availability);
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Car className="h-6 w-6 mr-2 text-blue-500" />
                        Vehicles Directory
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add, edit, or remove vehicles from the rental fleet.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5 mr-1.5" />
                    Add Vehicle
                </button>
            </div>

            {/* Filters panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vehicles by name, brand, or plate no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="car">Cars</option>
                            <option value="bike">Bikes</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="rented">Rented / Out</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="text-gray-500 dark:text-gray-400">Loading vehicles...</span>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        No vehicles found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category / Hub</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pricing (₹)</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mr-3">
                                                    <img
                                                        className="h-full w-full object-cover"
                                                        src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'}
                                                        alt={vehicle.name}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{vehicle.name}</div>
                                                    <div className="text-xs text-gray-550 dark:text-gray-400">
                                                        {vehicle.brand} • {vehicle.year}
                                                        {vehicle.registrationNumber && <span className="ml-1.5 px-1.5 py-0.2 bg-gray-100 dark:bg-gray-700 rounded text-gray-650 font-mono text-[10px] border border-gray-200 dark:border-gray-650">{vehicle.registrationNumber}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-450">
                                            <div className="font-medium text-gray-900 dark:text-white">{vehicle.category || vehicle.type?.toUpperCase()}</div>
                                            <div className="text-xs text-gray-500">{vehicle.rentalHub || 'Palasia Central Hub'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-750 dark:text-gray-300">
                                            <div>Daily: <strong className="text-gray-900 dark:text-white">₹{vehicle.price?.daily}</strong></div>
                                            <div>Monthly: <strong className="text-blue-600 dark:text-blue-400">₹{vehicle.price?.monthly || (vehicle.price?.weekly * 4) || 'N/A'}</strong></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleAvailability(vehicle)}
                                                className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer select-none transition-all ${
                                                    vehicle.availability
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800'
                                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800'
                                                }`}
                                            >
                                                {vehicle.availability ? (
                                                    <><Check className="h-3 w-3 mr-1" /> Available</>
                                                ) : (
                                                    <><X className="h-3 w-3 mr-1" /> Rented / Out</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(vehicle)}
                                                    className="p-1.5 bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md border border-gray-150 dark:border-gray-650 transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="p-1.5 bg-gray-50 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md border border-gray-150 dark:border-gray-650 transition-colors"
                                                    title="Delete Vehicle"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-gray-150 dark:border-gray-700 my-8 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Add Fleet Vehicle' : 'Edit Vehicle Details'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* General */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Vehicle Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Toyota Innova Crysta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Brand *</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        required
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Toyota"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Model *</label>
                                    <input
                                        type="text"
                                        name="model"
                                        required
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Crysta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Year *</label>
                                    <input
                                        type="number"
                                        name="year"
                                        required
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Registration Plate Number *</label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        required
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        placeholder="e.g. MP09CB1234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Vehicle Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="car">Car</option>
                                        <option value="bike">Bike</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                        {categories.length === 0 && (
                                            <>
                                                <option value="SUV">SUV</option>
                                                <option value="Sedan">Sedan</option>
                                                <option value="Hatchback">Hatchback</option>
                                                <option value="Cruiser Bike">Cruiser Bike</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Rental Hub Station *</label>
                                    <select
                                        name="rentalHub"
                                        value={formData.rentalHub}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {hubs.map(h => (
                                            <option key={h.id} value={h.name}>{h.name}</option>
                                        ))}
                                        {hubs.length === 0 && (
                                            <>
                                                <option value="Indore Airport Hub (IDR)">Indore Airport Hub (IDR)</option>
                                                <option value="Indore Junction Railway Station Hub">Indore Junction Railway Station Hub</option>
                                                <option value="Vijay Nagar Downtown Hub">Vijay Nagar Downtown Hub</option>
                                                <option value="Palasia Central Hub">Palasia Central Hub</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-blue-500" /> Fleet Rental Pricing (₹)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Hourly *</label>
                                        <input
                                            type="number"
                                            name="priceHourly"
                                            required
                                            value={formData.priceHourly}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Daily *</label>
                                        <input
                                            type="number"
                                            name="priceDaily"
                                            required
                                            value={formData.priceDaily}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Weekly *</label>
                                        <input
                                            type="number"
                                            name="priceWeekly"
                                            required
                                            value={formData.priceWeekly}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Monthly *</label>
                                        <input
                                            type="number"
                                            name="priceMonthly"
                                            required
                                            value={formData.priceMonthly}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Compliance and Certificates */}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center"><Calendar className="h-4 w-4 mr-1 text-green-500" /> Compliance & Certifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Insurance Expiry Date</label>
                                        <input
                                            type="date"
                                            name="insuranceExpiry"
                                            value={formData.insuranceExpiry}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">PUC Expiry Date</label>
                                        <input
                                            type="date"
                                            name="pucExpiry"
                                            value={formData.pucExpiry}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.type === 'car' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Seats *</label>
                                                <input
                                                    type="number"
                                                    name="seats"
                                                    value={formData.seats}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Fuel Type *</label>
                                                <select
                                                    name="fuelType"
                                                    value={formData.fuelType}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="Electric">Electric</option>
                                                    <option value="EV">EV</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Transmission *</label>
                                                <select
                                                    name="transmission"
                                                    value={formData.transmission}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="Automatic">Automatic</option>
                                                    <option value="Manual">Manual</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Engine Capacity</label>
                                        <input
                                            type="text"
                                            name="engineCapacity"
                                            value={formData.engineCapacity}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 1.5L or 350cc"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Mileage</label>
                                        <input
                                            type="text"
                                            name="mileage"
                                            value={formData.mileage}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 15 km/l or 35 km/l"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Features (Comma separated)</label>
                                        <input
                                            type="text"
                                            name="features"
                                            value={formData.features}
                                            onChange={handleInputChange}
                                            placeholder="AC, GPS Navigation, Bluetooth, Rear Camera"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="availability"
                                    id="availability"
                                    checked={formData.availability}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="availability" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Set as active & immediately available for rental bookings
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                                >
                                    {saving ? 'Saving...' : (modalMode === 'add' ? 'Create Vehicle' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVehicles;
