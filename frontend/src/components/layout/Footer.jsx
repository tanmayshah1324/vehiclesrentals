import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
const Footer = () => {
    return (<footer className="text-gray-300 bg-gray-900">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-orange-500"/>
              <span className="text-xl font-bold text-blue-400">
                TS<span className="text-orange-500">Wheels</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              TSWheels offers premium car and bike rentals for all your travel needs. 
              Whether it's a business trip, vacation, or weekend getaway, we have the perfect 
              vehicle for you.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 transition-colors hover:text-blue-400">
                <Facebook className="w-5 h-5"/>
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 transition-colors hover:text-blue-400">
                <Twitter className="w-5 h-5"/>
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 transition-colors hover:text-orange-500">
                <Instagram className="w-5 h-5"/>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 transition-colors hover:text-blue-500">
                <Linkedin className="w-5 h-5"/>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 transition-colors hover:text-blue-400">Home</Link>
              </li>
              <li>
                <Link to="/cars" className="text-gray-400 transition-colors hover:text-blue-400">Cars</Link>
              </li>
              <li>
                <Link to="/bikes" className="text-gray-400 transition-colors hover:text-blue-400">Bikes</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 transition-colors hover:text-blue-400">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 transition-colors hover:text-blue-400">Contact</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 transition-colors hover:text-blue-400">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 transition-colors hover:text-blue-400">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Vehicles */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Our Vehicles</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cars?brand=Toyota" className="text-gray-400 transition-colors hover:text-blue-400">Toyota</Link>
              </li>
              <li>
                <Link to="/cars?brand=Hyundai" className="text-gray-400 transition-colors hover:text-blue-400">Hyundai</Link>
              </li>
              <li>
                <Link to="/cars?brand=Maruti" className="text-gray-400 transition-colors hover:text-blue-400">Maruti</Link>
              </li>
              <li>
                <Link to="/bikes?brand=Royal+Enfield" className="text-gray-400 transition-colors hover:text-blue-400">Royal Enfield</Link>
              </li>
              <li>
                <Link to="/bikes?brand=KTM" className="text-gray-400 transition-colors hover:text-blue-400">KTM</Link>
              </li>
              <li>
                <Link to="/bikes?brand=Honda" className="text-gray-400 transition-colors hover:text-blue-400">Honda</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0"/>
                <span className="text-gray-400">Medicaps university, pigdamber, indore, 453331</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="flex-shrink-0 w-5 h-5 text-blue-400"/>
                <span className="text-gray-400">+91 123456789</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="flex-shrink-0 w-5 h-5 text-blue-400"/>
                <span className="text-gray-400">info@MUwheels.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="mb-2 font-medium text-white">Business Hours</h4>
              <p className="text-sm text-gray-400">Monday - Friday: 9am - 8pm</p>
              <p className="text-sm text-gray-400">Saturday - Sunday: 10am - 6pm</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-6 mt-10 text-sm text-gray-500 border-t border-gray-800 md:flex-row">
          <p>&copy; {new Date().getFullYear()} MUWheels. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4">
              <li>
                <Link to="/terms" className="transition-colors hover:text-blue-400">Terms</Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-blue-400">Privacy</Link>
              </li>
              <li>
                <Link to="/cookies" className="transition-colors hover:text-blue-400">Cookies</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>);
};
export default Footer;
