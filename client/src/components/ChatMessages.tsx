import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types';

const MessageBubble: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className="text-center py-2"
      >
        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
          {message.text}
        </span>
      </motion.div>
    );
  }

  const isCurrentUser = message.name === 'You';
  const displayName = message.name || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : ''}`}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{displayName}</span>
            <span className="text-xs text-gray-400">
              {new Date(message.ts).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
        
        <div
          className={`p-3 rounded-2xl ${
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          {isCurrentUser && (
            <div className="text-xs text-blue-100 mt-1 text-right">
              {new Date(message.ts).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ChatMessages: React.FC = () => {
  const { messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto mb-4 pr-2">
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble 
              key={`${message.ts}-${index}`} 
              message={message} 
              index={index}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-full text-gray-500"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">Welcome to H3 Local Chat!</p>
            <p className="text-sm">Start a conversation with people in your area</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};