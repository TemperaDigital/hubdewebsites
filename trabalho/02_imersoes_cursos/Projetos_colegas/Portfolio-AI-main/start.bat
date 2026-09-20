@echo off
echo.
echo ========================================
echo   RyzenAI Website - Starting Servers
echo ========================================
echo.
echo Starting Frontend (Vite)...
start cmd /k "cd /d "%~dp0" && npm run dev"
echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul
echo.
echo Starting Backend (Express)...
start cmd /k "cd /d "%~dp0backend" && npm start"
echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo ========================================
echo.

