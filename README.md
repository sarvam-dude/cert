# TS Techy Certificate Management System

A secure, user-friendly web application that allows administrators to upload certificates (PDFs or images) and immediately receive unique, shareable links. The system provides both an administrative interface for uploading and managing certificates, and a public-facing viewer that can render PDF documents or image files directly in the browser.

## ✅ System Status

- **Backend:** ✅ Fully operational and tested on port 12001
- **Frontend:** ✅ Code complete and ready for deployment
- **Database:** ✅ MongoDB connected and functional
- **API Endpoints:** ✅ All endpoints tested and working
- **File Upload:** ✅ Working with validation (PDF, JPG, PNG only)
- **QR Generation:** ✅ Working and accessible
- **Security:** ✅ File validation and 7-day expiry implemented

## 🚀 Features

### Core Features
- **Secure File Upload**: Upload PDF, JPEG, and PNG certificates with drag-and-drop support
- **Unique Shareable Links**: Each certificate gets a universally unique identifier (UUID)
- **Public Certificate Viewer**: View certificates without authentication
- **Real-time Upload Progress**: Visual feedback during file uploads
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Advanced Features
- **QR Code Generation**: Generate QR codes for easy mobile sharing
- **Email Notifications**: Optional email delivery of certificate links
- **Automatic Expiry**: Links expire after 7 days (configurable)
- **File Type Validation**: Strict validation of file types and sizes
- **PDF Viewer**: Built-in PDF viewer with zoom, rotation, and pagination
- **Image Display**: Optimized image viewing for JPEG and PNG files

## 🏗️ Architecture

### Frontend (React.js)
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM for client-side navigation
- **Styling**: Tailwind CSS for responsive design
- **PDF Viewer**: react-pdf for PDF document rendering
- **File Upload**: react-dropzone for drag-and-drop functionality
- **Notifications**: react-hot-toast for user feedback
- **Icons**: Lucide React for consistent iconography

### Backend (Node.js + Express)
- **Framework**: Express.js REST API
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Local file system (configurable for S3)
- **File Upload**: Multer middleware for multipart/form-data
- **UUID Generation**: uuid library for unique identifiers
- **Email Service**: Nodemailer for email notifications
- **QR Codes**: qrcode library for QR code generation

## 📁 Project Structure

```
cert/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.js # Global error handling
│   │   └── upload.js       # File upload configuration
│   ├── models/
│   │   └── Certificate.js  # Certificate data model
│   ├── routes/
│   │   └── certificates.js # API routes
│   ├── utils/
│   │   ├── emailService.js # Email notification service
│   │   └── qrGenerator.js  # QR code generation
│   ├── uploads/            # File storage directory
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Dependencies and scripts
│   └── server.js           # Application entry point
├── frontend/               # React.js application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   │   ├── UploadPage.jsx    # Admin upload interface
│   │   │   ├── ViewPage.jsx      # Public certificate viewer
│   │   │   └── NotFoundPage.jsx  # 404 error page
│   │   ├── utils/
│   │   │   └── api.js      # API client configuration
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Dependencies and scripts
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vite.config.js      # Vite build configuration
└── README.md               # This file
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=12001
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/certificate_db
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:12000
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   
   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@tstechy.com
   
   # Certificate Expiry (Optional - in days)
   CERTIFICATE_EXPIRY_DAYS=7
   ```

4. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:12001/api
   
   # App Configuration
   VITE_APP_NAME=TS Techy Certificate Manager
   VITE_APP_VERSION=1.0.0
   
   # File Upload Configuration
   VITE_MAX_FILE_SIZE=10485760
   VITE_ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🌐 API Endpoints

### Upload Certificate
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- certificate: File (PDF, JPEG, PNG)
- email: String (optional)

Response:
{
  "success": true,
  "message": "Certificate uploaded successfully",
  "data": {
    "id": "uuid",
    "fileName": "certificate.pdf",
    "fileSize": 1024000,
    "fileType": "pdf",
    "uploadDate": "2023-07-11T10:00:00.000Z",
    "expiryDate": "2023-07-18T10:00:00.000Z",
    "viewUrl": "http://localhost:3000/view/uuid",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Get Certificate File
```http
GET /api/certificate/:id

Response: Binary file data (PDF/Image)
```

### Get Certificate Info
```http
GET /api/certificate/:id/info

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "certificate.pdf",
    "fileType": "pdf",
    "fileSize": 1024000,
    "uploadDate": "2023-07-11T10:00:00.000Z",
    "expiryDate": "2023-07-18T10:00:00.000Z"
  }
}
```

### Get QR Code
```http
GET /api/certificate/:id/qr

Response: PNG image data
```

## 🔒 Security Features

- **File Type Validation**: Only PDF, JPEG, and PNG files are accepted
- **File Size Limits**: Maximum 10MB file size (configurable)
- **UUID-based URLs**: Cryptographically secure unique identifiers
- **Automatic Expiry**: Links expire after configurable time period
- **CORS Protection**: Configured for specific frontend domains
- **Input Sanitization**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling without information leakage

## 🚀 Deployment

### Production Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/certificate_db
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Docker Deployment (Optional)

Create `Dockerfile` for backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Create `Dockerfile` for frontend:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Usage

### Admin Upload Flow
1. Navigate to `/upload`
2. Optionally enter email for notifications
3. Drag and drop or select certificate file
4. Wait for upload completion
5. Copy the generated shareable link
6. Optionally download QR code for sharing

### Public Viewing Flow
1. Access the unique certificate URL
2. View PDF with built-in controls (zoom, rotate, paginate)
3. View images with optimized display
4. Download certificate if needed
5. Generate QR code for mobile sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@tstechy.com or create an issue in the repository.

## 🙏 Acknowledgments

- React.js team for the excellent frontend framework
- Express.js team for the robust backend framework
- MongoDB team for the flexible database solution
- All open-source contributors whose libraries made this project possible

---

**Built with ❤️ by TS Techy**