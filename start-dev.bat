@echo off
echo Starting H3 Chat Development Servers...

REM Clean up any existing processes
call kill-ports.bat

REM Start backend server with nodemon
echo Starting backend with nodemon on port 3002...
start "H3Chat Backend" cmd /k "npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start frontend server on fixed port 5173
echo Starting frontend on port 5173...
start "H3Chat Frontend" cmd /k "npm run dev:client"

echo Both servers starting...
echo Backend (nodemon): http://localhost:3002
echo Frontend (Vite HMR): http://localhost:5173
pause