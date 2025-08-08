import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, PencilIcon } from '@heroicons/react/24/outline';

interface LocationPreviewProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  h3Index?: string;
  onEdit: () => void;
  className?: string;
}

export const LocationPreview: React.FC<LocationPreviewProps> = ({
  address,
  latitude,
  longitude,
  h3Index,
  onEdit,
  className = ""
}) => {
  const formatCoordinates = (lat?: number, lng?: number) => {
    if (lat === undefined || lng === undefined) return null;
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const shortenAddress = (addr: string) => {
    if (addr.length <= 60) return addr;
    const parts = addr.split(', ');
    if (parts.length > 2) {
      return `${parts[0]}, ${parts[1]}...`;
    }
    return addr.substring(0, 57) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <MapPinIcon className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">Current Location</h3>
            
            {address && (
              <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                {shortenAddress(address)}
              </p>
            )}
            
            <div className="space-y-1 text-xs text-gray-500">
              {formatCoordinates(latitude, longitude) && (
                <div className="flex items-center gap-1">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {formatCoordinates(latitude, longitude)}
                  </span>
                </div>
              )}
              
              {h3Index && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">H3:</span>
                  <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {h3Index}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
          title="Change location"
        >
          <PencilIcon className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Visual indicator */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Location active for H3 chat</span>
        </div>
      </div>
    </motion.div>
  );
};