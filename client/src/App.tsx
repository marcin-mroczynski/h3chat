import { ChatLayout } from './components/ChatLayout';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  // Initialize WebSocket connection once at the app level
  useWebSocket();
  
  return (
    <div className="min-h-screen">
      <ChatLayout />
    </div>
  );
}

export default App;
