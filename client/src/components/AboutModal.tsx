import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative glass rounded-2xl max-w-2xl w-full mx-auto p-6 shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 id="about-title" className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">O aplikacji – H3 Local Chat</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors" aria-label="Zamknij">
                ✕
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 space-y-3 overflow-y-auto max-h-[65vh] pr-2">
              <p>
                H3 Local Chat łączy Cię z osobami w Twojej najbliższej okolicy – sąsiadami,
                uczestnikami wydarzeń, ludźmi z tej samej dzielnicy. Wybierz lokalizację, ustaw
                zasięg nadawania i rozmawiaj „tu i teraz”.
              </p>
              <p>
                Twoja prywatność jest dla nas ważna – udostępniamy wyłącznie informację o heksagonie H3,
                nie dokładne koordynaty GPS.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Rozmowy lokalne:</strong> pytania do sąsiadów, polecenia miejsc, aktualności z okolicy.</li>
                <li><strong>Interaktywna mapa:</strong> wybór lokalizacji i wizualizacja zasięgu heksagonów.</li>
                <li><strong>Wybór zasięgu:</strong> od najbliższego heksagonu do szerszego obszaru (0–3 pierścienie).</li>
                <li><strong>Czat na żywo:</strong> błyskawiczne wiadomości dzięki WebSocket.</li>
                <li><strong>Prosty start:</strong> wpisz nick, wybierz miejsce i pisz – bez rejestracji.</li>
              </ul>
              <p className="text-gray-600">
                Przykłady: życie osiedla, eventy i festiwale, kampusy, lokalne ostrzeżenia czy polecenia miejsc.
              </p>
              <p className="text-gray-600">
                Planujemy: emoji i reakcje, powiadomienia, tryb jasny/ciemny, PWA, wyszukiwanie wiadomości.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


