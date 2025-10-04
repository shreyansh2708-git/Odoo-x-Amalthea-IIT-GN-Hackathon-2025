#!/bin/bash

# Start the Expenzify backend server
echo "Starting Expenzify Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to backend directory
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://shreyanshm501_db_user:fCpLd7nTwjy0FOI9@cluster0.bsfmngb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest
EOL
    echo "Please update the .env file with your actual API keys and secrets."
fi

# Start the server
echo "Starting server on port 5001..."
npm run dev
