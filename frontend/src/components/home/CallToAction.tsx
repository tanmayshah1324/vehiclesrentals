import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 bg-blue-600 dark:bg-blue-800">
      <div 
        className="container px-4 mx-auto text-center"
        data-aos="fade-up"
      >
        <h2 className="mb-6 text-3xl font-bold text-white">
          Ready to Hit the Road?
        </h2>
        
        <p className="max-w-3xl mx-auto mb-8 text-lg text-blue-100">
          Book your ideal vehicle today and enjoy the freedom of the open road with TSWheels. 
          Special discounts available for weekly rentals!
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            to="/vehicles" 
            className="px-8 py-3 font-medium text-blue-600 transition-colors bg-white rounded-md hover:bg-blue-50"
          >
            Browse Vehicles
          </Link>
          
          <a 
            href="tel:+91 1234567890" 
            className="flex items-center justify-center px-8 py-3 font-medium text-white transition-colors border-2 border-white rounded-md hover:bg-white/10"
          >
            <PhoneCall className="w-5 h-5 mr-2" /> Call Us: +91 1234567890
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;