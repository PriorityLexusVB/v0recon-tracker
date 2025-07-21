# Recon Tracker

A comprehensive vehicle reconditioning management system built with Next.js, TypeScript, Prisma, and NextAuth.

## Features

- **Real-time Vehicle Tracking** - Monitor vehicle status throughout the reconditioning process
- **Team Management** - Organize teams and assign vehicles efficiently  
- **Performance Analytics** - Track KPIs and team performance metrics
- **Role-Based Access** - Admin, Manager, and User roles with appropriate permissions
- **Google Sheets Integration** - Sync inventory data seamlessly
- **Mobile-First Design** - Responsive interface optimized for all devices
- **Notification System** - Real-time alerts and status updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Deployment**: Docker, Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/PriorityLexusVB/v0recon-tracker.git
   cd v0recon-tracker
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Update `.env.local` with your database URL and other configuration:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/recon_tracker"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # Seed with sample data
   npx prisma db seed
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding the database, you can log in with these accounts:

- **Admin**: `admin@recontracker.com` / `admin123`
- **Manager**: `manager@recontracker.com` / `manager123`
- **User**: `shop@recontracker.com` / `user123`

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Set up production database**
   \`\`\`bash
   # After deployment, run database migrations
   npx prisma db push
   npx prisma db seed
   \`\`\`

### Docker Deployment

1. **Build the Docker image**
   \`\`\`bash
   docker build -t recon-tracker .
   \`\`\`

2. **Run the container**
   \`\`\`bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-production-db-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     -e NEXTAUTH_URL="https://your-domain.com" \
     recon-tracker
   \`\`\`

## Database Schema

The application uses the following main entities:

- **Users** - Authentication and role management
- **Teams** - Organizational units for vehicle assignments
- **Vehicles** - Core entity tracking reconditioning status
- **Assignments** - Links between vehicles and teams
- **Notifications** - System alerts and updates

## API Routes

- `GET /api/v1/vehicles` - List all vehicles
- `GET /api/v1/vehicles/[vin]` - Get vehicle by VIN
- `POST /api/v1/vehicles` - Create new vehicle
- `PUT /api/v1/vehicles/[vin]` - Update vehicle
- `DELETE /api/v1/vehicles/[vin]` - Delete vehicle

## Google Sheets Integration

To enable Google Sheets integration:

1. Create a Google Sheet with vehicle data
2. Make it publicly viewable (or set up service account)
3. Add the sheet URL to your environment variables
4. Use the integration page to sync data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@recontracker.com or create an issue in the GitHub repository.
