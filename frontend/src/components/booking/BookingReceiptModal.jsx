import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { X, Download, Mail, CheckCircle, Calendar, MapPin, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';

const BookingReceiptModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const [vehicle, setVehicle] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (booking?.vehicleId) {
            apiService.vehicles.getById(booking.vehicleId).then(data => {
                setVehicle(data);
            }).catch(err => console.error("Failed to load vehicle details", err));
        }
    }, [booking]);

    // Calculate rental duration in days
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Basic calculation for receipt breakdown
    const rawTotal = parseFloat(booking.totalPrice) || 0;
    const taxRate = 0.12; // 12% standard tax
    const securityDeposit = 2000; // standard security deposit

    // Derived values
    const rentalCharge = (rawTotal - securityDeposit) / (1 + taxRate);
    const gstAmount = rentalCharge * taxRate;

    // Download PDF from backend
    const handleDownloadPDF = async () => {
        setPdfLoading(true);
        setMessage(null);
        try {
            const response = await fetch('http://localhost:3001/api/generate-receipt-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking: {
                        ...booking,
                        customerName: booking.customerName || 'Customer',
                        customerEmail: booking.customerEmail || '',
                        vehicleImage: vehicle?.images?.[0] || '',
                        vehicleFeatures: vehicle?.specifications?.features || [],
                        vehicleSpecs: vehicle?.specifications || {},
                        rtoNumber: vehicle?.rtoNumber || 'MH-01-XX-0000',
                    }
                })
            });
            if (!response.ok) throw new Error('Failed to generate PDF');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TSWheels-Receipt-${booking.id || 'booking'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
        } catch (err) {
            console.error('PDF download error:', err);
            setMessage({ type: 'error', text: 'Failed to download PDF. Is the backend running?' });
        } finally {
            setPdfLoading(false);
        }
    };

    // Send email
    const handleSendEmail = async () => {
        setEmailLoading(true);
        setMessage(null);
        try {
            const result = await apiService.bookings.sendConfirmationEmail(
                booking.customerEmail || 'shahtanmay132@gmail.com',
                {
                    ...booking,
                    vehicleImage: vehicle?.images?.[0] || '',
                    vehicleFeatures: vehicle?.specifications?.features || [],
                    vehicleSpecs: vehicle?.specifications || {},
                    rtoNumber: vehicle?.rtoNumber || 'MH-01-XX-0000',
                }
            );
            if (result?.success) {
                setMessage({ type: 'success', text: 'Email sent successfully! Check your inbox.' });
            } else {
                setMessage({ type: 'success', text: 'Email dispatched. If using Resend free tier, check the registered email.' });
            }
        } catch (err) {
            console.error('Email error:', err);
            setMessage({ type: 'error', text: 'Failed to send email.' });
        } finally {
            setEmailLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-2xl tracking-wider">TSWHEELS</span>
                                <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full">RECEIPT</span>
                            </div>
                            <p className="text-blue-100 text-sm mt-1">Premium Vehicle Rentals</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-200 border border-green-500/30">
                                <CheckCircle size={12} className="mr-1" />
                                {booking.status?.toUpperCase() || 'CONFIRMED'}
                            </span>
                            <p className="text-xs text-blue-200 mt-2">ID: {booking.id || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                    {/* Rental Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Rented Vehicle</h3>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">{booking.vehicleName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Duration: {durationDays} {durationDays === 1 ? 'Day' : 'Days'}</p>

                            {vehicle && (
                                <div className="mt-4 flex items-start space-x-4">
                                    {vehicle.images && vehicle.images.length > 0 && (
                                        <img
                                            src={vehicle.images[0]}
                                            alt={vehicle.name}
                                            className="w-24 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                                        />
                                    )}
                                    {vehicle.specifications && vehicle.specifications.features && (
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Key Features:</p>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                                                {vehicle.specifications.features.slice(0, 4).map((f, i) => (
                                                    <li key={i}>{f}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Billing Information</h3>
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{booking.customerName || 'Customer'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{booking.customerEmail || 'N/A'}</p>
                            {booking.customerPhone && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Phone: {booking.customerPhone}</p>}
                        </div>
                    </div>

                    {/* Booking Stats / Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl">
                        <div className="flex items-center space-x-3 text-sm">
                            <Calendar size={18} className="text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Rental Period</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{booking.startDate} to {booking.endDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <MapPin size={18} className="text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pick-up Hub</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Selected Rental Hub</p>
                            </div>
                        </div>
                    </div>

                    {/* Cost breakdown */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Charges Breakdown</h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Vehicle Rental Charge</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">₹{rentalCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">CGST & SGST (12%)</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">₹{gstAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                    Refundable Security Deposit
                                    <ShieldCheck size={14} className="ml-1 text-green-500" title="100% Refundable on return" />
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">₹{securityDeposit.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-3 flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white">Total Pay</span>
                                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xl">₹{rawTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Reference */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2.5">
                            <CreditCard size={18} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">{booking.paymentMethod || 'UPI'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Ref ID</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 select-all"><code>{booking.transactionId || 'N/A'}</code></p>
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Thank you for choosing TSWheels!
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={pdfLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center text-sm shadow-sm hover:shadow transition-all duration-150"
                        >
                            {pdfLoading ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Download size={16} className="mr-1.5" />}
                            {pdfLoading ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button
                            onClick={handleSendEmail}
                            disabled={emailLoading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center text-sm shadow-sm hover:shadow transition-all duration-150"
                        >
                            {emailLoading ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Mail size={16} className="mr-1.5" />}
                            {emailLoading ? 'Sending...' : 'Email Receipt'}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg text-sm transition-all duration-150"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingReceiptModal;
