import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Business Traveler',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    rating: 5,
    text: 'MUWheels made my business trip so convenient. The car was clean, well-maintained, and the booking process was seamless. Highly recommended!'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Weekend Explorer',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    rating: 4,
    text: 'Rented a bike for a weekend trip. Great condition, fair pricing, and the staff was incredibly helpful. Will definitely use their service again.'
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Family Vacationer',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    rating: 5,
    text: 'Our family vacation was enhanced by the spacious SUV we rented from TSWheels. The vehicle was perfect for our needs and the booking process was straightforward.'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <div className="mb-12 text-center">
          <h2 
            className="mb-4 text-3xl font-bold text-gray-900 dark:text-white"
            data-aos="fade-up"
          >
            What Our Customers Say
          </h2>
          <p 
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Don't just take our word for it – here's what customers think about our rental service
          </p>
        </div>
        
        <div 
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="p-6 rounded-lg shadow-md bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="object-cover w-12 h-12 mr-4 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;