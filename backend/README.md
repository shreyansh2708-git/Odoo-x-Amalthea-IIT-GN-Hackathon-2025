# Expenzify Backend API

A robust Node.js/Express backend API for the Expenzify expense management system.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users with role management
- **Expense Management**: Submit, approve, reject, and track expenses
- **Approval Workflows**: Configurable multi-level approval processes
- **File Upload**: Receipt and document upload with OCR processing
- **Currency Support**: Multi-currency support with real-time conversion
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Security**: Rate limiting, CORS, helmet, and input validation

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **Axios** - HTTP client for external APIs
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```env
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
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and company
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/company/managers` - Get managers
- `GET /api/users/company/employees` - Get employees under manager

### Expenses
- `GET /api/expenses` - Get expenses (role-based filtering)
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `POST /api/expenses/:id/submit` - Submit expense for approval
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/pending/approvals` - Get pending approvals

### Companies
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company settings (Admin)

### Workflows
- `GET /api/workflows` - Get company workflow
- `POST /api/workflows` - Create/update workflow (Admin)
- `PUT /api/workflows/:id` - Update workflow (Admin)
- `DELETE /api/workflows/:id` - Delete workflow (Admin)

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/:filename` - Serve uploaded files
- `DELETE /api/upload/:filename` - Delete uploaded file
- `POST /api/upload/ocr` - Process receipt image for OCR

### Currency
- `GET /api/currency/rates/:baseCurrency` - Get exchange rates
- `POST /api/currency/convert` - Convert currency
- `GET /api/currency/supported` - Get supported currencies
- `GET /api/currency/countries` - Get countries with currencies

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-expenses` - Get recent expenses
- `GET /api/dashboard/category-breakdown` - Get category breakdown
- `GET /api/dashboard/monthly-trends` - Get monthly trends
- `GET /api/dashboard/pending-approvals` - Get pending approvals

## Database Models

### User
- Personal information (name, email, password)
- Role-based access (admin, manager, employee)
- Company association
- Manager relationship for employees

### Company
- Company details (name, currency)
- Settings (multi-currency, receipt requirements, limits)

### Expense
- Expense details (amount, currency, category, description)
- Approval workflow tracking
- File attachments
- Status management

### Workflow
- Approval sequence configuration
- Conditional approval rules
- Auto-approval settings

## Security Features

- JWT-based authentication
- Role-based authorization
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers (Helmet)
- Password hashing with bcrypt

## Error Handling

- Comprehensive error handling middleware
- Validation error responses
- Database error handling
- External API error handling

## Development

- Hot reload with nodemon
- Environment-based configuration
- Comprehensive logging
- Health check endpoint

## Production Considerations

- Use environment variables for sensitive data
- Implement proper logging
- Set up monitoring and alerting
- Use a production-grade database
- Implement proper backup strategies
- Use HTTPS in production
- Set up proper CORS policies
- Implement API versioning
- Add comprehensive testing
