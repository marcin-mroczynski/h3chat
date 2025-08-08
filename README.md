# 🗺️ H3 Local Chat

A modern geolocation-based chat application using H3 hexagonal indexing system. Users can chat with people in their geographical neighborhood based on H3 cell proximity.

## ✨ Features

- **🔷 H3 Geolocation System** - Precise hexagonal cell-based location matching
- **🗺️ Interactive Maps** - Leaflet.js with OpenStreetMap integration
- **📍 Location Selection** - GPS, address search, or map picking
- **📡 Broadcast Visualization** - See exact H3 hexagon coverage areas
- **💬 Real-time Chat** - WebSocket-based instant messaging
- **🎨 Modern UI** - Glassmorphism design with Tailwind CSS v4
- **📱 Responsive** - Works on desktop and mobile devices

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install
cd client && npm install

# Start backend server
npm run dev

# Start frontend (in another terminal)
npm run dev:client

# Or start both simultaneously
npm run dev:both
```

Visit: http://localhost:5173

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm run start:prod
```

## 🌐 Deployment

### Automatic Deployment (Recommended)

1. **Fork/Clone this repository**
2. **Deploy Backend to Railway:**
   - Connect your GitHub repo to Railway
   - Railway will auto-detect Node.js and deploy
   - Note your Railway URL (e.g., `https://your-app.railway.app`)

3. **Configure GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "GitHub Actions" as source
   - Update `.github/workflows/deploy.yml` with your Railway URL

4. **Push to main branch** - automatic deployment will trigger!

### Manual Deployment

#### Backend (Railway/Render/Heroku)
```bash
# Railway
railway login
railway link
railway up

# Or use any Node.js hosting service
```

#### Frontend (GitHub Pages/Netlify/Vercel)
```bash
# Build with production WebSocket URL
cd client
VITE_WEBSOCKET_URL=https://your-backend.railway.app npm run build

# Deploy dist/ folder to your static hosting
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + Express + WebSocket
- **h3-js** - H3 geospatial indexing
- **nanoid** - Unique ID generation

### Frontend
- **React 18** + TypeScript + Vite
- **Tailwind CSS v4** + Glassmorphism design
- **Framer Motion** - Smooth animations
- **Leaflet.js** + React-Leaflet - Interactive maps
- **Zustand** - State management
- **H3.js** - Client-side H3 operations

## 📁 Project Structure

```
h3chat/
├── server.js                 # WebSocket server
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── store/            # Zustand store
│   │   └── types.ts          # TypeScript definitions
│   └── package.json
├── .github/workflows/        # GitHub Actions
└── CLAUDE.md                 # Development guide
```

## 🔧 Configuration

### Environment Variables

**Client (`.env`):**
```env
VITE_WEBSOCKET_URL=https://your-backend.railway.app
```

**Server:**
```env
PORT=4000
NODE_ENV=production
```

### H3 Configuration

- **Resolution**: 8 (configurable in server.js)
- **Cell Size**: ~461m diameter hexagons
- **Broadcast Range**: 0-3 levels (1-61 hexagons)

## 🎯 Usage

1. **Set Location** - Use GPS, search address, or pick on map
2. **Choose Broadcast Range** - Select how far messages reach (0-3 levels)
3. **Start Chatting** - Messages reach users in nearby H3 hexagons
4. **Visualize Coverage** - See exact broadcast area on interactive map

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- **H3 Documentation**: https://h3geo.org/
- **Leaflet.js**: https://leafletjs.com/
- **Railway**: https://railway.app/
- **GitHub Pages**: https://pages.github.com/

---

Made with ❤️ using H3 geospatial indexing