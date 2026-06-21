import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Award, Target, Clock, MapPin, Car, Bike, Star, ChevronRight, Heart } from 'lucide-react';
const AboutPage = () => {
    useEffect(() => {
        document.title = 'About Us - TSWheels';
        window.scrollTo(0, 0);
    }, []);
    return (<div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="container relative px-4 mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl" data-aos="fade-up">
            About <span className="text-orange-400">TSWheels</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-blue-100" data-aos="fade-up" data-aos-delay="100">
            Your trusted partner for premium vehicle rentals. Making every journey comfortable, safe, and memorable.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 -mt-10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-aos="fade-up">
            {[
            { icon: <Car className="w-8 h-8"/>, value: '500+', label: 'Vehicles' },
            { icon: <Users className="w-8 h-8"/>, value: '10,000+', label: 'Customers' },
            { icon: <MapPin className="w-8 h-8"/>, value: '25+', label: 'Cities' },
            { icon: <Star className="w-8 h-8"/>, value: '4.8', label: 'Rating' },
        ].map((s, i) => (<div key={i} className="p-6 text-center bg-white rounded-xl shadow-lg dark:bg-gray-800">
                <div className="flex justify-center mb-3 text-blue-600 dark:text-blue-400">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div data-aos="fade-right">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                Our <span className="text-blue-600 dark:text-blue-400">Story</span>
              </h2>
              <div className="w-20 h-1 mb-6 bg-orange-500 rounded-full"></div>
              <p className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                Founded at Medicaps University in Indore, TSWheels started with a simple idea — making reliable transportation accessible to everyone.
              </p>
              <p className="mb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Today, we offer an extensive fleet of cars and bikes, from budget-friendly options to luxury vehicles. Our commitment to quality and customer satisfaction remains at the heart of everything we do.
              </p>
              <Link to="/vehicles" className="inline-flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Explore Our Fleet <ChevronRight className="w-5 h-5 ml-1"/>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4" data-aos="fade-left">
              {[
            { icon: <Car className="w-10 h-10 mb-3 text-blue-600 dark:text-blue-400"/>, title: 'Premium Cars', desc: 'Sedans, SUVs & more', bg: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30' },
            { icon: <Bike className="w-10 h-10 mb-3 text-orange-500"/>, title: 'Two Wheelers', desc: 'Sports & Cruisers', bg: 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30', mt: true },
            { icon: <Shield className="w-10 h-10 mb-3 text-green-600 dark:text-green-400"/>, title: 'Fully Insured', desc: 'Peace of mind', bg: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30' },
            { icon: <Heart className="w-10 h-10 mb-3 text-purple-600 dark:text-purple-400"/>, title: '24/7 Support', desc: 'Always here to help', bg: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30', mt: true },
        ].map((c, i) => (<div key={i} className={`p-6 rounded-xl bg-gradient-to-br ${c.bg} ${c.mt ? 'mt-8' : ''}`}>
                  {c.icon}
                  <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{c.desc}</p>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center" data-aos="fade-up">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">What We <span className="text-blue-600 dark:text-blue-400">Stand For</span></h2>
            <div className="w-20 h-1 mx-auto mb-4 bg-orange-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
            { icon: <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400"/>, title: 'Safety First', desc: 'Rigorous inspections and sanitization before every rental.' },
            { icon: <Award className="w-10 h-10 text-orange-500"/>, title: 'Premium Quality', desc: 'Well-maintained, modern vehicles for a reliable experience.' },
            { icon: <Target className="w-10 h-10 text-green-600 dark:text-green-400"/>, title: 'Customer Focus', desc: '24/7 support and flexible rental options.' },
            { icon: <Clock className="w-10 h-10 text-purple-600 dark:text-purple-400"/>, title: 'Quick & Easy', desc: 'Book in minutes. No hidden fees, just drive.' },
        ].map((v, i) => (<div key={i} className="p-6 text-center bg-white rounded-xl shadow-md dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="flex justify-center mb-4">{v.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{v.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* Rental Contract/Agreement Section */}
      <section className="py-16 bg-blue-50 dark:bg-gray-800/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400"/>
              Standard <span className="text-blue-600 dark:text-blue-400 ml-2">Rental Contract</span>
            </h2>
            <div className="w-20 h-1 mb-8 bg-orange-500 rounded-full"></div>
            
            <div className="prose prose-blue dark:prose-invert max-w-none space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Eligibility & Verification</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Renter must be at least 21 years of age and possess a valid permanent driving license. Verification of identity (Aadhar/Passport) is mandatory before vehicle handover.</p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Security Deposit</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">A refundable security deposit of ₹500 is required for all rentals. This deposit will be refunded within 24 hours of vehicle return, subject to inspection for damages.</p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Fuel Policy</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Vehicles are provided with a minimum level of fuel. The renter must return the vehicle with the same level of fuel as at the time of pickup.</p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Usage & Responsibilities</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Vehicles should not be used for racing, commercial purposes, or off-roading (unless specified). The renter is responsible for any traffic violations or tolls incurred during the rental period.</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">By booking a vehicle, you agree to our full Terms and Conditions.</p>
              <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Download Full Contract PDF</button>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center" data-aos="fade-up">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Meet Our <span className="text-orange-500">Team</span></h2>
            <div className="w-20 h-1 mx-auto mb-4 bg-blue-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl mx-auto">
            {[
            { name: 'Tanmay Sharma', role: 'Founder & CEO', initial: 'TS' },
            { name: 'Rahul Verma', role: 'Head of Operations', initial: 'RV' },
            { name: 'Priya Patel', role: 'Customer Success', initial: 'PP' },
            { name: 'Amit Joshi', role: 'Fleet Manager', initial: 'AJ' },
        ].map((m, i) => (<div key={i} className="text-center" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-3 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">{m.initial}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{m.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{m.role}</p>
              </div>))}
          </div>
        </div>
      </section>
    </div>);
};
export default AboutPage;
