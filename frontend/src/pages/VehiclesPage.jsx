import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleFilters from '../components/vehicles/VehicleFilters';
import { Car, Bike, Search } from 'lucide-react';
import { apiService } from '../services/apiService';
const VehiclesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    // Determine type from search param OR path
    const getInitialType = () => {
        const typeParam = searchParams.get('type');
        if (typeParam)
            return typeParam;
        if (location.pathname.includes('/cars'))
            return 'car';
        if (location.pathname.includes('/bikes'))
            return 'bike';
        return 'all';
    };
    const type = getInitialType();
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const seating = searchParams.get('seating') || '';
    const rentalType = searchParams.get('rentalType') || '';
    const handleTypeChange = (newType) => {
        const newParams = new URLSearchParams(searchParams);
        if (newType === 'all') {
            newParams.delete('type');
        }
        else {
            newParams.set('type', newType);
        }
        setSearchParams(newParams);
    };
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.vehicles.getAll();
            setVehicles(data);
            setLoading(false);
        }
        catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Could not connect to the database. Please verify your connection.');
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchVehicles();
    }, []);
    const filteredVehicles = vehicles.filter((vehicle) => {
        // Filter by type
        if (type !== 'all' && vehicle.type?.toLowerCase() !== type?.toLowerCase()) {
            return false;
        }
        // Filter by brand
        if (brand && vehicle.brand !== brand) {
            return false;
        }
        // Filter by price range
        if (minPrice && vehicle.price.daily < parseInt(minPrice)) {
            return false;
        }
        if (maxPrice && vehicle.price.daily > parseInt(maxPrice)) {
            return false;
        }
        // Filter by rental type availability
        if (rentalType) {
            if (rentalType === 'hourly' && !vehicle.price.hourly)
                return false;
            if (rentalType === 'daily' && !vehicle.price.daily)
                return false;
            if (rentalType === 'weekly' && !vehicle.price.weekly)
                return false;
        }
        // Filter by seating capacity
        if (seating) {
            const seats = vehicle.specifications.seats || 0;
            if (seating === '7') {
                if (seats < 7)
                    return false;
            }
            else if (seats !== parseInt(seating)) {
                return false;
            }
        }
        // Filter by search query
        if (searchQuery && !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });
    return (<div className="container px-4 py-12 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        {type === 'car' ? 'Cars' : type === 'bike' ? 'Bikes' : 'All Vehicles'}
      </h1>

      <div className="mb-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400"/>
            </div>
            <input type="text" placeholder="Search by name or brand..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"/>
          </div>
          
          <div className="flex space-x-2">
            <button onClick={() => handleTypeChange('all')} className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${type === 'all' || !type
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
              All
            </button>
            <button onClick={() => handleTypeChange('car')} className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${type === 'car'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
              <Car className="w-4 h-4 mr-1"/> Cars
            </button>
            <button onClick={() => handleTypeChange('bike')} className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${type === 'bike'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
              <Bike className="w-4 h-4 mr-1"/> Bikes
            </button>
          </div>
        </div>
      </div>

      <VehicleFilters />

      {loading ? (<div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>) : error ? (<div className="py-12 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 px-4">
          <h3 className="mb-2 text-xl font-medium text-red-700 dark:text-red-400">
            Connection Error
          </h3>
          <p className="text-red-600 dark:text-red-300 max-w-md mx-auto mb-6">
            {error}
          </p>
          <button onClick={fetchVehicles} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold">
            Try Again
          </button>
        </div>) : filteredVehicles.length === 0 ? (<div className="py-12 text-center">
          <h3 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-300">
            {type === 'car' ? 'No Cars Available' : type === 'bike' ? 'No Bikes Available' : 'No vehicles found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or search criteria
          </p>
        </div>) : (<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVehicles.map((vehicle) => (<VehicleCard key={vehicle.id} vehicle={vehicle}/>))}
        </div>)}
    </div>);
};
export default VehiclesPage;
