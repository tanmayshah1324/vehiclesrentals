import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();

    // License & DOB state – persisted in localStorage
    const [licenseNumber, setLicenseNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [licensePdf, setLicensePdf] = useState(null); // { name, dataUrl }
    const [saved, setSaved] = useState(false);

    // Load saved profile data on mount
    useEffect(() => {
        if (!user) return;
        try {
            const profile = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}');
            if (profile.licenseNumber) setLicenseNumber(profile.licenseNumber);
            if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth);
            if (profile.licensePdf) setLicensePdf(profile.licensePdf);
        } catch (e) { /* ignore */ }
    }, [user]);

    // Calculate age from DOB
    const calculateAge = (dob) => {
        if (!dob) return null;
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const age = calculateAge(dateOfBirth);

    // Handle license PDF upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setLicensePdf({ name: file.name, dataUrl: reader.result });
        };
        reader.readAsDataURL(file);
    };

    // Save profile to localStorage
    const handleSave = () => {
        if (!user) return;
        const profileData = {
            licenseNumber,
            dateOfBirth,
            licensePdf
        };
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    // View uploaded PDF
    const handleViewPdf = () => {
        if (!licensePdf?.dataUrl) return;
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${licensePdf.dataUrl}" style="width:100%;height:100%;border:none;"></iframe>`);
        newWindow.document.title = 'Driving License - ' + licenseNumber;
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <User size={48} />
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {saved ? <><CheckCircle size={16} /> Saved!</> : 'Save Profile'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role} Account</p>
                            </div>

                            {/* Basic Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 shadow-sm mr-4">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-green-500 shadow-sm mr-4">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Account Status</p>
                                        <p className="font-medium text-gray-900 dark:text-white">Verified</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-orange-500 shadow-sm mr-4">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                                        <p className="font-medium text-gray-900 dark:text-white">May 2026</p>
                                    </div>
                                </div>

                                {licenseNumber && (
                                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-purple-500 shadow-sm mr-4">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">License Number</p>
                                            <p className="font-medium text-gray-900 dark:text-white font-mono">{licenseNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* License & DOB Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" />
                                    Driving License & Age Verification
                                </h3>

                                {age !== null && age < 18 && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                                        <AlertCircle size={16} className="text-red-500" />
                                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">You must be 18 or older to book a vehicle.</p>
                                    </div>
                                )}

                                {age !== null && age >= 18 && (
                                    <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">Age verified: {age} years old — Eligible to book!</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="block w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg shadow-sm dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                        {dateOfBirth && (
                                            <p className="text-xs text-gray-500 mt-1">Age: {age} years</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driving License Number *</label>
                                        <input
                                            type="text"
                                            value={licenseNumber}
                                            onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                                            placeholder="e.g. MH1220230012345"
                                            className="block w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg shadow-sm dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                        />
                                    </div>
                                </div>

                                {/* License PDF Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Driving License (PDF)</label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors border border-gray-200 dark:border-gray-600">
                                            <Upload size={16} className="text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose PDF</span>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        {licensePdf && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                    <CheckCircle size={14} />
                                                    {licensePdf.name}
                                                </span>
                                                <button
                                                    onClick={handleViewPdf}
                                                    className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Max 5 MB. PDF format only.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
