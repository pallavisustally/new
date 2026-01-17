# Project Setup Guide

This project consists of two main applications:
- **fn**: Next.js frontend application (runs on port 3000)
- **sustally**: Payload CMS backend application (runs on port 3001)

## Prerequisites

- Node.js (v18.20.2 or >=20.9.0)
- npm or pnpm (sustally uses pnpm)
- MongoDB database (local or cloud)

## Installation Steps

### 1. Install Frontend Dependencies (fn)

```bash
cd fn
npm install
```

This will install all required packages including:
- `recharts` - For pie charts
- `jspdf` - For PDF generation
- `html2canvas` - For capturing charts as images

### 2. Install Backend Dependencies (sustally)

```bash
cd sustally
pnpm install
```

**Note**: The sustally project uses `pnpm` as specified in its package.json. If you don't have pnpm installed, you can install it globally:
```bash
npm install -g pnpm
```

### 3. Environment Variables Setup

#### Backend (sustally)

Create a `.env` file in the `sustally` directory with the following variables:

```env
# Required
PAYLOAD_SECRET=your-secret-key-here
DATABASE_URL=mongodb://localhost:27017/sustally

# Optional - Email Configuration (for sending emails)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM_ADDRESS=your-email@gmail.com
SMTP_FROM_NAME=Sustally
```

**Important Notes:**
- `PAYLOAD_SECRET`: Generate a random secret string (e.g., use `openssl rand -base64 32`)
- `DATABASE_URL`: Your MongoDB connection string. For local MongoDB, use `mongodb://localhost:27017/sustally`
- For Gmail SMTP, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- Email functionality is optional - the app will work without it, but email sending will be disabled

#### Frontend (fn)

The frontend doesn't require any environment variables. It connects to the backend at `http://localhost:3001` by default.

## Running the Applications

### Start Backend (sustally)

Open a terminal and run:

```bash
cd sustally
pnpm dev
```

The backend will start on **http://localhost:3001**

### Start Frontend (fn)

Open another terminal and run:

```bash
cd fn
npm run dev
```

The frontend will start on **http://localhost:3000**

## Application Architecture

### Frontend (fn)
- **Port**: 3000
- **Framework**: Next.js 16.1.2
- **Main Pages**:
  - `/` - Main application form
  - `/review` - Review page with data visualization and PDF/Email options

### Backend (sustally)
- **Port**: 3001
- **Framework**: Payload CMS 3.70.0 with Next.js 15.4.10
- **API Endpoints**:
  - `/api/send-email` - POST endpoint for sending application review emails
  - `/admin` - Payload CMS admin panel
  - `/api/{collection}` - REST API endpoints for collections

### Connection Between Applications

The frontend communicates with the backend via:
- **API Calls**: `http://localhost:3001/api/send-email`
- **CORS**: Configured in the backend to allow requests from `http://localhost:3000`

## Features

### Frontend Features
- Form for collecting application data
- Review page with data visualization (pie chart)
- PDF generation with chart capture
- Email sending via backend API

### Backend Features
- Payload CMS admin panel
- Email sending functionality (if SMTP configured)
- MongoDB database storage
- REST API endpoints
- CORS support for frontend communication

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct `DATABASE_URL`
- Ensure `PAYLOAD_SECRET` is set

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify the backend URL in the frontend code matches your setup

### Email sending fails
- Verify SMTP credentials in `.env`
- For Gmail, ensure you're using an App Password
- Check SMTP_HOST and SMTP_PORT settings
- Email functionality is optional - the app works without it

### Package installation issues
- For `fn`: Use `npm install`
- For `sustally`: Use `pnpm install` (or install pnpm first)

## Development Notes

- Both applications run independently and can be started/stopped separately
- The frontend expects the backend to be running on port 3001
- CORS is configured in the backend middleware to allow requests from the frontend
- The backend uses Payload CMS which provides a built-in admin panel at `/admin`

## Next Steps

1. Start MongoDB (if using local instance)
2. Set up environment variables in `sustally/.env`
3. Install dependencies in both folders
4. Start both applications
5. Access the frontend at http://localhost:3000
6. Access the backend admin at http://localhost:3001/admin
