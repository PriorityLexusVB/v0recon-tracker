# Recon Tracker

Recon Tracker is a full-stack application to manage, track, and optimize the vehicle reconditioning process. It features real-time status updates, team management, performance analytics, and a mobile-first interface. Built with Next.js, TypeScript, Prisma, and NextAuth.

## Features

- **Real-time Vehicle Tracking**
- **Google Sheets Integration** for inventory syncing.
- **Team and Assignment Management**
- **Performance Analytics Dashboard**
- **Role-Based User Authentication** (Admin, Manager, User)
- **Mobile-First Responsive Dashboard**

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- pnpm
- Docker (optional, for containerized deployment)
- A running PostgreSQL database

### 2. Installation
Clone the repository and install dependencies:
\`\`\`bash
git clone https://github.com/PriorityLexusVB/v0recon-tracker.git
cd v0recon-tracker
pnpm install
\`\`\`

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in your database URL, NextAuth secret, and Google Sheets URL. If using email notifications, configure the email service variables.
\`\`\`bash
cp .env.example .env.local
\`\`\`

### 4. Database Setup
Apply the database schema with Prisma Migrate and seed the database with initial users and sample data:
\`\`\`bash
npx prisma migrate deploy
npx prisma db seed
\`\`\`

### 5. Run the Application
\`\`\`bash
pnpm dev
\`\`\`
The app will be available at `http://localhost:3000`.

## Deployment

For production deployment, ensure all environment variables are set in your hosting environment (e.g., Vercel, Docker).

### Vercel Deployment
1. Set the following environment variables in your Vercel project settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (e.g., `https://your-app-name.vercel.app`)
   - `NEXT_PUBLIC_GOOGLE_SHEETS_URL`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (if using email notifications)
2. Deploy using the Vercel CLI:
   \`\`\`bash
   npx vercel --prod
   \`\`\`
3. After deployment, run database migrations and seeding:
   \`\`\`bash
   npx prisma db push
   npx prisma db seed
   \`\`\`

### Docker Deployment
Build and run the Docker image:
\`\`\`bash
docker build -t recon-tracker .
docker run -p 3000:3000 -e DATABASE_URL="your-db-url" -e NEXTAUTH_SECRET="your-secret" -e NEXTAUTH_URL="http://localhost:3000" -e NEXT_PUBLIC_GOOGLE_SHEETS_URL="your-sheet-url" recon-tracker
\`\`\`

## Default Login Credentials

- **Admin**: `admin@recontracker.com` / `admin123`
- **Manager**: `manager@recontracker.com` / `manager123`
- **Shop User**: `shop@recontracker.com` / `user123`
- **Detail User**: `detail@recontracker.com` / `user123`
- **Photo User**: `photo@recontracker.com` / `user123`
