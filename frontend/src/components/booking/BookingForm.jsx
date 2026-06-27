import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, CreditCard, Mail, Phone, MapPin, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import MapComponent from '../common/MapComponent';

const RENTAL_HUBS = [
  { id: 'airport', name: 'Indore Airport Hub (IDR)', lat: 22.7214, lng: 75.8066 },
  { id: 'junction', name: 'Indore Junction Railway Station Hub', lat: 22.7177, lng: 75.8682 },
  { id: 'vijaynagar', name: 'Vijay Nagar Downtown Hub', lat: 22.7533, lng: 75.8937 },
  { id: 'palasia', name: 'Palasia Central Hub', lat: 22.7262, lng: 75.8893 }
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrPaymentStatus, setQrPaymentStatus] = useState('idle'); // idle, waiting, verifying, success
  const [qrTimer, setQrTimer] = useState(120);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await apiService.vehicles.getById(id);
        setVehicle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const [selectedHub, setSelectedHub] = useState(RENTAL_HUBS[0]);
  const initialRentalType = location.state?.rentalType || 'daily';

  // License & DOB from profile (localStorage)
  const [licenseNumber, setLicenseNumber] = useState('');
  const [userAge, setUserAge] = useState(null);

  useEffect(() => {
    if (!user) return;
    try {
      const profile = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}');
      if (profile.licenseNumber) setLicenseNumber(profile.licenseNumber);
      if (profile.dateOfBirth) {
        const today = new Date();
        const birth = new Date(profile.dateOfBirth);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        setUserAge(age);
      }
    } catch (e) { /* ignore */ }
  }, [user]);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    pickupLocation: RENTAL_HUBS[0].name,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd'),
    rentalType: initialRentalType,
    hours: 1
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Cost breakdown constants
  const TAX_RATE = 0.12; // 12% GST
  const SECURITY_DEPOSIT = 2000;
  const rentalCharge = totalPrice;
  const taxAmount = rentalCharge * TAX_RATE;
  const grandTotal = rentalCharge + taxAmount + SECURITY_DEPOSIT;

  useEffect(() => {
    if (!loading && !vehicle) {
      toast.error('Vehicle not found');
      navigate('/vehicles');
      return;
    }
    
    if (!loading && vehicle && !user) {
      toast.error('Please login to book a vehicle');
      navigate('/login', { state: { from: { pathname: `/booking/${id}` } } });
    }
  }, [vehicle, user, id, navigate, loading]);

  useEffect(() => {
    if (!vehicle) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) diffDays = 1;

    let price = 0;
    switch (formData.rentalType) {
      case 'hourly':
        price = vehicle.price.hourly * (formData.hours || 1);
        break;
      case 'daily':
        price = vehicle.price.daily * diffDays;
        break;
      case 'weekly':
        price = vehicle.price.weekly * Math.ceil(diffDays / 7);
        break;
      case 'monthly':
        price = (vehicle.price.weekly * 4) * Math.ceil(diffDays / 30);
        break;
    }

    setTotalPrice(price);
  }, [formData.startDate, formData.endDate, formData.rentalType, formData.hours, vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleHubChange = (e) => {
    const hubId = e.target.value;
    const hub = RENTAL_HUBS.find(h => h.id === hubId) || RENTAL_HUBS[0];
    setSelectedHub(hub);
    setFormData(prev => ({ ...prev, pickupLocation: hub.name }));
  };

  // Generate UPI QR code URL
  const getQrCodeUrl = (amount) => {
    const upiPaymentString = `upi://pay?pa=tswheels@ybl&pn=TSWheels&am=${amount}&cu=INR&tn=Vehicle%20Rental%20Booking`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPaymentString)}&bgcolor=ffffff&color=000000&margin=8`;
  };

  // Handle QR code payment flow
  const handleShowQrCode = () => {
    setShowQrCode(true);
    setQrPaymentStatus('waiting');
    setQrTimer(120);
  };

  // QR countdown timer
  useEffect(() => {
    if (qrPaymentStatus !== 'waiting') return;
    if (qrTimer <= 0) {
      setQrPaymentStatus('idle');
      setShowQrCode(false);
      toast.error('QR code expired. Please try again.');
      return;
    }
    const interval = setInterval(() => setQrTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [qrPaymentStatus, qrTimer]);

  // Simulate QR scan detection after user clicks "I've Paid"
  const handleConfirmQrPayment = async () => {
    setQrPaymentStatus('verifying');
    const totalAmount = grandTotal.toFixed(2);

    // Simulate verification delay
    await new Promise(r => setTimeout(r, 2500));
    setQrPaymentStatus('success');
    toast.success('UPI Payment verified successfully!');

    await new Promise(r => setTimeout(r, 1000));

    const bookingData = {
      id: Date.now().toString(),
      userId: user?.id,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalPrice: totalAmount,
      status: 'confirmed',
      paymentMethod: 'upi',
      transactionId: 'UPI' + Date.now(),
      createdAt: new Date().toISOString(),
      customerName: user?.name || formData.fullName || '',
      customerEmail: user?.email || formData.email || '',
      vehicleNumber: vehicle.registrationNumber || '',
      vehicleCategory: vehicle.category || '',
      vehicleFuelType: vehicle.specifications?.fuelType || '',
      vehicleTransmission: vehicle.specifications?.transmission || '',
      vehicleHub: vehicle.rentalHub || '',
      vehicleImage: vehicle.images?.[0] || '',
      securityDeposit: securityDeposit || 2000
    };

    try {
      const bookingResult = await apiService.bookings.create(bookingData);
      if (bookingResult) {
        await apiService.vehicles.toggleAvailability(vehicle.id, false);
        toast.success('Booking confirmed successfully!');
        
        // Trigger email confirmation asynchronously
        apiService.bookings.sendConfirmationEmail(formData.email || user?.email, bookingResult).then(res => {
          if (res.previewUrl) {
            toast.success(
              (t) => (
                <span>
                  Confirmation email sent!{' '}
                  <a
                    href={res.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 font-semibold"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Preview Email
                  </a>
                </span>
              ),
              { duration: 15000 }
            );
          } else {
            toast.success('Confirmation email sent!');
          }
        }).catch(err => console.error('Email error:', err));

        navigate('/bookings', { replace: true });
      } else {
        toast.error('Failed to save booking.');
      }
    } catch (err) {
      console.error('Save booking error:', err);
      toast.error('Error saving booking.');
    }
    setQrPaymentStatus('idle');
    setShowQrCode(false);
  };

  const saveBookingAfterPayment = async (totalAmount, method, transactionId) => {
    const bookingData = {
      id: Date.now().toString(),
      userId: user?.id,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalPrice: totalAmount,
      status: 'confirmed',
      paymentMethod: method,
      transactionId: transactionId,
      createdAt: new Date().toISOString(),
      customerName: user?.name || formData.fullName || '',
      customerEmail: user?.email || formData.email || '',
      vehicleNumber: vehicle.registrationNumber || '',
      vehicleCategory: vehicle.category || '',
      vehicleFuelType: vehicle.specifications?.fuelType || '',
      vehicleTransmission: vehicle.specifications?.transmission || '',
      vehicleHub: vehicle.rentalHub || '',
      vehicleImage: vehicle.images?.[0] || '',
      securityDeposit: securityDeposit || 2000
    };

    try {
      const bookingResult = await apiService.bookings.create(bookingData);
      if (bookingResult) {
        await apiService.vehicles.toggleAvailability(vehicle.id, false);
        toast.success('Booking confirmed successfully!');
        
        // Trigger email confirmation asynchronously
        apiService.bookings.sendConfirmationEmail(formData.email || user?.email, bookingResult).then(res => {
          if (res.previewUrl) {
            toast.success(
              (t) => (
                <span>
                  Confirmation email sent!{' '}
                  <a
                    href={res.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 font-semibold"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Preview Email
                  </a>
                </span>
              ),
              { duration: 15000 }
            );
          } else {
            toast.success('Confirmation email sent!');
          }
        }).catch(err => console.error('Email error:', err));

        navigate('/bookings', { replace: true });
      } else {
        toast.error('Failed to save booking. Please contact support.');
      }
    } catch (err) {
      console.error('Failed to save booking:', err);
      toast.error('An error occurred while saving booking.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!vehicle) {
      toast.error('Vehicle not found');
      setIsSubmitting(false);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) {
      toast.error('End date must be after start date');
      setIsSubmitting(false);
      return;
    }

    const totalAmount = grandTotal.toFixed(2);

    try {
      if (paymentMethod === 'razorpay') {
        setIsProcessingPayment(true);
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
          setIsProcessingPayment(false);
          setIsSubmitting(false);
          return;
        }

        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SzYPIBRIieOUmK';

        const options = {
          key: keyId,
          amount: Math.round(parseFloat(totalAmount) * 100),
          currency: 'INR',
          name: 'TSWheels',
          description: `Rental booking for ${vehicle.name}`,
          image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Razorpay_logo.svg/1200px-Razorpay_logo.svg.png',
          handler: async function (response) {
            toast.success('Payment verified: ' + response.razorpay_payment_id);
            await saveBookingAfterPayment(totalAmount, 'razorpay', response.razorpay_payment_id);
            setIsProcessingPayment(false);
            setIsSubmitting(false);
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: formData.phone || '9999999999'
          },
          notes: {
            vehicle_id: vehicle.id,
            user_id: user?.id
          },
          theme: {
            color: '#2563EB'
          },
          modal: {
            ondismiss: function() {
              toast('Payment cancelled', { icon: '⚠️' });
              setIsProcessingPayment(false);
              setIsSubmitting(false);
            }
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            toast.error('Payment failed: ' + (resp.error?.description || 'Unknown error'));
            setIsProcessingPayment(false);
            setIsSubmitting(false);
          });
          rzp.open();
        } catch (rzpErr) {
          console.error('Razorpay error:', rzpErr);
          toast.error('Could not open Razorpay. The test key may be invalid. Try UPI QR instead.');
          setIsProcessingPayment(false);
          setIsSubmitting(false);
        }
      } else if (paymentMethod === 'upi') {
        // UPI QR Code flow - handled separately via handleShowQrCode / handleConfirmQrPayment
        handleShowQrCode();
        setIsSubmitting(false);
      } else {
        // Demo Card Payment
        setIsProcessingPayment(true);
        const paymentData = await apiService.bookings.simulatePayment(totalAmount, 'CARD');
        if (paymentData.status !== 'success') {
          toast.error('Payment failed. Please try again.');
          setIsProcessingPayment(false);
          setIsSubmitting(false);
          return;
        }
        toast.success('Payment verified: ' + paymentData.transactionId);
        await saveBookingAfterPayment(totalAmount, 'creditCard', paymentData.transactionId);
        setIsProcessingPayment(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('An error occurred during payment processing.');
      setIsProcessingPayment(false);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.startDate || !formData.endDate || !formData.pickupLocation) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      if (!formData.phone.match(/^\d{10}$/)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }

      // Age verification — must be 18+
      if (userAge !== null && userAge < 18) {
        toast.error('You must be 18 years or older to book a vehicle.');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">Book Your Vehicle</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 h-2 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex-1 h-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex-1 h-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className={currentStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>Choose Dates</div>
            <div className={currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>Personal Info</div>
            <div className={currentStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>Confirm & Pay</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Date Selection */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Select Your Rental Dates</h2>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="startDate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Pick-up Date *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            required
                            className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Return Date *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate}
                            required
                            className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="rentalType" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Rental Type *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          id="rentalType"
                          name="rentalType"
                          value={formData.rentalType}
                          onChange={handleChange}
                          required
                          className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="hourly">Hourly (₹{vehicle.price.hourly}/hour)</option>
                          <option value="daily">Daily (₹{vehicle.price.daily}/day)</option>
                          <option value="weekly">Weekly (₹{vehicle.price.weekly}/week)</option>
                          <option value="monthly">Monthly (₹{(vehicle.price.weekly * 4).toLocaleString()}/month)</option>
                        </select>
                      </div>
                      {formData.rentalType === 'hourly' && (
                        <div className="mt-3">
                          <label htmlFor="hours" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Number of Hours *</label>
                          <input
                            type="number"
                            id="hours"
                            name="hours"
                            min="1"
                            max="24"
                            value={formData.hours}
                            onChange={handleChange}
                            className="block w-full py-2 px-3 text-sm border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="pickupLocation" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Pick-up Location Hub *</label>
                      <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          id="pickupLocation"
                          value={selectedHub.id}
                          onChange={handleHubChange}
                          required
                          className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {RENTAL_HUBS.map(hub => (
                            <option key={hub.id} value={hub.id}>{hub.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                        <MapComponent 
                          lat={selectedHub.lat} 
                          lng={selectedHub.lng} 
                          zoom={14} 
                          markers={[{
                            lat: selectedHub.lat, 
                            lng: selectedHub.lng, 
                            popupText: selectedHub.name,
                            openPopup: true
                          }]} 
                          className="h-[200px] w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Personal Information */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>

                    {/* Age verification warning */}
                    {userAge !== null && userAge < 18 && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">You must be 18+ to book. Please update your Date of Birth in your <a href="/profile" className="underline font-bold">Profile</a>.</p>
                      </div>
                    )}

                    {/* License number display */}
                    {licenseNumber ? (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                        <FileText size={16} className="text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-700 dark:text-green-300">License: <span className="font-mono font-bold">{licenseNumber}</span> {userAge !== null && <span>| Age: {userAge} yrs</span>}</p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">No license found. Please add your driving license in your <a href="/profile" className="underline font-bold">Profile</a> first.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit phone number"
                          required
                          className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={userAge !== null && userAge < 18}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Payment and Confirmation */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-white">Payment & Confirmation</h2>
                    
                    <div className="mb-6">
                      <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">Booking Summary</h3>
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-700">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-gray-600 dark:text-gray-400">Pick-up Date:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{formData.startDate}</div>
                          
                          <div className="text-gray-600 dark:text-gray-400">Return Date:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{formData.endDate}</div>
                          
                          <div className="text-gray-600 dark:text-gray-400">Pick-up Location:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{formData.pickupLocation}</div>
                          
                          <div className="text-gray-600 dark:text-gray-400">Rental Type:</div>
                          <div className="font-medium text-gray-900 capitalize dark:text-white">{formData.rentalType}</div>
                          
                          <div className="text-gray-600 dark:text-gray-400">Vehicle:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{vehicle.name}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">Payment Method</h3>
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-700">
                        {/* Payment Method Selector Cards */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('upi'); setShowQrCode(false); setQrPaymentStatus('idle'); }}
                            className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                              paymentMethod === 'upi'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500/30'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="text-2xl mb-1">📱</div>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">UPI / QR Code</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Scan & Pay</div>
                            {paymentMethod === 'upi' && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('razorpay'); setShowQrCode(false); setQrPaymentStatus('idle'); }}
                            className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                              paymentMethod === 'razorpay'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500/30'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="text-2xl mb-1">💳</div>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Razorpay</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Cards, UPI, Wallets</div>
                            {paymentMethod === 'razorpay' && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('creditCard'); setShowQrCode(false); setQrPaymentStatus('idle'); }}
                            className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                              paymentMethod === 'creditCard'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500/30'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="text-2xl mb-1">🏦</div>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Demo Card</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Mock Payment</div>
                            {paymentMethod === 'creditCard' && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              </div>
                            )}
                          </button>
                        </div>
                        
                        {paymentMethod === 'upi' ? (
                          <div>
                            {!showQrCode ? (
                              <div>
                                <div className="mb-4 p-4 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📱</span>
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Pay via UPI QR Code</h4>
                                  </div>
                                  <p className="text-xs text-green-700 dark:text-green-400">Click "Confirm & Pay" below to generate a UPI QR code. Scan it with any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your payment.</p>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="upiId" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Your UPI ID (optional)</label>
                                  <input
                                    type="text"
                                    id="upiId"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="yourname@paytm"
                                    className="block w-full py-2.5 px-3 text-sm placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                  />
                                </div>
                              </div>
                            ) : (
                              /* QR Code Display */
                              <div className="flex flex-col items-center">
                                {qrPaymentStatus === 'waiting' && (
                                  <div className="w-full">
                                    <div className="flex flex-col items-center p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                                      {/* Header */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">₹</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">TSWheels UPI Payment</span>
                                      </div>

                                      {/* Amount Badge */}
                                      <div className="mb-4 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                        <span className="text-xl font-bold text-blue-700 dark:text-blue-300">₹{grandTotal.toFixed(2)}</span>
                                      </div>

                                      {/* QR Code */}
                                      <div className="p-3 bg-white rounded-xl border-2 border-gray-100 shadow-inner mb-4">
                                        <img
                                          src={getQrCodeUrl((totalPrice * 1.1).toFixed(2))}
                                          alt="UPI QR Code"
                                          className="w-[200px] h-[200px]"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div style="width:200px;height:200px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:8px;flex-direction:column;gap:8px"><span style="font-size:48px">📱</span><span style="font-size:12px;color:#6b7280;font-weight:600">QR Code</span></div>';
                                          }}
                                        />
                                      </div>

                                      {/* Scan Instructions */}
                                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Scan with <strong>GPay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong> or any UPI app</p>

                                      {/* Timer */}
                                      <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                                        <div className={`h-2 w-2 rounded-full ${qrTimer > 30 ? 'bg-green-500' : qrTimer > 10 ? 'bg-orange-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                                        <span className={`text-xs font-semibold ${qrTimer > 30 ? 'text-green-700 dark:text-green-300' : qrTimer > 10 ? 'text-orange-700 dark:text-orange-300' : 'text-red-700 dark:text-red-300'}`}>
                                          Expires in {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}
                                        </span>
                                      </div>

                                      {/* UPI Apps Logos Row */}
                                      <div className="flex items-center justify-center gap-3 mb-4 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Supported:</span>
                                        <span className="text-lg" title="Google Pay">🅖</span>
                                        <span className="text-lg" title="PhonePe">📲</span>
                                        <span className="text-lg" title="Paytm">💰</span>
                                        <span className="text-lg" title="BHIM">🏦</span>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-3 w-full">
                                        <button
                                          type="button"
                                          onClick={() => { setShowQrCode(false); setQrPaymentStatus('idle'); }}
                                          className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleConfirmQrPayment}
                                          className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                          I've Paid
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {qrPaymentStatus === 'verifying' && (
                                  <div className="flex flex-col items-center py-8 w-full">
                                    <div className="relative mb-4">
                                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl">🔍</span>
                                      </div>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Verifying Payment...</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we confirm your UPI transaction</p>
                                  </div>
                                )}

                                {qrPaymentStatus === 'success' && (
                                  <div className="flex flex-col items-center py-8 w-full">
                                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-bounce">
                                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-1 text-lg">Payment Successful!</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Saving your booking...</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : paymentMethod === 'razorpay' ? (
                          <div className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">💳</span>
                              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Secure Checkout via Razorpay</h4>
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Click "Confirm & Pay" to open the secure Razorpay popup. You can pay with UPI, debit/credit cards, net banking, or wallets.</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold uppercase tracking-wider">Test Card:</span>
                              <code className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono">4111 1111 1111 1111</code>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                              <label htmlFor="cardNumber" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <CreditCard className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  id="cardNumber"
                                  placeholder="1234 5678 9012 3456"
                                  className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="expiryDate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                                <input
                                  type="text"
                                  id="expiryDate"
                                  placeholder="MM/YY"
                                  className="block w-full px-3 py-2 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="cvv" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                                <input
                                  type="text"
                                  id="cvv"
                                  placeholder="123"
                                  className="block w-full px-3 py-2 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="nameOnCard" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name on Card</label>
                              <input
                                type="text"
                                id="nameOnCard"
                                placeholder="Full Name"
                                className="block w-full px-3 py-2 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                        
                        {!showQrCode && (
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {isProcessingPayment ? 'Securely processing your payment...' : 'Your payment is secured with 256-bit SSL encryption'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!showQrCode && (
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || isProcessingPayment}
                          className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                          {isSubmitting || isProcessingPayment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              {paymentMethod === 'upi' ? '📱 Generate QR & Pay' : paymentMethod === 'razorpay' ? '💳 Confirm & Pay' : '🏦 Confirm & Pay'}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Booking Summary Column */}
          <div className="order-first md:order-last">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Booking Summary</h3>
              
              <div className="flex items-center mb-4">
                <img src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'} alt={vehicle.name} className="object-cover w-20 h-16 mr-4 rounded-md" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{vehicle.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.type === 'car' ? 'Car' : 'Bike'}</p>
                </div>
              </div>

              {/* License Info */}
              {licenseNumber && (
                <div className="mb-3 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-300 flex items-center gap-1"><FileText size={12} /> License: <span className="font-mono font-bold">{licenseNumber}</span></p>
                </div>
              )}
              
              <div className="py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rental Rate:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{formData.rentalType === 'hourly' 
                      ? vehicle.price.hourly + '/hour' 
                      : formData.rentalType === 'daily' 
                      ? vehicle.price.daily + '/day' 
                      : formData.rentalType === 'monthly'
                      ? (vehicle.price.weekly * 4).toLocaleString() + '/month'
                      : vehicle.price.weekly + '/week'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(() => {
                      if (formData.rentalType === 'hourly') return `${formData.hours || 1} hour(s)`;
                      const start = new Date(formData.startDate);
                      const end = new Date(formData.endDate);
                      const diffDays = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
                      return `${diffDays} day(s)`;
                    })()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rental Charge:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{rentalCharge.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">GST (12%):</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">Security Deposit <span className="text-[10px] text-green-500">(Refundable)</span></span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{SECURITY_DEPOSIT.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  *Security deposit of ₹{SECURITY_DEPOSIT.toLocaleString()} will be refunded upon vehicle return
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
