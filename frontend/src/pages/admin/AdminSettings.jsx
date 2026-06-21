import React, { useState, useEffect } from 'react';
import { Save, Settings, Info, ShieldAlert, Loader } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        systemName: 'TSWheels',
        contactEmail: 'support@tswheels.com',
        taxRate: 12,
        securityDeposit: 2000,
        termsAndConditions: 'By renting a vehicle, you agree to return it in the same condition as received. A security deposit is required.',
        maintenanceMode: false,
        minAge: 18,
        weeklyDiscount: 10,
        monthlyDiscount: 20
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
        document.title = 'System Settings - TSWheels';
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await apiService.settings.get();
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.target.preventDefault ? e.preventDefault() : (e.returnValue = false);
        setSaving(true);
        try {
            const result = await apiService.settings.update(settings);

            if (result) {
                toast.success('System settings saved successfully!');
            } else {
                toast.error('Failed to save settings to database');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Connection failed, settings not saved.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Settings className="h-6 w-6 mr-2 text-blue-500" />
                    System Configurations
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global pricing variables, system notifications, policies, and active modes.</p>
            </div>

            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400">Loading system settings...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Section 1: General Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
                                General Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Portal Name</label>
                                    <input
                                        type="text"
                                        name="systemName"
                                        required
                                        value={settings.systemName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Support/Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        required
                                        value={settings.contactEmail}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Financial & Age Rules */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
                                Pricing, Taxes & Validation Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Standard Tax Rate (GST %)</label>
                                    <input
                                        type="number"
                                        name="taxRate"
                                        required
                                        min="0"
                                        max="100"
                                        value={settings.taxRate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Default Security Deposit (₹)</label>
                                    <input
                                        type="number"
                                        name="securityDeposit"
                                        required
                                        min="0"
                                        value={settings.securityDeposit}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Minimum Age Requirement (Years)</label>
                                    <input
                                        type="number"
                                        name="minAge"
                                        required
                                        min="1"
                                        max="100"
                                        value={settings.minAge}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Weekly Discount (%)</label>
                                    <input
                                        type="number"
                                        name="weeklyDiscount"
                                        required
                                        min="0"
                                        max="100"
                                        value={settings.weeklyDiscount}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Monthly Discount (%)</label>
                                    <input
                                        type="number"
                                        name="monthlyDiscount"
                                        required
                                        min="0"
                                        max="100"
                                        value={settings.monthlyDiscount}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Policies */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
                                Terms & Conditions Agreement
                            </h3>
                            <div>
                                <textarea
                                    name="termsAndConditions"
                                    rows="4"
                                    required
                                    value={settings.termsAndConditions}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Specify booking rules, driving license requirements, age limitations etc..."
                                />
                            </div>
                        </div>

                        {/* Section 4: Maintenance mode */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 rounded-lg flex items-start space-x-3">
                            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Danger Zone: Maintenance Mode</h4>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                    Enabling maintenance mode blocks all user reservations and locks the frontend catalog from updates. Use only when database migrations are active.
                                </p>
                                <div className="flex items-center space-x-2 mt-3">
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        id="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="maintenanceMode" className="text-sm font-semibold text-red-700 dark:text-red-300">
                                        Activate Maintenance Mode
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors shadow-sm"
                        >
                            {saving ? (
                                <Loader className="h-5 w-5 mr-1.5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5 mr-1.5" />
                            )}
                            Save Configurations
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminSettings;
