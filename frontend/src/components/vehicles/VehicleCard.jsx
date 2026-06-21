import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, Star } from 'lucide-react';
const VehicleCard = ({ vehicle }) => {
    const { id, name, type, brand, images, price, specifications, availability, rating, reviews } = vehicle;
    return (<div className="overflow-hidden transition-transform duration-300 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1" data-aos="fade-up">
      <div className="relative">
        <img src={images[0]} alt={name} className="object-cover w-full h-48"/>
        
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium px-2 py-1 rounded ${type === 'car'
            ? 'bg-blue-500 text-white'
            : 'bg-orange-500 text-white'}`}>
            {type === 'car' ? 'Car' : 'Bike'}
          </span>
        </div>
        
        {/* Availability badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-2 py-1 rounded ${availability
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'}`}>
            {availability ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current"/>
            <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">{rating} ({reviews})</span>
          </div>
        </div>
        
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{brand}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {type === 'car' && (<>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Users className="h-3.5 w-3.5 mr-1"/> 
                <span>{specifications.seats} Seats</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Fuel className="h-3.5 w-3.5 mr-1"/> 
                <span>{specifications.fuelType}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6H16M6 10H18M8 14H16M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{specifications.transmission}</span>
              </div>
            </>)}
          
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Gauge className="h-3.5 w-3.5 mr-1"/> 
            <span>{specifications.engineCapacity}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Starting from</span>
            <div className="font-bold text-blue-600 dark:text-blue-400">₹{price.daily}/day</div>
          </div>
          <Link to={`/vehicles/${id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            View Details
          </Link>
        </div>
        
        <Link to={availability ? `/booking/${id}` : '#'} className={`w-full text-center block py-2 px-4 rounded font-medium ${availability
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`} onClick={(e) => !availability && e.preventDefault()}>
          {availability ? 'Book Now' : 'Not Available'}
        </Link>
      </div>
    </div>);
};
export default VehicleCard;
