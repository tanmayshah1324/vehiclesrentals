import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Bike } from 'lucide-react';

const HeroBanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'car' | 'bike'>('car');

  return (
    <div className="relative overflow-hidden bg-blue-900">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/3422964/pexels-photo-3422964.jpeg" 
          alt="Hero Background" 
          className="object-cover w-full h-full opacity-40"
        />
      </div>

      <div className="container relative z-10 px-4 py-16 mx-auto text-center text-white md:py-32">
        <h1 
          className="mb-6 text-3xl font-bold md:text-5xl"
          data-aos="fade-down"
          data-aos-duration="1000"
        >
          Unlock Your Journey with <span className="text-orange-500">TS</span>Wheels
        </h1>
        
        <p 
          className="max-w-3xl mx-auto mb-10 text-lg md:text-xl opacity-90"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          Premium cars and bikes for your travel needs. Experience comfort, style, and freedom on the road.
        </p>
        
        <div 
          className="inline-flex max-w-3xl p-1 mx-auto mb-8 rounded-lg bg-white/10 backdrop-blur-md"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="400"
        >
          <button
            onClick={() => setActiveTab('car')}
            className={`py-3 px-6 rounded-md flex items-center justify-center transition-colors ${
              activeTab === 'car'
                ? 'bg-white text-blue-900 font-medium'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Car className="w-5 h-5 mr-2" /> Cars
          </button>
          <button
            onClick={() => setActiveTab('bike')}
            className={`py-3 px-6 rounded-md flex items-center justify-center transition-colors ${
              activeTab === 'bike'
                ? 'bg-white text-blue-900 font-medium'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Bike className="w-5 h-5 mr-2" /> Bikes
          </button>
        </div>
        
        <div 
          className="grid max-w-3xl grid-cols-1 gap-4 mx-auto md:grid-cols-2"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="500"
        >
          <Link 
            to={activeTab === 'car' ? '/cars' : '/bikes'}
            className="flex items-center justify-center px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Browse All {activeTab === 'car' ? 'Cars' : 'Bikes'} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <Link 
            to="/vehicles"
            className="flex items-center justify-center px-6 py-3 font-medium text-blue-900 transition-colors bg-white rounded-md hover:bg-gray-100"
          >
            Special Offers <span className="ml-1 text-orange-500">↗</span>
          </Link>
        </div>
      </div>
      
      {/* Wave shape divider */}
      <div className="absolute bottom-0 left-0 right-0 text-white dark:text-gray-900">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-current">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroBanner;