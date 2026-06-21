import React, { useEffect } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import FeaturedVehicles from '../components/home/FeaturedVehicles';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import AdBanner from '../components/common/AdBanner';
const HomePage = () => {
    useEffect(() => {
        document.title = 'TSWheels - Premium Vehicle Rentals';
    }, []);
    return (<div>
      <HeroBanner />
      <FeaturedVehicles />
      <div className="container mx-auto px-4 py-8">
        <AdBanner type="horizontal"/>
      </div>
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </div>);
};
export default HomePage;
