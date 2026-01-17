# Quick Setup Instructions

## Step 1: Install Frontend Packages (fn)

```bash
cd fn
npm install
```

## Step 2: Install Backend Packages (sustally)

```bash
cd sustally
pnpm install
```

If you don't have pnpm:
```bash
npm install -g pnpm
```

## Step 3: Configure Backend Environment

Create `sustally/.env` file:

```env
PAYLOAD_SECRET=your-random-secret-here
DATABASE_URL=mongodb://localhost:27017/sustally

# Optional - for email functionality
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Step 4: Start Applications

### Terminal 1 - Backend:
```bash
cd sustally
pnpm dev
```

### Terminal 2 - Frontend:
```bash
cd fn
npm run dev
```

## Access Points

- Frontend: http://localhost:3000
- Backend Admin: http://localhost:3001/admin
- Backend API: http://localhost:3001/api

## Notes

- Make sure MongoDB is running before starting the backend
- Email functionality is optional - app works without SMTP configuration
- For Gmail, use an App Password, not your regular password
