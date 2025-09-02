# ResumeAI - Smart Resume Analysis Platform

An AI-powered platform that helps users create, enhance, and match resumes with relevant job opportunities.

## 🏗️ Architecture

The project follows a three-component architecture:
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **ML Service**: Python + Flask + scikit-learn

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- Python 3.8 or higher
- MongoDB (local or cloud)

### 1. Environment Setup

Create `.env` file in the `server` directory:
```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
FLASK_ML_SERVICE_URL=http://localhost:5001/predict
APIJOBS_KEY=your_apijobs_api_key
NODE_ENV=development
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

# ML Service
cd ../ml_service
pip install -r requirements.txt
```

### 3. Start Services

**Option A: Manual Start (3 terminals)**
```bash
# Terminal 1 - ML Service (Port 5001)
cd ml_service
python app.py

# Terminal 2 - Backend (Port 5002)
cd server
npm run dev

# Terminal 3 - Frontend (Port 5173)
cd client
npm run dev
```

**Option B: Using Batch Script (Windows)**
```bash
# Run the startup script
./start-all.bat
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5002/api/health
- ML Service: http://localhost:5001/health

## 📦 Features

### ✅ Current Features
- **Resume Builder**: Interactive resume creation
- **Resume Enhancer**: AI-powered improvement suggestions
- **Career Roadmap**: Personalized career development plans
- **Job Matcher**: ML-powered job matching with external APIs
- **Modern UI**: Glassmorphism design with responsive layout

### 🚧 Recent Improvements
- Enhanced error handling with detailed messages
- Input validation and security headers
- Rate limiting for API protection
- Better logging and debugging
- React Router future flag compatibility

## 🛡️ Security Features

- Helmet.js for security headers
- Rate limiting (100 requests/15min, 10 uploads/15min)
- Input validation with Joi
- File type and size validation
- CORS protection with environment-specific origins

## 🔧 Development

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── ml_service/      # Python ML service
├── start-all.bat    # Windows startup script
└── README.md
```

### Available Scripts

**Backend (`server/`)**
- `npm run dev` - Start with nodemon
- `npm start` - Production start

**Frontend (`client/`)**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

**ML Service (`ml_service/`)**
- `python app.py` - Start Flask service

## 🚀 Deployment Readiness

### Phase 1 - Current Status ✅
- [x] Enhanced error handling
- [x] Input validation
- [x] Security headers
- [x] Rate limiting
- [x] Environment validation
- [x] Better logging

### Phase 2 - Next Steps
- [ ] Unit and integration tests
- [ ] TypeScript conversion
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production logging (Winston)

### Phase 3 - Production Ready
- [ ] Real authentication (JWT)
- [ ] Database optimization
- [ ] Performance monitoring
- [ ] Load balancing
- [ ] Cloud deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when available)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**ERR_CONNECTION_REFUSED**
- Ensure all services are running in correct order
- Check ports are not blocked by firewall
- Verify environment variables are set

**File Upload Errors**
- Check file size (max 10MB)
- Ensure file format is PDF, DOC, or DOCX
- Verify ML service is running

**Job Matching Issues**
- Confirm APIJOBS_KEY is valid
- Check ML service model file exists
- Verify internet connection for external API calls

### Getting Help

1. Check the logs in each service terminal
2. Visit health check endpoints
3. Review environment variables
4. Check file permissions

---

**Built with ❤️ for smarter career development**