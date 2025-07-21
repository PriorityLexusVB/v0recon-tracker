# Recon Tracker

Recon Tracker is a web application designed to streamline and optimize the vehicle reconditioning process for dealerships. It provides tools for tracking vehicles through various stages of recon, managing assignments, monitoring performance, and integrating with external data sources like Google Sheets.

## Features

- **Vehicle Tracking**: Monitor vehicles through different reconditioning stages (e.g., inspection, mechanical, detail, photo, sales-ready).
- **Assignment Management**: Assign recon tasks to specific users or teams with due dates and notes.
- **User & Team Management**: Administer users, roles (User, Manager, Admin), and organize them into teams.
- **Performance Analytics**: Gain insights into recon cycle times, department performance, and overall efficiency.
- **Notifications**: Real-time email and SMS notifications for status changes, new assignments, and overdue tasks.
- **Google Sheets Integration**: Seamlessly import vehicle data from Google Sheets (e.g., vAuto exports) to keep your inventory up-to-date.
- **Mobile-Friendly Interface**: Access key features on the go for technicians and managers in the shop.
- **Authentication**: Secure user authentication using NextAuth.js.
- **Database**: Powered by PostgreSQL with Prisma ORM for robust data management.

## Technologies Used

- **Next.js**: React framework for building full-stack web applications.
- **React**: Frontend library for building user interfaces.
- **TypeScript**: Strongly typed JavaScript for enhanced code quality.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **shadcn/ui**: Reusable UI components built with Tailwind CSS and Radix UI.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **NextAuth.js**: Flexible authentication for Next.js applications.
- **Zustand**: A small, fast, and scalable bearbones state-management solution.
- **Nodemailer**: Module for Node.js applications to allow easy email sending.
- **Twilio (optional)**: For sending SMS notifications.
- **Google Sheets API (via Google Apps Script)**: For data integration.
- **PostgreSQL**: Relational database.

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- pnpm (recommended package manager)
- PostgreSQL database (local or hosted)
- Google Account (for Google Sheets integration)

### 1. Clone the Repository

