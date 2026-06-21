import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Users, Fuel, Gauge, Star, Calendar, ArrowLeft, ChevronLeft, ChevronRight, Shield, BarChart, Car, Bike, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [selectedRentalType, setSelectedRentalType] = useState('daily');
    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const data = await apiService.vehicles.getById(id);
                setVehicle(data);
                setLoading(false);
            }
            catch (error) {
                console.error('Error fetching vehicle:', error);
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);
    useEffect(() => {
        if (vehicle) {
            document.title = `${vehicle.name} - TSWheels`;
        }
    }, [vehicle]);
    if (loading) {
        return <div className="container px-4 py-16 mx-auto text-center">Loading...</div>;
    }
    if (!vehicle) {
        return (<div className="container px-4 py-16 mx-auto text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500"/>
        <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Vehicle Not Found</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          The vehicle you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/vehicles" className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4 mr-2"/> View All Vehicles
        </Link>
      </div>);
    }
    const handlePrevImage = () => {
        setCurrentImage((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1));
    };
    const handleNextImage = () => {
        setCurrentImage((prev) => (prev === vehicle.images.length - 1 ? 0 : prev + 1));
    };
    const handleBookNow = () => {
        if (!user) {
            toast.error('Please login to book this vehicle');
            navigate('/login', { state: { from: { pathname: `/vehicles/${id}` } } });
            return;
        }
        navigate(`/booking/${id}`, { state: { rentalType: selectedRentalType } });
    };
    const specIcon = (spec) => {
        const icons = {
            'AC': <span className="text-blue-500">●</span>,
            'Power Steering': <span className="text-green-500">●</span>,
            'Power Windows': <span className="text-purple-500">●</span>,
            'GPS Navigation': <span className="text-red-500">●</span>,
            'Bluetooth': <span className="text-indigo-500">●</span>,
            'Rear Camera': <span className="text-yellow-500">●</span>,
            'ABS': <span className="text-orange-500">●</span>,
            'Disc Brakes': <span className="text-teal-500">●</span>,
            'Electric Start': <span className="text-pink-500">●</span>,
            'Digital Display': <span className="text-cyan-500">●</span>,
            'Helmet Included': <span className="text-amber-500">●</span>,
            'Storage Space': <span className="text-lime-500">●</span>,
            'Bluetooth Connectivity': <span className="text-violet-500">●</span>,
            '4x4 Drive': <span className="text-rose-500">●</span>
        };
        return icons[spec] || <span className="text-gray-500">●</span>;
    };
    return (<div className="container px-4 py-12 mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center mb-6 text-blue-600 transition-colors dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
        <ArrowLeft className="w-4 h-4 mr-1"/> Back to Vehicles
      </button>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Vehicle Images */}
        <div>
          <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-lg dark:bg-gray-800 aspect-w-16 aspect-h-10">
            <img src={vehicle.images[currentImage]} alt={vehicle.name} className="object-cover w-full h-96"/>
            
            <button onClick={handlePrevImage} className="absolute p-2 text-gray-800 transition-colors transform -translate-y-1/2 rounded-full left-2 top-1/2 bg-white/70 hover:bg-white" aria-label="Previous image">
              <ChevronLeft className="w-6 h-6"/>
            </button>
            
            <button onClick={handleNextImage} className="absolute p-2 text-gray-800 transition-colors transform -translate-y-1/2 rounded-full right-2 top-1/2 bg-white/70 hover:bg-white" aria-label="Next image">
              <ChevronRight className="w-6 h-6"/>
            </button>
            
            <div className="absolute left-0 right-0 flex justify-center space-x-1 bottom-3">
              {vehicle.images.map((_, index) => (<button key={index} onClick={() => setCurrentImage(index)} className={`h-2 w-2 rounded-full ${currentImage === index
                ? 'bg-blue-600'
                : 'bg-gray-300 hover:bg-gray-400'}`} aria-label={`Go to image ${index + 1}`}/>))}
            </div>
          </div>
          
          <div className="flex pb-2 space-x-2 overflow-x-auto">
            {vehicle.images.map((img, index) => (<button key={index} onClick={() => setCurrentImage(index)} className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 ${currentImage === index
                ? 'border-blue-600 dark:border-blue-400'
                : 'border-transparent'}`}>
                <img src={img} alt={`${vehicle.name} thumbnail ${index + 1}`} className="object-cover w-full h-full"/>
              </button>))}
          </div>
        </div>
        
        {/* Vehicle Details */}
        <div>
          <div className="flex items-center mb-2 space-x-3">
            <span className={`px-2 py-1 text-xs font-medium rounded ${vehicle.type === 'car'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'}`}>
              {vehicle.type === 'car' ? (<span className="flex items-center">
                  <Car className="w-3 h-3 mr-1"/> Car
                </span>) : (<span className="flex items-center">
                  <Bike className="w-3 h-3 mr-1"/> Bike
                </span>)}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded ${vehicle.availability
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
              {vehicle.availability ? 'Available' : 'Unavailable'}
            </span>
          </div>
          
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{vehicle.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-400">
              <Star className="w-5 h-5 fill-current"/>
              <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">{vehicle.rating}</span>
            </div>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-600 dark:text-gray-400">{vehicle.reviews} reviews</span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-600 dark:text-gray-400">{vehicle.brand}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
            {vehicle.type === 'car' && (<>
                <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Users className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-400"/>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Seats</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vehicle.specifications.seats}</span>
                </div>
                
                <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Fuel className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-400"/>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Fuel</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vehicle.specifications.fuelType}</span>
                </div>
                
                <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <svg className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6H16M6 10H18M8 14H16M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Transmission</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vehicle.specifications.transmission}</span>
                </div>
              </>)}
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Gauge className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-400"/>
              <span className="text-sm text-gray-500 dark:text-gray-400">Engine</span>
              <span className="font-semibold text-gray-900 dark:text-white">{vehicle.specifications.engineCapacity}</span>
            </div>
            
            {vehicle.specifications.mileage && (<div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <BarChart className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-400"/>
                <span className="text-sm text-gray-500 dark:text-gray-400">Mileage</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.specifications.mileage}</span>
              </div>)}
          </div>
          
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Vehicle Features</h3>
            <div className="grid grid-cols-2 gap-y-2">
              {vehicle.specifications.features.map((feature, index) => (<div key={index} className="flex items-center">
                  {specIcon(feature)}
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{feature}</span>
                </div>))}
            </div>
          </div>
          
          <div className="pt-6 mb-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Rental Options</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={() => setSelectedRentalType('hourly')} className={`p-3 text-center rounded-md border transition-colors ${selectedRentalType === 'hourly'
            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className="mb-1 font-semibold text-gray-900 dark:text-white">₹{vehicle.price.hourly}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per hour</div>
              </button>
              
              <button onClick={() => setSelectedRentalType('daily')} className={`p-3 text-center rounded-md border transition-colors ${selectedRentalType === 'daily'
            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className="mb-1 font-semibold text-gray-900 dark:text-white">₹{vehicle.price.daily}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per day</div>
              </button>
              
              <button onClick={() => setSelectedRentalType('weekly')} className={`p-3 text-center rounded-md border transition-colors ${selectedRentalType === 'weekly'
            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className="mb-1 font-semibold text-gray-900 dark:text-white">₹{vehicle.price.weekly}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per week</div>
              </button>
            </div>
            
            <div className="flex mt-4 space-x-3">
              <button onClick={handleBookNow} disabled={!vehicle.availability} className={`flex-1 py-3 px-6 rounded-md font-medium flex items-center justify-center ${vehicle.availability
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}>
                <Calendar className="w-5 h-5 mr-2"/> 
                {vehicle.availability ? 'Book Now' : 'Not Available'}
              </button>
            </div>
            
            <div className="flex items-start mt-4 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="flex-shrink-0 w-5 h-5 mr-2 text-green-600"/>
              <p>Free cancellation up to 24 hours before pickup. We charge a fully refundable security deposit.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 mt-12 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Rental Terms & Conditions</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">Eligibility Requirements</h3>
            <ul className="pl-5 space-y-2 text-gray-600 list-disc dark:text-gray-400">
              <li>Minimum age: 21 years (25 years for premium vehicles)</li>
              <li>Valid driver's license for at least 1 year</li>
              <li>Photo ID (Passport, National ID Card)</li>
              <li>Credit card in renter's name</li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">Rental Inclusions</h3>
            <ul className="pl-5 space-y-2 text-gray-600 list-disc dark:text-gray-400">
              <li>Unlimited mileage</li>
              <li>Insurance coverage (basic)</li>
              <li>24/7 roadside assistance</li>
              <li>For Bikes: Helmet included</li>
              <li>Vehicle cleaned & sanitized before pickup</li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">Additional Charges</h3>
            <ul className="pl-5 space-y-2 text-gray-600 list-disc dark:text-gray-400">
              <li>Security deposit (refundable): ₹500-₹1000 depending on vehicle</li>
              <li>Late return: Hourly rate + 20% penalty</li>
              <li>Fuel: Return with same fuel level or pay refueling fee</li>
              <li>Additional driver: ₹10/day</li>
              <li>Delivery/pickup service: From ₹15</li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">Cancellation Policy</h3>
            <ul className="pl-5 space-y-2 text-gray-600 list-disc dark:text-gray-400">
              <li>Free cancellation up to 24 hours before pickup</li>
              <li>Within 24 hours: 50% of one day rental charge</li>
              <li>No-show: 100% of one day rental charge</li>
              <li>Early returns: No refunds for unused days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>);
};
export default VehicleDetails;
