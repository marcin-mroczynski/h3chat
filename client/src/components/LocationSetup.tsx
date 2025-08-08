import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '../store/chatStore';
import { useWebSocketActions } from '../hooks/useWebSocketActions';
import { LocationPicker } from './LocationPicker';
import { AddressSearch } from './AddressSearch';
import { LocationPreview } from './LocationPreview';
// @ts-ignore - h3-js doesn't have types
import * as h3 from 'h3-js';

export const LocationSetup: React.FC = () => {
  const { nickname, setNickname, setMyH3, myH3, h3Resolution } = useChatStore();
  const { sendJoin, sendPresence } = useWebSocketActions();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    const h3Index = h3.latLngToCell(lat, lng, h3Resolution);
    
    console.log(`[DEBUG] Location: lat=${lat}, lng=${lng}, H3=${h3Index}`);
    
    setSelectedLocation({ lat, lng, address });
    setMyH3(h3Index);
    // Pass h3Index directly to avoid React state delay
    sendJoin(h3Index);
    sendPresence(h3Index);
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude, 'Current GPS location');
      },
      (error) => {
        alert(`Geolocation error: ${error.message}`);
      },
      { enableHighAccuracy: false }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GlobeAltIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">H3 Local Chat</h1>
          <p className="text-gray-600">
            Connect with people in your geographical neighborhood
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your nickname..."
            />
          </div>

          {/* Location Selection */}
          {myH3 && selectedLocation ? (
            <LocationPreview
              address={selectedLocation.address}
              latitude={selectedLocation.lat}
              longitude={selectedLocation.lng}
              h3Index={myH3}
              onEdit={() => {
                setMyH3(null);
                setSelectedLocation(null);
              }}
            />
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Your Location
                </label>
                <AddressSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search for your address or location..."
                />
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareLocation}
                  className="flex-1 bg-blue-100 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPinIcon className="w-4 h-4" />
                  Use GPS
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="flex-1 bg-green-100 text-green-700 py-3 px-4 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Pick on Map
                </motion.button>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            We use your location to determine which H3 hexagonal cell you're in. 
            This enables local chat with nearby users while protecting your privacy.
          </p>
        </motion.div>
      </motion.div>
      
      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
};