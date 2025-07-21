# Recon Tracker Dashboard

A comprehensive vehicle reconditioning tracking system built with Next.js, designed for automotive dealerships to manage their vehicle preparation workflow from inventory to sales-ready status.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org)

## 🚗 Features

- **Real-time Vehicle Tracking**: Monitor vehicles through shop, detail, photo, and sales-ready stages
- **Google Sheets Integration**: Seamlessly sync with vAuto inventory feeds via Google Apps Script
- **Team Management**: Assign vehicles to teams and track individual performance
- **Performance Analytics Dashboard**: Comprehensive reporting on recon performance and bottlenecks
- **Role-Based Access**: Admin, Manager, and User roles with appropriate permissions
- **Mobile-Optimized**: Responsive design works perfectly on phones and tablets

## 🛠 Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase or self-hosted)
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Notifications**: EmailJS, Twilio (optional)
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0 or later
- pnpm package manager
- Docker
- PostgreSQL database (local or cloud-hosted like Supabase)
- Google account for Sheets integration

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/PriorityLexusVB/v0recon-tracker.git
cd v0recon-tracker
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Setup

Copy the example environment file and configure your variables:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your actual values:

\`\`\`env
# Required: Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/recon_tracker"

# Required: NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Required: Google Sheets URL
NEXT_PUBLIC_GOOGLE_SHEETS_URL="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing"

# Optional: EmailJS service ID
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-emailjs-service-id"

# Optional: Twilio account SID for SMS
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
\`\`\`

### 4. Database Setup

Initialize and seed your database:

\`\`\`bash
# Apply database schema
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed the database with initial data
npx prisma db seed
\`\`\`

### 5. Google Sheets Integration Setup

#### Step 1: Create Your Google Sheet

1. Create a new Google Sheet
2. Create two tabs: "vAuto Feed" and "Shop Tracker"
3. Import your vAuto inventory data into the "vAuto Feed" tab

#### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to `Extensions > Apps Script`
2. Delete the default code and paste the contents of `google-sheets-script.js`
3. Save the script with a meaningful name like "Recon Tracker Integration"

#### Step 3: Configure the Script

1. Run the `updateShopTrackerFromVauto()` function manually first
2. Set up a time-based trigger to run every hour:
   \`\`\`javascript
   // Run this function once to set up automatic updates
   setupTriggers()
   \`\`\`

#### Step 4: Share Your Sheet

1. Click "Share" in the top-right corner of your Google Sheet
2. Change permissions to "Anyone with the link can view"
3. Copy the sharing URL and add it to your `.env.local` file

### 6. Start Development Server

\`\`\`bash
pnpm dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📊 Data Flow

\`\`\`
vAuto Inventory → Google Sheets → Google Apps Script → Recon Tracker → PostgreSQL
\`\`\`

1. **vAuto Feed**: Your inventory management system exports data to Google Sheets
2. **Google Apps Script**: Processes and transforms data into the Shop Tracker format
3. **Recon Tracker**: Fetches data via Google Sheets API and stores in PostgreSQL
4. **Real-time Updates**: Users update vehicle status through the web interface

## 🔧 Configuration

### Database Schema

The application uses the following main entities:

- **User**: System users with roles (ADMIN, MANAGER, USER)
- **Team**: Departmental teams (shop, detail, photo, sales)
- **Vehicle**: Vehicle records with status tracking
- **VehicleAssignment**: Assignment of vehicles to teams/users
- **Notification**: System notifications and alerts

### Google Apps Script Configuration

Key functions in `google-sheets-script.js`:

- `updateShopTrackerFromVauto()`: Main sync function
- `onEdit()`: Handles real-time checkbox updates
- `setupTriggers()`: Configures automatic updates

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

\`\`\`bash
# Or deploy directly with Vercel CLI
npx vercel --prod
\`\`\`

### Docker

\`\`\`bash
docker build -t recon-tracker .
docker run -p 3000:3000 recon-tracker
\`\`\`

## 📱 Mobile Usage

The application is fully responsive and optimized for mobile use:

- **Touch-friendly interface**: Large buttons and easy navigation
- **Offline capability**: Basic functionality works without internet
- **Progressive Web App**: Can be installed on mobile devices
- **Real-time sync**: Updates reflect immediately across all devices

## 🔐 User Roles

- **ADMIN**: Full system access, user management, system settings
- **MANAGER**: Team management, vehicle assignments, reporting
- **USER**: Vehicle status updates, basic reporting

## 📈 Analytics & Reporting

Built-in analytics include:

- Vehicle throughput metrics
- Department performance tracking
- Bottleneck identification
- Completion time analysis
- Custom date range reporting

## 🔔 Notifications

Configure notifications for:

- Vehicles overdue in recon
- Completion milestones
- Assignment updates
- System alerts

## 🛠 Development

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Database scripts
\`\`\`

### Available Scripts

\`\`\`bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run type-check   # Run TypeScript checks
\`\`\`

### Database Commands

\`\`\`bash
npx prisma studio           # Open Prisma Studio
npx prisma db push          # Push schema changes
npx prisma migrate dev      # Create and apply migration
npx prisma generate         # Generate Prisma client
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/PriorityLexusVB/v0recon-tracker/issues) page
2. Review the troubleshooting section below
3. Create a new issue with detailed information

## 🔧 Troubleshooting

### Common Issues

**Google Sheets Integration Not Working**
- Verify the sheet is publicly accessible
- Check that the Google Apps Script is running
- Ensure the sheet URL in environment variables is correct

**Database Connection Issues**
- Verify DATABASE_URL is correctly formatted
- Check database server is running
- Run `npx prisma migrate deploy` to sync schema

**Authentication Problems**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Getting Help

For additional support:
- 📧 Email: support@recontracker.com
- 💬 Discord: [Join our community](https://discord.gg/recontracker)
- 📖 Documentation: [Full docs](https://docs.recontracker.com)

## Default Users
After seeding the database:
- Admin: admin@recontracker.com / admin123
- Manager: manager@recontracker.com / manager123
- User: shop@recontracker.com / user123

---

Built with ❤️ for automotive professionals
