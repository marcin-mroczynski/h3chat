import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Circle } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '../store/chatStore';
// @ts-ignore - h3-js doesn't have types
import * as h3 from 'h3-js';

// Fix for default markers in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BroadcastAreaMapProps {
  className?: string;
  height?: number;
  showFullscreenButton?: boolean;
}

interface H3CellData {
  h3Index: string;
  coordinates: LatLng[];
  isCenter: boolean;
}

export const BroadcastAreaMap: React.FC<BroadcastAreaMapProps> = ({
  className = "",
  height = 200,
  showFullscreenButton = true
}) => {
  const { myH3, radius, h3Resolution } = useChatStore();
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);
  const [h3Cells, setH3Cells] = useState<H3CellData[]>([]);
  const [mapKey, setMapKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate H3 cells and their boundaries
  useEffect(() => {
    if (!myH3) {
      setH3Cells([]);
      setMapCenter(null);
      return;
    }

    try {
      // Get center coordinates for the main H3 cell
      const centerCoords = h3.cellToLatLng(myH3);
      const center = new LatLng(centerCoords[0], centerCoords[1]);
      setMapCenter(center);

      // Get all cells in the broadcast range
      const ringCells = h3.gridDisk(myH3, radius);
      
      const cellsData: H3CellData[] = ringCells.map((cellId: string) => {
        const cellBoundary = h3.cellToBoundary(cellId, true); // true for GeoJSON format
        const coordinates = cellBoundary.map((coord: [number, number]) => 
          new LatLng(coord[1], coord[0]) // FIXED: swap lat/lng order!
        );
        
        return {
          h3Index: cellId,
          coordinates,
          isCenter: cellId === myH3
        };
      });

      setH3Cells(cellsData);
      console.log(`[DEBUG] Generated ${cellsData.length} H3 cells for radius ${radius}:`, cellsData);
      // Force map re-render when data changes
      setMapKey(prev => prev + 1);
    } catch (error) {
      console.error('Error calculating H3 cells:', error);
      setH3Cells([]);
      setMapCenter(null);
    }
  }, [myH3, radius, h3Resolution]);

  if (!myH3 || !mapCenter) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
        <p className="text-sm text-gray-500">No location set</p>
      </div>
    );
  }

  // Calculate zoom level based on radius - adjusted for better fit
  const getZoomLevel = (radiusLevel: number) => {
    switch (radiusLevel) {
      case 0: return 15;  // Single cell - close enough to see circle
      case 1: return 13;  // 7 cells - medium zoom
      case 2: return 12;  // 19 cells - wider zoom
      case 3: return 11;  // 37 cells - widest zoom
      default: return 13;
    }
  };

  // Get colors for different radius levels
  const getRadiusColor = (radiusLevel: number) => {
    const colors = {
      0: '#3b82f6', // blue
      1: '#8b5cf6', // purple  
      2: '#ec4899', // pink
      3: '#ef4444', // red
    };
    return colors[radiusLevel as keyof typeof colors] || '#6b7280';
  };

  const radiusColor = getRadiusColor(radius);

  // Get lighter color for neighbor cells
  const getNeighborColor = (mainColor: string) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': '#93c5fd', // blue -> light blue
      '#8b5cf6': '#c4b5fd', // purple -> light purple  
      '#ec4899': '#f9a8d4', // pink -> light pink
      '#ef4444': '#fca5a5', // red -> light red
    };
    return colorMap[mainColor] || '#9ca3af';
  };

  // Common map content
  const renderMapContent = (isFullscreenMode: boolean) => (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.8}
      />
      
      {/* Render H3 cell boundaries - actual hexagons */}
      {h3Cells.map((cell) => {
        const isCenter = cell.isCenter;
        const neighborColor = getNeighborColor(radiusColor);
        
        return (
          <Polygon
            key={cell.h3Index}
            positions={cell.coordinates}
            pathOptions={{
              color: isCenter ? radiusColor : neighborColor,
              fillColor: isCenter ? radiusColor : neighborColor,
              fillOpacity: isCenter ? 0.4 : 0.2,
              weight: isCenter ? 3 : 2,
              opacity: isCenter ? 0.9 : 0.7,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        );
      })}
      
      {/* Center marker */}
      <Marker position={mapCenter!} />
    </>
  );

  return (
    <>
      {/* Mini map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`broadcast-area-map ${className} rounded-lg overflow-hidden shadow-md border border-gray-200 relative`}
        style={{ height }}
      >
        <MapContainer
          key={`mini-${mapKey}`}
          center={mapCenter}
          zoom={getZoomLevel(radius)}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          {renderMapContent(false)}
        </MapContainer>
        
        {/* Fullscreen button */}
        {showFullscreenButton && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors z-10"
            title="Expand to fullscreen"
          >
            <ArrowsPointingOutIcon className="w-4 h-4 text-gray-600" />
          </motion.button>
        )}
      
      {/* Enhanced legend */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: radiusColor }}
            />
            <span>Level {radius}</span>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-500 shadow-sm">
          <span>{h3Cells.length} hexagons</span>
        </div>
      </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden relative"
              style={{ maxWidth: '95vw', maxHeight: '95vh' }}
            >
              {/* Header */}
              <div className="absolute top-4 right-4 z-30">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFullscreen(false)}
                  className="p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Fullscreen Map */}
              <div className="h-full">
                <MapContainer
                  key={`fullscreen-${mapKey}`}
                  center={mapCenter!}
                  zoom={getZoomLevel(radius)}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                  attributionControl={true}
                  dragging={true}
                  scrollWheelZoom={true}
                  doubleClickZoom={true}
                  touchZoom={true}
                >
                  {renderMapContent(true)}
                </MapContainer>
              </div>
              
              {/* Info overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-30">
                <div className="text-sm text-gray-700">
                  Level {radius} • {h3Cells.length} hexagons
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

