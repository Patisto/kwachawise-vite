# Deployment Guide

## Backend (Render) + Frontend (Vercel)

### Backend Deployment on Render

1. **Push your code to GitHub**
   - Make sure your `.server/render.yaml` is in the repository

2. **Create PostgreSQL Database**
   - Go to [render.com](https://render.com)
   - Click "New +" → "PostgreSQL"
   - Name it `kwachawise-db`
   - Select Free plan
   - Click "Create Database"

3. **Connect Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and configure automatically

4. **Set Environment Variables**
   - Go to your web service → Environment
   - Add these variables:
     - `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
     - `GROQ_API_KEY`: Your Groq API key from [console.groq.com](https://console.groq.com/keys)
     - `DATABASE_URL`: Get this from the database dashboard:
       - Go to Databases → kwachawise-db → Connect
       - Copy the "Internal Database URL"
       - Paste it as the DATABASE_URL value

5. **Deploy**
   - Render will automatically build and deploy your backend
   - Note the deployed URL (e.g., `https://kwachawise-server.onrender.com`)

### Frontend Deployment on Vercel

1. **Set Environment Variable in Vercel**
   - Go to your Vercel project settings
   - Add environment variable: `VITE_API_URL`
   - Value: Your Render backend URL with `/api` suffix
   - Example: `https://kwachawise-server.onrender.com/api`

2. **Redeploy**
   - Push changes to trigger a new deployment
   - Vercel will rebuild with the new API URL

### Local Development

For local development, you can use either SQLite or PostgreSQL:

**Option 1: SQLite (Original)**
```bash
cd .server
npm install
npm run dev
```

**Option 2: PostgreSQL (Production-like)**
1. Install PostgreSQL locally
2. Create a database: `createdb kwachawise`
3. Set `DATABASE_URL` in `.server/.env`:
   ```
   DATABASE_URL=postgresql://localhost:5432/kwachawise
   ```
4. Run the server:
   ```bash
   cd .server
   npm install
   npm run dev
   ```

### Important Notes

- The backend has been migrated from SQLite (sql.js) to PostgreSQL for Render compatibility
- All database operations are now async
- CORS is configured to allow requests from your Vercel frontend
- The frontend uses `VITE_API_URL` environment variable to switch between local (`/api`) and production backend
