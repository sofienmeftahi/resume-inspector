# 🚀 Deployment Guide - Resume Inspector

This guide will help you deploy Resume Inspector so anyone can test their CV online without downloading anything.

## 🌐 **Option 1: Vercel (Recommended - Free & Easy)**

### **Step 1: Deploy Backend API**

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Import your repository**: `sofienmeftahi/resume-inspector`
4. **Configure settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `resume_inspector/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Output Directory**: Leave empty
   - **Install Command**: `pip install -r requirements.txt`

5. **Add Environment Variables**:
   ```
   PYTHON_VERSION=3.9
   ```

6. **Deploy** and note your API URL (e.g., `https://your-backend.vercel.app`)

### **Step 2: Deploy Frontend**

1. **Create new Vercel project**
2. **Import the same repository**
3. **Configure settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `resume_inspector/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```

5. **Deploy** and get your frontend URL

### **Step 3: Test Your Live App**

Your app will be available at: `https://your-frontend.vercel.app`

## 🌐 **Option 2: Netlify (Alternative)**

### **Backend Deployment**
1. **Go to [Railway.app](https://railway.app)** (for backend)
2. **Connect GitHub** and deploy backend
3. **Get your API URL**

### **Frontend Deployment**
1. **Go to [Netlify.com](https://netlify.com)**
2. **Connect GitHub** and deploy frontend
3. **Set environment variable**: `VITE_API_URL=your-backend-url`

## 🌐 **Option 3: Render (All-in-One)**

1. **Go to [Render.com](https://render.com)**
2. **Create Web Service** for backend
3. **Create Static Site** for frontend
4. **Connect both to your GitHub repo**

## 🔧 **Local Development Setup**

For developers who want to run locally:

```bash
# Clone repository
git clone https://github.com/sofienmeftahi/resume-inspector.git
cd resume-inspector

# Backend setup
cd resume_inspector/backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py

# Frontend setup (new terminal)
cd resume_inspector/frontend
npm install
npm run dev
```

## 📱 **Share Your Live App**

Once deployed, share these links:

### **For Users (Test CVs)**
- **Live App**: `https://your-app-url.com`
- **GitHub Repository**: `https://github.com/sofienmeftahi/resume-inspector`

### **For Developers**
- **Documentation**: `https://github.com/sofienmeftahi/resume-inspector#readme`
- **API Documentation**: Check the README for API endpoints

## 🎯 **Quick Deploy with Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd resume_inspector/backend
vercel

# Deploy frontend
cd ../frontend
vercel
```

## 🔒 **Security Considerations**

1. **File Upload Limits**: Set max file size to 5MB
2. **CORS Configuration**: Allow only your frontend domain
3. **Rate Limiting**: Consider adding rate limiting for API calls
4. **Environment Variables**: Keep sensitive data in environment variables

## 📊 **Monitoring**

- **Vercel Analytics**: Track usage and performance
- **Error Logging**: Monitor for issues
- **Performance**: Check load times and optimization

## 🚀 **Custom Domain (Optional)**

1. **Buy a domain** (e.g., `resumeinspector.com`)
2. **Configure DNS** to point to your Vercel deployment
3. **Add custom domain** in Vercel settings

---

**Your Resume Inspector will be live and accessible to anyone worldwide! 🌍** 