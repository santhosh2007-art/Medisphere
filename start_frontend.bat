@echo off
echo ===================================================
echo   MediSphere Patient 360 - Frontend Launch Script
echo ===================================================
echo.

:: Change directory to where the batch script is located
cd /d "%~dp0"

:: Check if the frontend folder exists
if not exist "medisphere-frontend" (
    echo [ERROR] Could not find the "medisphere-frontend" directory.
    echo Make sure this script is placed in the root folder of the project.
    pause
    exit /b
)

cd medisphere-frontend

:: Run npm install if node_modules is missing
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
)

:: Start the Vite development server in the background
echo [INFO] Starting Vite development server...
start "" /b npm run dev

:: Wait for Vite to bind to the port
echo [INFO] Waiting for server to initialize...
timeout /t 3 /nobreak >nul

:: Open the browser
echo [INFO] Launching MediSphere UI in default browser...
start http://localhost:5173/

echo.
echo ===================================================
echo   Frontend is now running at http://localhost:5173/
echo   To stop the server, close this command window.
echo ===================================================
echo.

:: Keep window open so the dev server process is not terminated immediately
cmd /k
