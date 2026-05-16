import React from 'react';
import { ExternalLink, Sparkles, X } from 'lucide-react';

interface AdBannerProps {
  type?: 'horizontal' | 'vertical' | 'square';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ type = 'horizontal', className = '' }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [ads, setAds] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('http://localhost:3001/ads');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data && data.length > 0) {
          setAds(data);
        }
      } catch (error) {
        console.error('Error fetching ads, using fallback:', error);
        // Fallback ads in case server is down
        setAds([
          {
            id: 'f1',
            title: 'Premium Rental Experience',
            description: 'Choose from our wide range of premium vehicles for your next journey.',
            image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
            color: 'from-blue-600 to-indigo-700',
            link: '/vehicles'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (!isVisible || loading || ads.length === 0) return null;

  // Pick an ad based on current time to avoid random flickering on re-renders
  const adIndex = Math.floor(Date.now() / 10000) % ads.length;
  const ad = ads[adIndex];

  if (type === 'horizontal') {
    return (
      <div className={`relative group overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r ${ad.color} text-white ${className}`}>
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            title="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
            <img 
              src={ad.image} 
              alt={ad.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-8 md:w-2/3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-xs font-bold tracking-widest uppercase text-blue-100">Sponsored</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
            <p className="text-blue-50 mb-6 max-w-lg">{ad.description}</p>
            <button className="px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
              {ad.cta || 'Learn More'} <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden rounded-xl shadow-md bg-gradient-to-br ${ad.color} text-white p-6 ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-100">Sponsored</span>
      </div>
      
      <img 
        src={ad.image} 
        alt={ad.title} 
        className="w-full h-32 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-500"
      />
      
      <h3 className="text-lg font-bold mb-1">{ad.title}</h3>
      <p className="text-sm text-blue-50 mb-4">{ad.description}</p>
      <button className="w-full py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
        {ad.cta || 'Learn More'}
      </button>
    </div>
  );
};

export default AdBanner;
