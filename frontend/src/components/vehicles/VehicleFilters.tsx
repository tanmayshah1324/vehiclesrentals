import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const VehicleFilters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract current filter values
  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSeating = searchParams.get('seating') || '';
  const currentRentalType = searchParams.get('rentalType') || '';

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = currentBrand || currentMinPrice || currentMaxPrice || currentSeating || currentRentalType;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow dark:bg-gray-800 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4 mr-1" /> Clear
            </button>
          )}
          
          <button 
            onClick={toggleExpand} 
            className="text-gray-500 md:hidden dark:text-gray-400"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${isExpanded || window.innerWidth >= 768 ? 'grid-cols-1 md:grid-cols-5' : 'hidden md:grid-cols-5'}`}>
        <div>
          <label 
            htmlFor="brand" 
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Brand
          </label>
          <select
            id="brand"
            value={currentBrand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Brands</option>
            <option value="Toyota">Toyota</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Tata">Tata</option>
            <option value="Maruti">Maruti</option>
            <option value="Mahindra">Mahindra</option>
            <option value="Royal Enfield">Royal Enfield</option>
            <option value="KTM">KTM</option>
            <option value="Honda">Honda</option>
            <option value="Yamaha">Yamaha</option>
            <option value="TVS">TVS</option>
          </select>
        </div>

        <div>
          <label 
            htmlFor="minPrice" 
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Min Price (₹/day)
          </label>
          <select
            id="minPrice"
            value={currentMinPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Min</option>
            <option value="50">₹50</option>
            <option value="100">₹100</option>
            <option value="200">₹200</option>
            <option value="500">₹500</option>
            <option value="800">₹800</option>
          </select>
        </div>

        <div>
          <label 
            htmlFor="maxPrice" 
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Max Price (₹/day)
          </label>
          <select
            id="maxPrice"
            value={currentMaxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Max</option>
            <option value="200">₹200</option>
            <option value="400">₹400</option>
            <option value="600">₹600</option>
            <option value="800">₹800</option>
            <option value="1200">₹1200</option>
          </select>
        </div>

        <div>
          <label 
            htmlFor="seating" 
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Seating Capacity
          </label>
          <select
            id="seating"
            value={currentSeating}
            onChange={(e) => handleFilterChange('seating', e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any</option>
            <option value="2">2 Seats</option>
            <option value="4">4 Seats</option>
            <option value="5">5 Seats</option>
            <option value="7">7+ Seats</option>
          </select>
        </div>

        <div>
          <label 
            htmlFor="rentalType" 
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Rental Type
          </label>
          <select
            id="rentalType"
            value={currentRentalType}
            onChange={(e) => handleFilterChange('rentalType', e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;