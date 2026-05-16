import React, { useEffect } from 'react';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, vehiclesRes] = await Promise.all([
          fetch('http://localhost:3001/bookings'),
          fetch('http://localhost:3001/vehicles')
        ]);
        const bookingsData = await bookingsRes.json();
        const vehiclesData = await vehiclesRes.json();
        setBookings(bookingsData);
        setVehicles(vehiclesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };
    fetchData();
    document.title = 'Admin Dashboard - TSWheels';
  }, []);

  const stats = [
    { id: 1, name: 'Total Bookings', value: bookings.length.toString() },
    { id: 2, name: 'Active Rentals', value: bookings.filter(b => b.status === 'confirmed').length.toString() },
    { id: 3, name: 'Available Vehicles', value: vehicles.filter(v => v.availability).length.toString() },
    { id: 4, name: 'Total Revenue', value: '₹' + bookings.reduce((acc, curr) => acc + parseFloat(curr.totalPrice), 0).toFixed(2) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</h2>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Recent Bookings</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {booking.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Customer #{booking.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{booking.vehicleName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.paymentMethod === 'upi' ? 'UPI' : 'Card'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {booking.startDate} - {booking.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Popular Vehicles</h2>
          
          <ul className="space-y-4">
            <li className="flex items-center">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">1</span>
              <span className="ml-3 flex-1">
                <span className="block font-medium text-gray-900 dark:text-white">Toyota Innova Crysta</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">42 bookings</span>
              </span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                94% Availability
              </span>
            </li>
            <li className="flex items-center">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">2</span>
              <span className="ml-3 flex-1">
                <span className="block font-medium text-gray-900 dark:text-white">Royal Enfield Classic 350</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">38 bookings</span>
              </span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                89% Availability
              </span>
            </li>
            <li className="flex items-center">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">3</span>
              <span className="ml-3 flex-1">
                <span className="block font-medium text-gray-900 dark:text-white">Hyundai Creta</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">35 bookings</span>
              </span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                76% Availability
              </span>
            </li>
            <li className="flex items-center">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">4</span>
              <span className="ml-3 flex-1">
                <span className="block font-medium text-gray-900 dark:text-white">KTM Duke 390</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">28 bookings</span>
              </span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                92% Availability
              </span>
            </li>
            <li className="flex items-center">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">5</span>
              <span className="ml-3 flex-1">
                <span className="block font-medium text-gray-900 dark:text-white">Mahindra Thar</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">26 bookings</span>
              </span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                65% Availability
              </span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Monthly Revenue</h2>
          
          <div className="h-60 flex items-end space-x-2">
            {[60, 85, 70, 92, 80, 95, 100, 110, 90, 105, 120, 95].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Annual Revenue</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">$142,856</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;