\`\`\`bash
git clone [your-repository-url]
cd recon-tracker
\`\`\`

### 2. Install Dependencies

Using pnpm:

\`\`\`bash
pnpm install
\`\`\`

### 3. Set up Environment Variables

Create a `.env.local` file in the root of your project based on `.env.example` and fill in the values:

\`\`\`
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET" # Generate a strong secret, e.g., using `openssl rand -base64 32`
NEXTAUTH_URL="http://localhost:3000" # Change to your deployment URL in production

# Google Sheets Integration
# This should be the "Web app URL" from your Google Apps Script deployment (see below)
NEXT_PUBLIC_GOOGLE_SHEETS_URL="YOUR_GOOGLE_SHEETS_WEB_APP_URL"

# Email Service (for Nodemailer)
# For Gmail, you'll need an App Password if 2FA is enabled.
# EMAIL_HOST="smtp.gmail.com"
# EMAIL_PORT="587"
# EMAIL_SECURE="false"
# EMAIL_USER="your-gmail-address@gmail.com"
# EMAIL_PASSWORD="your-gmail-app-password"
# EMAIL_FROM="Recon Tracker <noreply@recontracker.com>"

# SMS Service (e.g., Twilio) - Uncomment and configure if using
# SMS_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# SMS_AUTH_TOKEN="your_auth_token"
# SMS_FROM_NUMBER="+1234567890"
\`\`\`

**Generating `NEXTAUTH_SECRET`**:
You can generate a strong secret using Node.js:
\`\`\`bash
node -e "console.log(crypto.randomBytes(32).toString('base64'))"
\`\`\`

### 4. Database Setup

Run Prisma migrations to create your database schema:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Seed the database with initial data (e.g., admin user, sample teams, vehicles):

\`\`\`bash
npx prisma db seed
\`\`\`

### 5. Google Sheets Integration (Google Apps Script)

To enable data import from Google Sheets:

1.  **Create a Google Sheet**: Go to Google Sheets and create a new spreadsheet.
2.  **Add Tabs**: Create two tabs: `vAuto Feed` and `Shop Tracker`.
3.  **Import vAuto Data**: Manually import your vAuto inventory data into the `vAuto Feed` tab. Ensure it has columns like "VIN", "Stock #", "Year", "Make", "Model", "Inventory Date", etc.
4.  **Open Apps Script**: In your Google Sheet, go to `Extensions > Apps Script`.
5.  **Copy Script**: Copy the content from `google-sheets-script-enhanced.js` into the Apps Script editor, replacing any existing code.
6.  **Deploy as Web App**:
    *   Click `Deploy > New deployment`.
    *   Select `Web app` as the type.
    *   Set `Execute as` to `Me` (your Google account).
    *   Set `Who has access` to `Anyone` (or `Anyone, even anonymous` if no authentication is needed). **Be cautious with "Anyone" for sensitive data.**
    *   Click `Deploy`.
    *   **Copy the "Web app URL"**. This is the URL you will use for `NEXT_PUBLIC_GOOGLE_SHEETS_URL` in your `.env.local` file.
7.  **Run `updateShopTrackerFromVautoEnhanced`**: In the Apps Script editor, select the `updateShopTrackerFromVautoEnhanced` function from the dropdown and click `Run`. This will populate the `Shop Tracker` tab.
8.  **Set up Time-Driven Trigger (Optional but Recommended)**:
    *   In the Apps Script editor, click the `Triggers` icon (clock icon on the left sidebar).
    *   Click `Add Trigger`.
    *   Choose `updateShopTrackerFromVautoEnhanced` for "Choose function to run".
    *   Choose `Time-driven` for "Select event source".
    *   Configure the frequency (e.g., `Every hour`).
    *   Click `Save`.

### 6. Run the Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is designed to be deployed on [Vercel](https://vercel.com).

1.  **Connect your Git Repository**: Link your GitHub, GitLab, or Bitbucket repository to Vercel.
2.  **Configure Environment Variables**: Add all the environment variables from your `.env.local` file to your Vercel project settings.
3.  **Database Connection**: Ensure your `DATABASE_URL` is correctly configured for your production database (e.g., Neon, Supabase, Railway).
4.  **Build & Deploy**: Vercel will automatically detect Next.js and deploy your application.

## Project Structure

\`\`\`
.
├── app/                          # Next.js App Router pages, layouts, and API routes
│   ├── actions/                  # Server Actions for data mutations
│   ├── api/                      # API routes (e.g., for webhooks, external integrations)
│   ├── auth/                     # Authentication related pages (sign-in, sign-up, etc.)
│   ├── admin/                    # Admin dashboard pages (user, team, assignment management)
│   ├── analytics/                # Analytics dashboard pages
│   ├── mobile/                   # Mobile-specific dashboard
│   ├── recon/cards/              # Main vehicle recon dashboard
│   ├── timeline/                 # Vehicle timeline view
│   └── layout.tsx                # Root layout
├── components/                   # Reusable React components
│   ├── ui/                       # Shadcn UI components
│   └── ...                       # Custom components (e.g., VehicleCard, Header)
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions, types, Prisma client, services
│   ├── auth.ts                   # NextAuth.js configuration
│   ├── prisma.ts                 # Prisma client instance
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # General utility functions (e.g., cn for Tailwind)
│   ├── email-service.ts          # Nodemailer email sending logic
│   ├── notification-service.ts   # Logic for creating and sending notifications
│   ├── notification-store.ts     # Zustand store for notifications
│   ├── google-sheets-service.ts  # Logic for interacting with Google Sheets API
│   └── store.ts                  # Main Zustand store for global state
├── prisma/                       # Prisma schema and migrations
│   ├── schema.prisma             # Database schema definition
│   └── seed.js                   # Database seeding script
├── public/                       # Static assets (images, manifest)
├── scripts/                      # SQL scripts for seeding or migrations
├── styles/                       # Global CSS
├── types/                        # Global TypeScript type declarations (e.g., for NextAuth.js)
├── google-sheets-script.js       # Google Apps Script for basic sheet integration
├── google-sheets-script-enhanced.js # Enhanced Google Apps Script for sheet integration
├── middleware.ts                 # Next.js middleware for authentication/authorization
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── pnpm-lock.yaml                # pnpm lock file
├── postcss.config.mjs            # PostCSS configuration
├── README.md                     # Project README
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
\`\`\`

## Contributing

Feel free to fork the repository, open issues, and submit pull requests.

## License

[MIT License](LICENSE)
\`\`\`
