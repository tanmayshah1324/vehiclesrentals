import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Bike, Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-orange-500" />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            TS<span className="text-orange-500">Wheels</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/cars" 
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
          >
            <Car className="h-4 w-4 mr-1" /> Cars
          </Link>
          <Link 
            to="/bikes" 
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
          >
            <Bike className="h-4 w-4 mr-1" /> Bikes
          </Link>
          <Link 
            to="/about" 
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  My Profile
                </Link>
                <Link 
                  to="/bookings" 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  My Bookings
                </Link>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors hidden md:block"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="p-2 md:hidden rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                TS<span className="text-orange-500">Wheels</span>
              </span>
            </Link>
            <button onClick={toggleMenu}>
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/cars" 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
            >
              <Car className="h-4 w-4 mr-1" /> Cars
            </Link>
            <Link 
              to="/bikes" 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
            >
              <Bike className="h-4 w-4 mr-1" /> Bikes
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>

            {user ? (
              <>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  My Profile
                </Link>
                <Link 
                  to="/bookings" 
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  My Bookings
                </Link>
                <button 
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 transition-colors flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                <Link 
                  to="/login" 
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="py-2 px-4 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-md transition-colors text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;