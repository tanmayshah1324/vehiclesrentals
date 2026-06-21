import React, { useEffect, useRef, useState } from 'react';

// Helper to inject Leaflet CSS
const loadLeafletCSS = () => {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
};

// Helper to inject Leaflet JS
const loadLeafletJS = () => {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const MapComponent = ({ 
  lat, 
  lng, 
  zoom = 13, 
  markers = [], 
  route = null, 
  className = "h-[350px] w-full" 
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const leafletMarkersRef = useRef([]);
  const routePolylineRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load scripts on mount
  useEffect(() => {
    loadLeafletCSS();
    let isMounted = true;

    loadLeafletJS().then((success) => {
      if (success && isMounted) {
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const L = window.L;
    if (!L) return;

    // Fix default marker icon issues in Leaflet with bundlers
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Create map instance if it doesn't exist
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([lat, lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    } else {
      // Pan to new coordinates when center updates
      mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
    }

    const map = mapInstance.current;

    // Clear old markers
    leafletMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    leafletMarkersRef.current = [];

    // Add new markers
    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;
      
      let markerOptions = {};
      
      // If a custom marker color is specified, we can use a custom HTML divIcon
      if (m.color) {
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${m.color}" class="w-8 h-8 filter drop-shadow">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        `;
        markerOptions.icon = L.divIcon({
          html: svgIcon,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
      }

      const marker = L.marker([m.lat, m.lng], markerOptions).addTo(map);
      
      if (m.popupText) {
        marker.bindPopup(m.popupText);
        // Automatically open popup if requested
        if (m.openPopup) {
          marker.openPopup();
        }
      }
      leafletMarkersRef.current.push(marker);
    });

    // Draw route polyline if provided
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (route && route.length > 0) {
      routePolylineRef.current = L.polyline(route, {
        color: '#3B82F6', // Blue-500
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 10'
      }).addTo(map);
    }

  }, [isLoaded, lat, lng, zoom, markers, route]);

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-inner bg-gray-100 dark:bg-gray-800 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 z-10 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium">Loading Interactive Map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '100%' }} />
    </div>
  );
};

export default MapComponent;
