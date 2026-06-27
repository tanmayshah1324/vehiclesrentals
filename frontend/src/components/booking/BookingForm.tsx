import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vehicles } from '../../data/vehicles';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  startDate: string;
  endDate: string;
  rentalType: 'hourly' | 'daily' | 'weekly';
}
import { Calendar, Clock, User, CreditCard, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import api from '../../config/api';

const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth() as { user: any };

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'upi'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await api.get(`/vehicles/${id}`);
        setVehicle(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);
  const initialRentalType = (location.state?.rentalType as 'hourly' | 'daily' | 'weekly') || 'daily';

  const [formData, setFormData] = useState<BookingFormData>({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    pickupLocation: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd'),
    rentalType: initialRentalType
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

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
        price = vehicle.price.hourly * 24 * diffDays;
        break;
      case 'daily':
        price = vehicle.price.daily * diffDays;
        break;
      case 'weekly':
        price = vehicle.price.weekly * (diffDays / 7);
        if (diffDays % 7 !== 0) {
          price = vehicle.price.weekly * Math.ceil(diffDays / 7);
        }
        break;
    }

    setTotalPrice(price);
  }, [formData.startDate, formData.endDate, formData.rentalType, vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!vehicle) {
      toast.error('Vehicle not found');
      setIsSubmitting(false);
      return;
    }

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) {
      toast.error('End date must be after start date');
      setIsSubmitting(false);
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      toast.error('Please enter your UPI ID');
      setIsSubmitting(false);
      return;
    }

    try {
      setIsProcessingPayment(true);
      const totalAmount = (totalPrice * 1.1).toFixed(2);
      const txnid = 'TXN' + Date.now();
      
      if (paymentMethod === 'creditCard') {
        // --- Easebuzz Integration ---
        const productinfo = `Booking for ${vehicle.name}`;
        
        const initiateResponse = await api.post('/api/easebuzz/initiate', {
          txnid,
          amount: totalAmount,
          productinfo,
          firstname: formData.firstName,
          email: formData.email,
          phone: formData.phone
        });
        const easebuzzData = initiateResponse.data;

        if (easebuzzData.status === 1 && easebuzzData.data) {
          // Save pending booking
          const bookingData = {
            id: txnid,
            userId: user?.id,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalPrice: totalAmount,
            status: 'pending',
            paymentMethod,
            transactionId: txnid,
            createdAt: new Date().toISOString()
          };

          await api.post('/bookings', bookingData);

          // Redirect to Easebuzz Hosted Checkout
          window.location.href = `https://testpay.easebuzz.in/pay/${easebuzzData.data}`;
          return;
        } else {
          toast.error('Failed to initiate payment. Please try again.');
          setIsProcessingPayment(false);
          setIsSubmitting(false);
          return;
        }
      }

      const paymentResponse = await api.post('/simulate-upi-payment', { amount: totalAmount, upiId: upiId });
      const paymentData = paymentResponse.data;
      
      if (paymentData.status !== 'success') {
        toast.error('Payment failed. Please try again.');
        setIsProcessingPayment(false);
        setIsSubmitting(false);
        return;
      }

      toast.success('Payment verified: ' + paymentData.transactionId);

      // Save booking to backend
      const bookingData = {
        id: Date.now().toString(),
        userId: user?.id,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: totalAmount,
        status: 'confirmed',
        paymentMethod,
        transactionId: paymentData.transactionId,
        createdAt: new Date().toISOString()
      };

      const bookingResponse = await api.post('/bookings', bookingData);

      if (bookingResponse.status === 200 || bookingResponse.status === 201) {
        toast.success('Booking confirmed successfully!');
        navigate('/bookings', { replace: true });
      } else {
        toast.error('Failed to save booking. Please contact support.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsProcessingPayment(false);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate required fields before proceeding
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
    return null; // Will be handled by useEffect navigate
  }

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">Book Your Vehicle</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div 
              className={`flex-1 h-2 ${
                currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
            <div 
              className={`flex-1 h-2 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
            <div 
              className={`flex-1 h-2 ${
                currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className={currentStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
              Choose Dates
            </div>
            <div className={currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
              Personal Info
            </div>
            <div className={currentStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
              Confirm & Pay
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Date Selection */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                      Select Your Rental Dates
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      <div>
                        <label 
                          htmlFor="startDate" 
                          className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Pick-up Date *
                        </label>
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
                        <label 
                          htmlFor="endDate" 
                          className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Return Date *
                        </label>
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
                      <label 
                        htmlFor="rentalType" 
                        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Rental Type *
                      </label>
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
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label 
                        htmlFor="pickupLocation" 
                        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Pick-up Location *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="pickupLocation"
                          name="pickupLocation"
                          value={formData.pickupLocation}
                          onChange={handleChange}
                          placeholder="Enter pickup location"
                          required
                          className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      <div>
                        <label 
                          htmlFor="firstName" 
                          className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          First Name *
                        </label>
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
                        <label 
                          htmlFor="lastName" 
                          className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Last Name *
                        </label>
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
                      <label 
                        htmlFor="email" 
                        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email *
                      </label>
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
                      <label 
                        htmlFor="phone" 
                        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Phone Number *
                      </label>
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
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Back
                      </button>
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
                
                {/* Step 3: Payment and Confirmation */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                      Payment & Confirmation
                    </h2>
                    
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
                        <div className="flex gap-4 mb-6">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="upi"
                              checked={paymentMethod === 'upi'}
                              onChange={() => setPaymentMethod('upi')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">UPI</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="creditCard"
                              checked={paymentMethod === 'creditCard'}
                              onChange={() => setPaymentMethod('creditCard')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">Credit Card</span>
                          </label>
                        </div>
                        
                        {paymentMethod === 'upi' ? (
                          <div className="mb-4">
                            <label 
                              htmlFor="upiId" 
                              className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Enter UPI ID *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-400 font-bold">₹</span>
                              </div>
                              <input
                                type="text"
                                id="upiId"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="username@upi"
                                required={paymentMethod === 'upi'}
                                className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              A payment request will be sent to your UPI app.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                              <label 
                                htmlFor="cardNumber" 
                                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Card Number
                              </label>
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
                                <label 
                                  htmlFor="expiryDate" 
                                  className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  id="expiryDate"
                                  placeholder="MM/YY"
                                  className="block w-full px-3 py-2 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label 
                                  htmlFor="cvv" 
                                  className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  id="cvv"
                                  placeholder="123"
                                  className="block w-full px-3 py-2 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label 
                                htmlFor="nameOnCard" 
                                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Name on Card
                              </label>
                              <input
                                type="text"
                                id="nameOnCard"
                                placeholder="Full Name"
                                className="block w-full px-3 py-2 text-sm placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isProcessingPayment ? 'Securely processing your payment...' : 'Your payment is secured with 256-bit encryption.'}
                        </p>
                      </div>
                    </div>
                    
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
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Booking Summary */}
          <div className="order-first md:order-last">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Booking Summary</h3>
              
              <div className="flex items-center mb-4">
                <img 
                  src={vehicle.images[0]} 
                  alt={vehicle.name} 
                  className="object-cover w-20 h-16 mr-4 rounded-md" 
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{vehicle.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.type === 'car' ? 'Car' : 'Bike'}</p>
                </div>
              </div>
              
              <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Rental Rate:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                  ₹{formData.rentalType === 'hourly' 
                      ? vehicle.price.hourly + '/hour' 
                      : formData.rentalType === 'daily' 
                      ? vehicle.price.daily + '/day' 
                      : vehicle.price.weekly + '/week'}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(() => {
                      const start = new Date(formData.startDate);
                      const end = new Date(formData.endDate);
                      const diffTime = Math.abs(end.getTime() - start.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays === 0 ? '1 day' : `${diffDays} days`;
                    })()}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Tax (10%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{(totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  ₹{(totalPrice * 1.1).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  *Security deposit of ₹500 will be refunded upon return
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