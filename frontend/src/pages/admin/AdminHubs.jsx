import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Loader2, Save, X, Map } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const AdminHubs = () => {
    const [hubs, setHubs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingHubId, setEditingHubId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        fetchHubs();
        document.title = 'Manage Rental Hubs - TSWheels';
    }, []);

    const fetchHubs = async () => {
        setLoading(true);
        try {
            const data = await apiService.hubs.getAll();
            setHubs(data);
        } catch (error) {
            console.error('Error fetching hubs:', error);
            toast.error('Failed to load rental hubs');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingHubId(null);
        setFormData({ name: '', address: '', latitude: '22.7196', longitude: '75.8577' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (hub) => {
        setModalMode('edit');
        setEditingHubId(hub.id);
        setFormData({
            name: hub.name,
            address: hub.address || '',
            latitude: hub.latitude?.toString() || '22.7196',
            longitude: hub.longitude?.toString() || '75.8577'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rental hub? Vehicles stationed at this hub will need to be re-assigned.')) return;
        
        try {
            const success = await apiService.hubs.delete(id);
            if (success) {
                toast.success('Rental hub deleted successfully');
                setHubs(prev => prev.filter(h => h.id !== id));
            } else {
                toast.error('Failed to delete rental hub');
            }
        } catch (error) {
            console.error('Error deleting hub:', error);
            toast.error('Connection failed, hub not deleted');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            name: formData.name.trim(),
            address: formData.address.trim(),
            latitude: parseFloat(formData.latitude) || 22.7196,
            longitude: parseFloat(formData.longitude) || 75.8577
        };

        if (!payload.name) {
            toast.error('Hub Name is required');
            setSubmitting(false);
            return;
        }

        try {
            let result;
            if (modalMode === 'add') {
                payload.id = 'hub_' + Date.now().toString();
                result = await apiService.hubs.create(payload);
            } else {
                result = await apiService.hubs.update(editingHubId, payload);
            }

            if (result) {
                toast.success(`Hub ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
                setIsModalOpen(false);
                fetchHubs();
            } else {
                toast.error('Operation failed');
            }
        } catch (error) {
            console.error('Error saving hub:', error);
            toast.error('Failed to save rental hub');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-blue-500" />
                        Rental Hub Locations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure dynamic pickup and return hubs for customers.
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5 mr-1.5" />
                    Add Hub
                </button>
            </div>

            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400">Loading rental hubs...</span>
                </div>
            ) : hubs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No rental hubs found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                        Add your first rental hub location so vehicles can be assigned to a station.
                    </p>
                    <button
                        onClick={handleOpenAddModal}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1.5" /> Add Hub
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hubs.map((hub) => (
                        <div
                            key={hub.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                                    {hub.name}
                                </h3>
                                <p className="text-sm text-gray-650 dark:text-gray-400 mt-2">
                                    <strong>Address:</strong> {hub.address || 'No address details.'}
                                </p>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                                    <Map className="h-3.5 w-3.5" />
                                    Coordinates: {hub.latitude}, {hub.longitude}
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <button
                                    onClick={() => handleOpenEditModal(hub)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit Hub"
                                >
                                    <Edit2 className="h-4.5 w-4.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(hub.id)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Hub"
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-150 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Add Rental Hub' : 'Edit Rental Hub'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                    Hub Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Palasia Hub, Indore Airport Hub"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Palasia Square Main Road"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-300 rounded-lg text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:bg-blue-400"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHubs;
