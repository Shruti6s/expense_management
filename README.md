# Expense Management System

A comprehensive expense management system built with React, Node.js, Express, and PostgreSQL. This system supports multi-level approval workflows, OCR receipt scanning, multi-currency support, and role-based access control.

## Features

### Core Features
- **Authentication & User Management**
  - Signup/Login with JWT authentication
  - Auto-create company and admin user on first signup
  - Currency set based on selected country
  - Role-based access (Admin, Manager, Employee)

- **Expense Submission**
  - Submit expense claims with amount, category, description, and date
  - Multi-currency support with automatic conversion
  - Upload receipts with OCR extraction (auto-fill expense details)
  - View expense history with approval status

- **Approval Workflow**
  - Multi-level sequential approval flow
  - Manager approval (optional first step)
  - Configurable approval sequences
  - Approve/Reject with comments

- **Conditional Approval Rules**
  - Percentage-based approval (e.g., 60% of approvers must approve)
  - Specific approver rule (e.g., CFO auto-approves)
  - Hybrid rules (percentage OR specific approver)
  - Sequential + Conditional combinations

### Role Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Create company, manage users, set roles, configure approval rules, view all expenses, override approvals |
| **Manager** | Approve/reject expenses, view team expenses, see amounts in company currency |
| **Employee** | Submit expenses, view own expenses, check approval status |

## Tech Stack

### Backend
- Node.js & Express
- PostgreSQL with Sequelize ORM
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Google Gemini AI (Flash model) for intelligent expense extraction
- Axios for API calls

### Frontend
- React with Vite
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling
- Context API for state management

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- pgAdmin 4 (optional, for database management)

### Database Setup

1. **Create Database**
   - Open pgAdmin 4
   - Create a new database named `expense_management`
   - Note your PostgreSQL credentials

2. **Update Environment Variables**
   ```bash
   cd backend
   # Edit .env file with your database credentials
   ```

   Update the following in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_management
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Get Gemini API Key**:
   1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
   2. Click "Get API Key"
   3. Copy the API key and paste it in `.env`

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server (development mode)
npm run dev

# Or start in production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user & create company
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Users
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:userId` - Update user (Admin only)
- `GET /api/users/managers` - Get all managers

### Expenses
- `POST /api/expenses` - Create expense
- `POST /api/expenses/upload-receipt` - Upload receipt with OCR
- `GET /api/expenses/my-expenses` - Get my expenses
- `GET /api/expenses/pending-approvals` - Get pending approvals (Manager/Admin)
- `PUT /api/expenses/approvals/:approvalId` - Approve/Reject expense
- `GET /api/expenses/all` - Get all expenses (Admin only)

### Approval Rules
- `POST /api/approval-rules` - Create approval rule (Admin only)
- `GET /api/approval-rules` - Get all rules
- `PUT /api/approval-rules/:ruleId` - Update rule (Admin only)
- `DELETE /api/approval-rules/:ruleId` - Delete rule (Admin only)

## Database Schema

### Tables
- **companies** - Company information with currency
- **users** - User accounts with roles and manager relationships
- **expenses** - Expense records with amounts and status
- **approval_rules** - Approval workflow rules
- **approval_workflows** - Sequential approval steps
- **approvals** - Individual approval records

## Usage Guide

### First Time Setup

1. **Sign Up**
   - Go to `/signup`
   - Enter your details, company name, and country
   - System automatically creates company and sets you as admin

2. **Create Users** (Admin)
   - Go to Dashboard → Manage Users
   - Create employees and managers
   - Assign manager relationships

3. **Configure Approval Rules** (Admin)
   - Go to Dashboard → Approval Rules
   - Create approval workflows
   - Set sequential approvers or conditional rules

### Employee Workflow

1. **Submit Expense**
   - Go to Dashboard → Submit Expense
   - Either manually enter details OR upload receipt for OCR
   - System automatically converts to company currency

2. **Track Status**
   - View My Expenses to see approval status
   - Check which step the expense is in

### Manager/Admin Workflow

1. **Review Approvals**
   - Go to Dashboard → Pending Approvals
   - Review expense details
   - Approve or Reject with comments

2. **Multi-step Approval**
   - Expense moves to next approver after approval
   - Final approver marks it as approved
   - Any rejection stops the workflow

## External APIs Used

- **Countries & Currencies**: `https://restcountries.com/v3.1/all`
- **Currency Conversion**: `https://api.exchangerate-api.com/v4/latest/{currency}`

## Project Structure

```
expense_management_system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (OCR, currency)
│   ├── uploads/         # Receipt uploads
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app
│   └── package.json
└── README.md
```

## Development Notes

- Backend uses Sequelize for database migrations
- Database schema auto-syncs on server start (`alter: true`)
- OCR supports JPEG, PNG, and PDF formats
- File upload limit: 5MB
- Token expiry: 7 days

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists in pgAdmin

### OCR Not Working
- Ensure Tesseract.js is installed
- Check file format (JPEG/PNG/PDF only)
- Verify uploads directory exists

### Frontend Can't Connect
- Check backend is running on port 5000
- Verify CORS is enabled
- Check API_URL in `frontend/src/services/api.js`

## Future Enhancements

- Email notifications for approvals
- Dashboard analytics and reports
- Expense categories management
- Receipt image preview
- Export to Excel/PDF
- Mobile app support
- Bulk expense uploads

## License

MIT License
