# 🚀 CollabBoard Deployment Guide

This guide provides comprehensive instructions for deploying CollabBoard to various hosting platforms and environments.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Domain Configuration](#domain-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Git repository** with your CollabBoard code
- **MongoDB Atlas** account (or self-hosted MongoDB)
- **Domain name** (optional but recommended)
- **GitHub account** (for CI/CD)

---

## Environment Setup

### 1. Environment Variables

Create the following environment files:

#### Backend (.env)
```env
# Database
mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/<DBNAME>?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: File Upload (if using cloud storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 2. Security Considerations

- Use strong, unique passwords for all services
- Generate a secure JWT secret (32+ characters)
- Enable 2FA on all accounts
- Use environment-specific configurations

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   ```bash
   # Go to MongoDB Atlas dashboard
   # Create new cluster (M0 Free tier works for development)
   ```

2. **Configure Network Access**
   ```
   # Add IP address: 0.0.0.0/0 (for all IPs)
   # Or specific IPs for better security
   ```

3. **Create Database User**
   ```bash
   # Username: collabboard_user
   # Password: strong-password-here
   # Role: Atlas admin (or custom role with readWrite permissions)
   ```

4. **Get Connection String**
   ```
   mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/<DBNAME>?retryWrites=true&w=majority
   ```

### Self-Hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mongodb

   # macOS
   brew install mongodb-community
   ```

2. **Start MongoDB Service**
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Create Database and User**
   ```javascript
   // Connect to MongoDB shell
   mongo

   // Create database
   use collabboard

   // Create user
   db.createUser({
     user: "collabboard_user",
     pwd: "strong-password",
     roles: ["readWrite"]
   })
   ```

---

## Frontend Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Go to vercel.com
   # Import your GitHub repository
   # Select the frontend directory
   ```

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

3. **Set Environment Variables**
   ```bash
   # In Vercel dashboard
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
   ```

4. **Deploy**
   ```bash
   # Vercel will automatically deploy on push to main branch
   git push origin main
   ```

### Netlify

1. **Connect Repository**
   ```bash
   # Go to netlify.com
   # Connect your GitHub repository
   ```

2. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = ".next"

   [build.environment]
     NODE_VERSION = "18"
   ```

3. **Environment Variables**
   ```bash
   # Set in Netlify dashboard
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

### Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   # frontend/Dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t collabboard-frontend .
   docker run -p 3000:3000 collabboard-frontend
   ```

---

## Backend Deployment

### Render (Recommended)

1. **Create New Web Service**
   ```bash
   # Go to render.com
   # Connect your GitHub repository
   # Select backend directory
   ```

2. **Configure Service**
   ```bash
   # Build Command: npm install
   # Start Command: npm start
   # Environment: Node
   ```

3. **Environment Variables**
   ```bash
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Auto-Deploy**
   ```bash
   # Render will auto-deploy on push to main branch
   git push origin main
   ```

### Railway

1. **Connect Repository**
   ```bash
   # Go to railway.app
   # Deploy from GitHub repo
   # Select backend directory
   ```

2. **Environment Variables**
   ```bash
   # Set in Railway dashboard
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   ```

### Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku

   # Windows
   # Download from heroku.com
   ```

2. **Create App**
   ```bash
   heroku create your-collabboard-backend
   ```

3. **Configure Environment**
   ```bash
   heroku config:set MONGO_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Docker Compose**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - MONGO_URI=mongodb://mongo:27017/collabboard
         - JWT_SECRET=your-jwt-secret
         - NODE_ENV=production
       depends_on:
         - mongo

     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db

   volumes:
     mongo_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

---

## Domain Configuration

### Custom Domain Setup

1. **DNS Configuration**
   ```bash
   # Add CNAME record
   # Name: api
   # Value: your-backend-domain.com

   # Add CNAME record
   # Name: www
   # Value: your-frontend-domain.com
   ```

2. **Update Environment Variables**
   ```bash
   # Backend
   CORS_ORIGIN=https://your-domain.com

   # Frontend
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   ```

### Subdomain Setup

```bash
# Frontend: app.yourdomain.com
# Backend: api.yourdomain.com
# Database: db.yourdomain.com (if self-hosted)
```

---

## SSL/HTTPS Setup

### Automatic SSL (Recommended)

Most hosting platforms provide automatic SSL:

- **Vercel**: Automatic HTTPS
- **Netlify**: Automatic HTTPS
- **Render**: Automatic HTTPS
- **Railway**: Automatic HTTPS
- **Heroku**: Automatic HTTPS

### Manual SSL (Self-Hosted)

1. **Let's Encrypt**
   ```bash
   # Install Certbot
   sudo apt install certbot

   # Generate certificate
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Nginx Configuration**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## Monitoring & Maintenance

### Health Checks

1. **Backend Health Endpoint**
   ```javascript
   // Add to your backend
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date() });
   });
   ```

2. **Frontend Health Check**
   ```javascript
   // Add to your frontend
   export async function getServerSideProps() {
     try {
       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
       if (!response.ok) throw new Error('Backend unhealthy');
     } catch (error) {
       console.error('Health check failed:', error);
     }
     return { props: {} };
   }
   ```

### Logging

1. **Backend Logging**
   ```javascript
   // Add Winston logger
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Error Tracking**
   ```javascript
   // Add Sentry
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

### Performance Monitoring

1. **Database Monitoring**
   ```bash
   # MongoDB Atlas provides built-in monitoring
   # Set up alerts for:
   # - Connection count
   # - Query performance
   # - Storage usage
   ```

2. **Application Monitoring**
   ```bash
   # Use services like:
   # - New Relic
   # - DataDog
   # - AppDynamics
   ```

---

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
heroku logs --tail
# or
docker logs container-name

# Verify environment variables
echo $MONGO_URI
echo $JWT_SECRET
```

#### Frontend Build Fails
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install

# Check TypeScript errors
npm run lint
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongo "mongodb+srv://cluster.mongodb.net/collabboard" --username username

# Check network access
# Verify IP whitelist in MongoDB Atlas
```

#### CORS Errors
```bash
# Verify CORS_ORIGIN in backend
# Should match your frontend domain exactly
# Include protocol (https://)
```

### Performance Issues

1. **Database Optimization**
   ```javascript
   // Add indexes
   db.users.createIndex({ email: 1 });
   db.projects.createIndex({ owner: 1 });
   db.tasks.createIndex({ projectId: 1, status: 1 });
   ```

2. **Caching**
   ```javascript
   // Add Redis for caching
   const redis = require('redis');
   const client = redis.createClient();
   ```

3. **CDN Setup**
   ```bash
   # Use Cloudflare or similar CDN
   # Configure caching rules
   # Enable compression
   ```

### Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Regular security updates
- [ ] Backup strategy in place

---

## Backup Strategy

### Database Backups

1. **MongoDB Atlas**
   ```bash
   # Automatic backups enabled
   # Manual export available
   mongodump --uri="mongodb+srv://..." --out=backup/
   ```

2. **Self-Hosted**
   ```bash
   # Create backup script
   #!/bin/bash
   mongodump --db collabboard --out /backups/$(date +%Y%m%d)
   ```

### Application Backups

1. **Code Repository**
   ```bash
   # Use Git for version control
   # Regular commits and tags
   git tag v1.0.0
   ```

2. **Environment Configuration**
   ```bash
   # Store env files securely
   # Use secrets management
   # Document all configurations
   ```

---

## Support

For deployment issues:

- **Documentation**: [Deployment Wiki](https://github.com/Bisrat-19/CollabBoard/wiki/Deployment)
- **Issues**: [GitHub Issues](https://github.com/Bisrat-19/CollabBoard/issues)
- **Community**: [Discussions](https://github.com/Bisrat-19/CollabBoard/discussions)

---

**Happy Deploying! 🚀** 