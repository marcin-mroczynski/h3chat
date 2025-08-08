import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedPosition: LatLng | null;
  setSelectedPosition: (pos: LatLng | null) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ 
  onLocationSelect, 
  selectedPosition, 
  setSelectedPosition 
}) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setSelectedPosition(e.latlng);
      onLocationSelect(lat, lng);
    },
  });

  return selectedPosition ? <Marker position={selectedPosition} /> : null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat = 50.0647, // Warsaw coordinates as default
  initialLng = 19.945
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(
    initialLat && initialLng ? new LatLng(initialLat, initialLng) : null
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedPosition(new LatLng(lat, lng));
    setIsLoadingAddress(true);
    
    try {
      // Reverse geocoding with Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setSelectedAddress(address);
    } catch (error) {
      console.error('Error fetching address:', error);
      setSelectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedPosition) {
      onLocationSelect(
        selectedPosition.lat, 
        selectedPosition.lng, 
        selectedAddress
      );
      onClose();
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Choose Your Location</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCurrentLocation}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Use Current Location
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
              <MapContainer
                center={[initialLat, initialLng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler
                  onLocationSelect={handleLocationSelect}
                  selectedPosition={selectedPosition}
                  setSelectedPosition={setSelectedPosition}
                />
              </MapContainer>
              
              {/* Instructions overlay */}
              <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <p className="text-sm text-gray-700">
                  <strong>Click anywhere on the map</strong> to select your location
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {selectedPosition && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Selected Location:</div>
                  <div className="text-sm text-gray-600">
                    {isLoadingAddress ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading address...
                      </div>
                    ) : (
                      selectedAddress || `${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)}`
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmLocation}
                  disabled={!selectedPosition}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedPosition
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirm Location
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};