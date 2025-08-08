import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useWebSocketActions } from '../hooks/useWebSocketActions';
import { useChatStore } from '../store/chatStore';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { sendChat } = useWebSocketActions();
  const { addMessage, myH3 } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !myH3 || isSending) return;

    setIsSending(true);
    
    // Add message to local state immediately for better UX
    addMessage({
      type: 'chat',
      id: 'local',
      name: 'You',
      text: trimmedMessage,
      h3: myH3,
      ts: Date.now()
    });

    // Send to server
    sendChat(trimmedMessage);
    
    // Clear input
    setMessage('');
    
    // Small delay to show sending state
    setTimeout(() => {
      setIsSending(false);
      inputRef.current?.focus();
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="border-t border-gray-200 pt-4"
    >
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            disabled={!myH3 || isSending}
            maxLength={500}
          />
        </div>
        
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!message.trim() || !myH3 || isSending}
          className={`p-3 rounded-xl transition-all ${
            message.trim() && myH3 && !isSending
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <motion.div
            animate={isSending ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Press Enter to send</span>
        <span>{message.length}/500</span>
      </div>
    </motion.form>
  );
};