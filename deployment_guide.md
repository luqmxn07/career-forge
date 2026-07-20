# CareerForge Deployment Guide

This guide describes how to deploy the CareerForge application. Since this project is a monorepo containing a Vite-based frontend SPA, an Express-based backend API, Prisma ORM, and BullMQ background workers, a split-deployment model is the industry-standard approach.

---

## 🏛️ Recommended Architecture

To achieve production-grade performance, scalability, and support the persistent background queues (BullMQ), the application should be deployed as follows:

```mermaid
graph TD
    User([User's Browser]) -->|Loads Frontend| Vercel[Vercel static hosting<br/>hosts @careerforge/web]
    User -->|Sends Requests / API calls| Render[Render or Railway<br/>hosts @careerforge/api Express App]
    
    subgraph Backend Infrastructure
        Render -->|DB Queries| Neon[Neon.tech or Supabase<br/>PostgreSQL Database]
        Render -->|Job Queues / Cache| Upstash[Upstash Redis<br/>Serverless Redis]
    end
    
    Render -.->|Runs Workers| BullMQ[PDF & Reminder<br/>Background Workers]
```

### ❌ Why not deploy everything on Vercel?
1. **Serverless Limitations**: Vercel is built for Serverless functions. It has strict execution time limits (typically 10–15 seconds on the free tier).
2. **Background Workers (BullMQ)**: The backend runs persistent background workers (`pdfWorker` and `reminderWorker`) using Redis to process queues. Serverless platforms cannot host persistent workers; when no HTTP requests come in, Vercel spins down the environment, which breaks all background task processing.
3. **Database connection pooling**: Long-running database connections from serverless functions can quickly exhaust PostgreSQL connection limits.

---

## 📋 Pre-Deployment Check: Git Repository

Before uploading your code to GitHub, ensure that you do not upload sensitive environment files or bulky `node_modules` folders. 

> [!IMPORTANT]
> We have automatically created a **root `.gitignore` file** at `c:\Users\wwwar\Documents\career forge\.gitignore` for you. This file prevents Git from tracking:
> * Your secret `.env` files.
> * Installed `node_modules` folders.
> * Local build folders (`dist`, `.tanstack`, etc.).

### Step-by-Step GitHub Setup:
1. Open your terminal at the project root (`c:\Users\wwwar\Documents\career forge`).
2. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "chore: initial commit of CareerForge monorepo"
   ```
3. Create a **New Repository** on your GitHub account (you can make it public or private; private is recommended for safety, but if you make it public, your code is visible to everyone, which is fine since `.gitignore` protects your secret keys).
4. Run the commands provided by GitHub to link your local code and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## 💾 Phase 1: Database & Redis Provisioning

The backend requires a **PostgreSQL** database and a **Redis** instance to store job queues.

### 1. PostgreSQL (Neon.tech or Supabase)
We recommend **Neon.tech** because it is a fast, serverless PostgreSQL provider with an excellent free tier.
1. Sign up/log in at [Neon.tech](https://neon.tech/).
2. Create a new project called `careerforge`.
3. Copy the **Connection String** (URI format) from the Neon dashboard.
   - It will look like: `postgresql://neondb_owner:PASSWORD@ep-xyz-12345.aws.neon.tech/neondb?sslmode=require`
   - *Keep this connection string safe.* This will be your `DATABASE_URL` environment variable.

### 2. Redis (Upstash)
We recommend **Upstash** because it provides Serverless Redis with a generous free tier (perfect for BullMQ).
1. Sign up/log in at [Upstash](https://upstash.com/).
2. Create a new Redis Database named `careerforge-cache`.
3. Copy the **Redis URL** from the Upstash console.
   - It will look like: `redis://default:PASSWORD@endpoint.upstash.io:6379`
   - *Keep this URL safe.* This will be your `REDIS_URL` environment variable.

---

## ⚙️ Phase 2: Deploying the Backend on Render (or Railway)

We recommend **Render.com** (using a Web Service) or **Railway.app** to host the Express server. Here are the step-by-step instructions for **Render**:

1. Sign up/log in at [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `careerforge` repository.
4. Configure the Web Service settings as follows:
   * **Name**: `careerforge-api`
   * **Language**: `Node`
   * **Branch**: `main`
   * **Root Directory**: `.` *(Leave empty or specify `.` to use the workspace root)*
   * **Build Command**: `npm install && npm run build` *(This installs dependencies and builds all workspaces, compiling `@careerforge/shared-types` first, then the api)*
   * **Start Command**: `node apps/api/dist/server.js` (or `npm run start --workspace=@careerforge/api`)
5. Click **Advanced** to add the following **Environment Variables**:

| Variable Name | Recommended Value / Source |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically, but write 10000 to be safe)* |
| `DATABASE_URL` | *Your Neon PostgreSQL connection string* |
| `REDIS_URL` | *Your Upstash Redis connection string* |
| `JWT_ACCESS_SECRET` | *A random 32+ character string (generate using `openssl rand -base64 32`)* |
| `JWT_REFRESH_SECRET` | *Another random 32+ character string* |
| `FRONTEND_URL` | *For now, use `https://localhost:3000`. You will update this after deploying to Vercel.* |

6. Deploy the service.
7. **Run Database Migrations**:
   Once the backend is linked to your Neon database, run the Prisma migration command from your local machine to set up the database tables in production:
   ```bash
   # Run this command in your local terminal to apply the migrations to your remote Neon DB
   # (Temporarily set DATABASE_URL in your local .env to your Neon URL before running this, then revert it back to localhost)
   npx prisma db push --schema=apps/api/src/prisma/schema.prisma
   ```

---

## 🌐 Phase 3: Deploying the Frontend on Vercel

Once your backend is successfully running (and you have its URL, e.g., `https://careerforge-api.onrender.com`), you can deploy the frontend:

1. Sign up/log in at [Vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository.
4. In the Project configuration:
   * **Framework Preset**: Select **Vite** or **Other**.
   * **Root Directory**: `.` *(Keep this as root so Vercel resolves workspace dependencies)*
   * **Build and Output Settings** (Expand this section and toggle **Override** on):
     * **Build Command**: `npm run build`
     * **Output Directory**: `apps/web/dist`
5. Expand the **Environment Variables** section and add:

| Variable Name | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-render-backend-url.onrender.com/api/v1` |

6. Click **Deploy**.
7. Once deployed, copy your Vercel frontend URL (e.g., `https://careerforge-web.vercel.app`).
8. **Final Step**: Go back to your **Render (or Railway) Dashboard**, edit the Environment Variables of your backend, and update `FRONTEND_URL` to your Vercel frontend URL. Save changes to trigger a redeploy of the backend.

---

## 🔍 Verification

To verify that your deployment was successful:
1. Visit your Vercel frontend URL in your browser.
2. Check if the app loads.
3. Open Developer Tools (F12) -> Network tab to verify that calls to your Render API are successful.
4. Try creating a user account to confirm that both the frontend, backend, database (Neon), and Redis (Upstash) are successfully connected!
