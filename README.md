# Expenzify - Complete Expense Management System

A full-stack expense management application built with React, Node.js, Express, and MongoDB. This system provides comprehensive expense tracking, approval workflows, and analytics for businesses of all sizes.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Authentication**: JWT-based authentication with role management
- **Dashboard**: Role-based dashboards with real-time statistics
- **Expense Management**: Submit, track, and manage expense claims
- **Approval Workflow**: Multi-level approval system with notifications
- **File Upload**: Receipt upload with OCR processing
- **Multi-Currency**: Support for multiple currencies with real-time conversion
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Comprehensive API endpoints for all features
- **Authentication & Authorization**: JWT-based security with role-based access control
- **Database Models**: Well-structured MongoDB schemas for users, expenses, companies, and workflows
- **File Upload**: Secure file handling with validation
- **Currency Integration**: Real-time exchange rate APIs
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** for form handling
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for logging

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expenzify
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```

5. **Update environment variables**
   Edit the `.env` file with your actual values:
   ```env
   NODE_ENV=development
   PORT=5001
   FRONTEND_URL=http://localhost:5173
   
   # MongoDB
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Cloudinary (optional, for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   # Exchange Rate API (optional)
   EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
   EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

   Or use the provided script:
   - **Windows**: Double-click `start-backend.bat`
   - **Linux/Mac**: Run `./start-backend.sh`

### Frontend Setup

1. **Navigate to root directory**
   ```bash
   cd .. # if you're in the backend directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 Usage

### Getting Started

1. **Register a new account**
   - Choose your role (Admin, Manager, or Employee)
   - Provide company information
   - Set your default currency

2. **Login**
   - Use your email and password
   - Select your role for authentication

3. **Submit Expenses**
   - Upload receipts (optional OCR processing)
   - Fill in expense details
   - Submit for approval

4. **Manage Approvals** (Managers/Admins)
   - Review pending expenses
   - Approve or reject with comments
   - Track approval history

5. **View Analytics**
   - Dashboard with key metrics
   - Category breakdowns
   - Monthly trends
   - Team performance

### User Roles

- **Admin**: Full system access, user management, workflow configuration
- **Manager**: Team management, expense approvals, analytics
- **Employee**: Submit expenses, view personal analytics

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get expenses (role-based)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `POST /api/expenses/:id/submit` - Submit for approval
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense
- `DELETE /api/expenses/:id` - Delete expense

### Users
- `GET /api/users` - Get users (Admin/Manager)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent-expenses` - Get recent expenses
- `GET /api/dashboard/category-breakdown` - Get category breakdown
- `GET /api/dashboard/monthly-trends` - Get monthly trends

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `POST /api/upload/ocr` - Process receipt OCR

### Currency
- `GET /api/currency/rates/:baseCurrency` - Get exchange rates
- `POST /api/currency/convert` - Convert currency
- `GET /api/currency/supported` - Get supported currencies

## 🔧 Configuration

### Workflow Configuration
Admins can configure approval workflows:
- Multi-level approval sequences
- Conditional approval rules
- Auto-approval thresholds
- Manager-based approvals

### Company Settings
- Default currency
- Multi-currency support
- Receipt requirements
- Expense limits
- Auto-approval rules

## 🚀 Deployment

### Backend Deployment
1. **Prepare for production**
   ```bash
   cd backend
   npm install --production
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Deploy to your preferred platform**
   - Heroku
   - AWS
   - DigitalOcean
   - Railway
   - Vercel (for API routes)

### Frontend Deployment
1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel
   - Netlify
   - AWS S3
   - GitHub Pages

## 🔒 Security Features

- JWT-based authentication
- Role-based authorization
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers (Helmet)
- Password hashing with bcrypt
- File upload validation

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting software
- [ ] Automated expense categorization
- [ ] Multi-language support
- [ ] Advanced workflow automation
- [ ] Real-time notifications
- [ ] Advanced OCR with machine learning

## 📞 Contact

For questions or support, please contact:
- Email: support@expenzify.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/expenzify/issues)

---

**Expenzify** - Making expense management simple and efficient! 🚀