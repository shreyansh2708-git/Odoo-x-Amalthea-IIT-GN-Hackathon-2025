@echo off
echo ========================================
echo    EXPENZIFY APPLICATION STARTUP
echo ========================================
echo.

echo Step 1: Checking MongoDB Atlas IP Whitelist...
echo Your IP: 171.79.45.57
echo.
echo IMPORTANT: You MUST whitelist this IP in MongoDB Atlas first!
echo Go to: https://cloud.mongodb.com/ → Network Access → Add IP Address
echo Add: 171.79.45.57 (or use 0.0.0.0/0 for development)
echo.
pause

echo.
echo Step 2: Testing MongoDB Connection...
cd backend
npm run test-connection
if %errorlevel% neq 0 (
    echo.
    echo ❌ MongoDB connection failed!
    echo Please whitelist your IP in MongoDB Atlas first.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ MongoDB connection successful!
echo.

echo Step 3: Starting Backend Server...
echo Backend will start on: http://localhost:5001
echo.
start "Expenzify Backend" cmd /k "npm run dev"

echo.
echo Step 4: Starting Frontend Server...
echo Frontend will start on: http://localhost:8083
echo.
cd ..
start "Expenzify Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    APPLICATION STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:8083
echo 🔧 Backend API: http://localhost:5001
echo 📊 Health Check: http://localhost:5001/api/health
echo.
echo Press any key to exit...
pause >nul
