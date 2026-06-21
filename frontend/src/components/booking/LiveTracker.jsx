import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Navigation, Compass, BatteryCharging, Gauge } from 'lucide-react';
import MapComponent from '../common/MapComponent';

const ROUTE_POINTS = [
  [22.7214, 75.8066], // Airport
  [22.7195, 75.8150],
  [22.7161, 75.8202],
  [22.7135, 75.8340],
  [22.7125, 75.8450],
  [22.7155, 75.8580],
  [22.7177, 75.8682], // Railway Junction
  [22.7205, 75.8710],
  [22.7240, 75.8770],
  [22.7255, 75.8820],
  [22.7262, 75.8893]  // Palasia Hub
];

const LiveTracker = ({ booking, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [interpolationStep, setInterpolationStep] = useState(0); // 0 to 10
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(ROUTE_POINTS[0]);
  const [speed, setSpeed] = useState(54);
  const [fuel, setFuel] = useState(88);
  const [eta, setEta] = useState(15); // in minutes
  const [status, setStatus] = useState('En Route to Pickup');

  // Simulation tick
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setInterpolationStep((prevStep) => {
        if (prevStep >= 10) {
          // Move to next waypoint
          setCurrentIdx((prevIdx) => {
            if (prevIdx >= ROUTE_POINTS.length - 2) {
              setStatus('Arrived at Destination');
              setIsPlaying(false);
              setSpeed(0);
              return prevIdx;
            }
            setStatus('En Route');
            return prevIdx + 1;
          });
          return 0;
        }
        return prevStep + 1;
      });

      // Fluctuate speed slightly
      setSpeed((prevSpeed) => {
        if (status === 'Arrived at Destination') return 0;
        const change = Math.floor(Math.random() * 7) - 3;
        const newSpeed = prevSpeed + change;
        return Math.max(35, Math.min(newSpeed, 68));
      });

      // Slowly drain fuel
      setFuel((prevFuel) => Math.max(12, prevFuel - 0.05));

      // Decrease ETA slowly
      setEta((prevEta) => {
        if (prevEta <= 1) return 1;
        // Occasionally reduce ETA
        return Math.random() > 0.7 ? prevEta - 1 : prevEta;
      });

    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, status]);

  // Calculate interpolated position between ROUTE_POINTS[currentIdx] and ROUTE_POINTS[currentIdx + 1]
  useEffect(() => {
    const startPoint = ROUTE_POINTS[currentIdx];
    const endPoint = ROUTE_POINTS[currentIdx + 1] || startPoint;

    const t = interpolationStep / 10;
    const lat = startPoint[0] + t * (endPoint[0] - startPoint[0]);
    const lng = startPoint[1] + t * (endPoint[1] - startPoint[1]);

    setCurrentPosition([lat, lng]);
  }, [currentIdx, interpolationStep]);

  const toggleSimulation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && status === 'Arrived at Destination') {
      // Reset
      setCurrentIdx(0);
      setInterpolationStep(0);
      setFuel(88);
      setEta(15);
      setStatus('En Route to Pickup');
    }
  };

  // Markers to render
  const mapMarkers = [
    {
      lat: ROUTE_POINTS[0][0],
      lng: ROUTE_POINTS[0][1],
      popupText: 'Pickup Point: Airport Hub',
      color: '#EF4444' // Red
    },
    {
      lat: ROUTE_POINTS[ROUTE_POINTS.length - 1][0],
      lng: ROUTE_POINTS[ROUTE_POINTS.length - 1][1],
      popupText: 'Destination: Palasia Hub',
      color: '#10B981' // Green
    },
    {
      lat: currentPosition[0],
      lng: currentPosition[1],
      popupText: `${booking?.vehicleName || 'Vehicle'} - Current GPS Location`,
      color: '#3B82F6', // Blue
      openPopup: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px] border border-gray-100 dark:border-gray-700 animate-fadeIn">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-gray-900 dark:hover:text-white shadow-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Telemetry Dashboard Side Panel */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-wider uppercase mb-2">
              <Navigation className="h-4 w-4 animate-pulse" />
              <span>Live GPS Tracking</span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {booking?.vehicleName || 'Vehicle Rental'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Booking ID: #{booking?.id?.substring(0, 8) || 'N/A'}
            </p>

            <div className="space-y-4">
              {/* Status Indicator */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 block mb-1">Status</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">{status}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    status === 'Arrived at Destination' ? 'bg-green-500' : 'bg-blue-500 animate-ping'
                  }`} />
                </div>
              </div>

              {/* Grid of Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 flex items-center mb-1">
                    <Gauge className="h-3.5 w-3.5 mr-1 text-blue-500" />
                    Speed
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{speed} <span className="text-xs font-medium text-gray-400">km/h</span></span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 flex items-center mb-1">
                    <BatteryCharging className="h-3.5 w-3.5 mr-1 text-green-500" />
                    Fuel/Battery
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{fuel.toFixed(0)}%</span>
                </div>
              </div>

              {/* Destination/ETA */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 block mb-1">Estimated Arrival (ETA)</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {status === 'Arrived at Destination' ? '0' : eta} <span className="text-sm font-medium">mins</span>
                </span>
                <span className="text-xs text-gray-400 block mt-1">Destination: Palasia Rental Hub</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <button 
              onClick={toggleSimulation}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all ${
                isPlaying 
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Track</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>{status === 'Arrived at Destination' ? 'Restart GPS' : 'Resume GPS'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Map Side */}
        <div className="flex-1 h-full relative">
          <MapComponent 
            lat={currentPosition[0]} 
            lng={currentPosition[1]} 
            zoom={13} 
            markers={mapMarkers} 
            route={ROUTE_POINTS}
            className="w-full h-full"
          />
        </div>

      </div>
    </div>
  );
};

export default LiveTracker;
