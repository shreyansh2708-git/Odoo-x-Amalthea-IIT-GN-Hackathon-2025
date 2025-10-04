@echo off
echo Starting Expenzify Backend Server...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo NODE_ENV=development
        echo PORT=5001
        echo FRONTEND_URL=http://localhost:5173
        echo.
        echo # MongoDB
        echo MONGODB_URI=mongodb+srv://shreyanshm501_db_user:fCpLd7nTwjy0FOI9@cluster0.bsfmngb.mongodb.net/?retryWrites=true^&w=majority^&appName=Cluster0
        echo.
        echo # JWT
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRE=7d
        echo.
        echo # Cloudinary ^(for file uploads^)
        echo CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
        echo CLOUDINARY_API_KEY=your-cloudinary-api-key
        echo CLOUDINARY_API_SECRET=your-cloudinary-api-secret
        echo.
        echo # Exchange Rate API
        echo EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
        echo EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest
    ) > .env
    echo Please update the .env file with your actual API keys and secrets.
)

REM Start the server
echo Starting server on port 5001...
npm run dev

pause
