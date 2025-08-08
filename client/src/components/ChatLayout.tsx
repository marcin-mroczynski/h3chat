import React from 'react';
import { motion } from 'framer-motion';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { LocationSetup } from './LocationSetup';
import { useChatStore } from '../store/chatStore';

export const ChatLayout: React.FC = () => {
  const { myH3 } = useChatStore();

  if (!myH3) {
    return <LocationSetup />;
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            H3 Local Chat
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mt-2"
          >
            Chat with people in your geographical neighborhood
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <ChatSidebar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 glass rounded-2xl p-6 flex flex-col"
          >
            <ChatMessages />
            <ChatInput />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};