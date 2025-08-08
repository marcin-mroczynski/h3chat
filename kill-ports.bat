@echo off
echo Killing processes on ports 3000, 5173...

REM Kill processes on port 3000 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process %%a on port 5173
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any remaining Vite processes
taskkill /F /IM node.exe /FI "WINDOWTITLE eq*vite*" >nul 2>&1

echo Ports cleaned!
timeout /t 1 /nobreak >nul