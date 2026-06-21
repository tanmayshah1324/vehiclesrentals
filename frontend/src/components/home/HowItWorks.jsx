import React from 'react';
import { Calendar, MapPin, Car, CheckCircle } from 'lucide-react';
const HowItWorks = () => {
    const steps = [
        {
            icon: <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400"/>,
            title: 'Choose Your Dates',
            description: 'Select your pickup and return dates from our simple booking calendar.'
        },
        {
            icon: <Car className="h-12 w-12 text-blue-600 dark:text-blue-400"/>,
            title: 'Select Vehicle',
            description: 'Browse our fleet of cars and bikes, filter by type, and choose your ideal ride.'
        },
        {
            icon: <MapPin className="h-12 w-12 text-blue-600 dark:text-blue-400"/>,
            title: 'Pickup Location',
            description: 'Choose a convenient pickup location from our multiple service points.'
        },
        {
            icon: <CheckCircle className="h-12 w-12 text-blue-600 dark:text-blue-400"/>,
            title: 'Confirm & Pay',
            description: 'Complete your booking with our secure payment system and receive confirmation.'
        }
    ];
    return (<section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-aos="fade-up">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            Renting a vehicle with TSWheels is quick and simple
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" data-aos="fade-up" data-aos-delay="200">
          {steps.map((step, index) => (<div key={index} className="relative bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md text-center">
              {index < steps.length - 1 && (<div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-4xl text-gray-300 dark:text-gray-700">
                  →
                </div>)}
              
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>))}
        </div>
      </div>
    </section>);
};
export default HowItWorks;
