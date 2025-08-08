import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, MapPinIcon, SignalIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '../store/chatStore';
import { BroadcastAreaMap } from './BroadcastAreaMap';

const radiusOptions = [
  { value: 0, label: 'Current Cell Only', icon: '📍', coverage: '~461m' },
  { value: 1, label: 'Immediate Neighbors', icon: '🔵', coverage: '~1.4km' },
  { value: 2, label: 'Extended Area', icon: '🟣', coverage: '~2.3km' },
  { value: 3, label: 'Wide Range', icon: '🔴', coverage: '~3.2km' },
];

export const ChatSidebar: React.FC = () => {
  const { 
    nearbyUsers, 
    clientId, 
    myH3, 
    radius, 
    setRadius,
    connected 
  } = useChatStore();

  const usersArray = Array.from(nearbyUsers.values());

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="font-semibold text-gray-800">Connection</h3>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Status: {connected ? '✅ Connected' : '❌ Disconnected'}</p>
          {myH3 && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              <span className="font-mono text-xs">{myH3}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Broadcast Range */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <SignalIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Broadcast Range</h3>
        </div>
        <div className="space-y-2">
          {radiusOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRadius(option.value)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                radius === option.value
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-800'
                  : 'bg-white/50 border border-gray-200 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{option.icon}</span>
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">Level {option.value} • {option.coverage}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Broadcast Area Visualization */}
        {myH3 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Coverage Area</h4>
            <BroadcastAreaMap height={150} className="w-full" />
          </div>
        )}
      </motion.div>

      {/* Nearby Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <UserGroupIcon className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">
            Nearby Users ({usersArray.length})
          </h3>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {usersArray.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-500 text-sm py-2"
              >
                No users nearby
              </motion.p>
            ) : (
              usersArray.map((user) => {
                const displayName = user.name || 'Unknown';
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {displayName} {user.id === clientId && '(You)'}
                      </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {user.h3}
                    </div>
                  </div>
                </motion.div>
              );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};