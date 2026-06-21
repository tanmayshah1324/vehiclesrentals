import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, List, FileText, Loader2, Save, X } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();
        document.title = 'Manage Categories - TSWheels';
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await apiService.categories.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
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
        setEditingCategoryId(null);
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setModalMode('edit');
        setEditingCategoryId(category.id);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? All vehicles assigned to this category will remain, but the category category label will be detached.')) return;
        
        try {
            const success = await apiService.categories.delete(id);
            if (success) {
                toast.success('Category deleted successfully');
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Connection failed, category not deleted');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim()
        };

        if (!payload.name) {
            toast.error('Category Name is required');
            setSubmitting(false);
            return;
        }

        try {
            let result;
            if (modalMode === 'add') {
                payload.id = 'cat_' + Date.now().toString();
                result = await apiService.categories.create(payload);
            } else {
                result = await apiService.categories.update(editingCategoryId, payload);
            }

            if (result) {
                toast.success(`Category ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
                setIsModalOpen(false);
                fetchCategories();
            } else {
                toast.error('Operation failed');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <List className="h-6 w-6 mr-2 text-blue-500" />
                        Vehicle Categories
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage rental categories like Hatchback, Sedan, SUV, and Cruiser Bikes.
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5 mr-1.5" />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400">Loading categories...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <List className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No categories found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                        Add your first vehicle category to categorize your rental vehicles.
                    </p>
                    <button
                        onClick={handleOpenAddModal}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1.5" /> Add Category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                                    {category.description || 'No description provided.'}
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <button
                                    onClick={() => handleOpenEditModal(category)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit Category"
                                >
                                    <Edit2 className="h-4.5 w-4.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Category"
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
                                {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
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
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Hatchback, SUV, Cruiser"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the category features and parameters..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
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

export default AdminCategories;
