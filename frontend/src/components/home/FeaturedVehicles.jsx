import React from 'react';
import { Link } from 'react-router-dom';
import VehicleCard from '../vehicles/VehicleCard';
import { ArrowRight } from 'lucide-react';
import { apiService } from '../../services/apiService';
const FeaturedVehicles = () => {
    const [vehicles, setVehicles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    React.useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await apiService.vehicles.getAll();
                setVehicles(data);
                setLoading(false);
            }
            catch (error) {
                console.error('Error fetching vehicles:', error);
                setError(true);
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);
    // Get 4 featured vehicles (2 cars and 2 bikes)
    const featuredVehicles = [
        ...vehicles.filter(v => v.type?.toLowerCase() === 'car' && v.availability).slice(0, 2),
        ...vehicles.filter(v => v.type?.toLowerCase() === 'bike' && v.availability).slice(0, 2)
    ];
    return (<section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-aos="fade-up">
            Featured Vehicles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            Discover our most popular and premium selections for your next journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="200">
          {loading ? (Array(4).fill(0).map((_, i) => (<div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>))) : error ? (<div className="col-span-full py-10 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
               <p className="text-gray-600 dark:text-gray-400">Backend server not found. Run <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run dev:all</code> to see vehicles.</p>
            </div>) : featuredVehicles.length === 0 ? (<div className="col-span-full py-10 text-center">
              <p className="text-gray-600 dark:text-gray-400">No available vehicles at the moment.</p>
            </div>) : (featuredVehicles.map((vehicle, index) => (<VehicleCard key={vehicle.id} vehicle={vehicle}/>)))}
        </div>
        
        <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="300">
          <Link to="/vehicles" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            View All Vehicles <ArrowRight className="ml-2 h-4 w-4"/>
          </Link>
        </div>
      </div>
    </section>);
};
export default FeaturedVehicles;
