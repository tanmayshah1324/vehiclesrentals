import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
const ContactPage = () => {
    useEffect(() => {
        document.title = 'Contact Us - TSWheels';
        window.scrollTo(0, 0);
    }, []);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success('Message sent successfully! We\'ll get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };
    return (<div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="container relative px-4 mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl" data-aos="fade-up">
            Get In <span className="text-orange-400">Touch</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-blue-100" data-aos="fade-up" data-aos-delay="100">
            Have questions about our rental services? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4" data-aos="fade-up">
            {[
            { icon: <MapPin className="w-6 h-6"/>, title: 'Visit Us', info: 'Medicaps University, Pigdamber, Indore, 453331', color: 'text-blue-600 dark:text-blue-400' },
            { icon: <Phone className="w-6 h-6"/>, title: 'Call Us', info: '+91 123456789', color: 'text-green-600 dark:text-green-400' },
            { icon: <Mail className="w-6 h-6"/>, title: 'Email Us', info: 'info@TSwheels.com', color: 'text-orange-500' },
            { icon: <Clock className="w-6 h-6"/>, title: 'Business Hours', info: 'Mon-Fri: 9am-8pm\nSat-Sun: 10am-6pm', color: 'text-purple-600 dark:text-purple-400' },
        ].map((c, i) => (<div key={i} className="p-6 text-center bg-white rounded-xl shadow-lg dark:bg-gray-800">
                <div className={`flex justify-center mb-3 ${c.color}`}>{c.icon}</div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">{c.info}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <div data-aos="fade-right">
              <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                Send Us a <span className="text-blue-600 dark:text-blue-400">Message</span>
              </h2>
              <div className="w-20 h-1 mb-6 bg-orange-500 rounded-full"></div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                    <input id="contact-name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                    <input id="contact-email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <select id="contact-subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a topic</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
                  <textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                </div>

                <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-8 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? 'Sending...' : <><Send className="w-4 h-4 mr-2"/> Send Message</>}
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div data-aos="fade-left">
              <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                <span className="text-orange-500">FAQ</span>
              </h2>
              <div className="w-20 h-1 mb-6 bg-blue-600 rounded-full"></div>
              <div className="space-y-4">
                {[
            { q: 'What documents do I need to rent a vehicle?', a: 'You need a valid driver\'s license (held for at least 1 year), a photo ID (Passport or National ID), and a credit card in your name.' },
            { q: 'Is insurance included in the rental?', a: 'Yes! Basic insurance coverage is included with every rental. We also offer premium coverage options for additional peace of mind.' },
            { q: 'Can I cancel my booking?', a: 'Free cancellation up to 24 hours before pickup. Within 24 hours, a 50% charge of one day rental applies.' },
            { q: 'Do you offer delivery and pickup?', a: 'Yes, we offer delivery and pickup services starting from ₹15. Contact us for availability in your area.' },
            { q: 'What is the minimum age requirement?', a: 'Minimum age is 21 years (25 years for premium vehicles). Valid driving license is mandatory.' },
        ].map((faq, i) => (<div key={i} className="p-5 bg-gray-50 rounded-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start">
                      <MessageSquare className="w-5 h-5 mt-0.5 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0"/>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{faq.q}</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                      </div>
                    </div>
                  </div>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="mb-8 text-center" data-aos="fade-up">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Find <span className="text-blue-600 dark:text-blue-400">Us</span>
            </h2>
            <div className="w-20 h-1 mx-auto mb-4 bg-orange-500 rounded-full"></div>
            <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-400">
              Visit us at Medicaps University, Pigdamber, Indore. We're easily accessible and always happy to meet you in person.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700" data-aos="fade-up" data-aos-delay="100">
            <iframe title="TSWheels Location - Medicaps University, Indore" src="https://maps.google.com/maps?q=Medi-Caps+University+Indore&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full dark:invert-[0.85] dark:hue-rotate-180"/>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8" data-aos="fade-up" data-aos-delay="200">
            <a href="https://www.google.com/maps/search/Medicaps+University+Indore" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <MapPin className="w-5 h-5 mr-2"/> Open in Google Maps
            </a>
            <a href="tel:+91123456789" className="inline-flex items-center px-6 py-3 font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 dark:bg-gray-900 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-800 transition-colors">
              <Phone className="w-5 h-5 mr-2"/> Call for Directions
            </a>
          </div>
        </div>
      </section>
    </div>);
};
export default ContactPage;
