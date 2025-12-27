# 🎓 EduPeak - Learning Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.8-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

A modern, full-featured Learning Management System (LMS) built with Next.js 15, featuring course management, video streaming, live support calls, assignments, quizzes, and comprehensive analytics.

[Features](#-features) • [Setup](#-getting-started) • [Tech Stack](#-technology-stack) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

EduPeak is a comprehensive Learning Management System designed for educators and students. It provides a complete platform for creating, managing, and delivering online courses with advanced features like video lessons, interactive quizzes, assignments, live support calls, and detailed analytics.

### Key Highlights

- 🚀 **Modern Stack**: Built with Next.js 15, React 19, and TypeScript
- 🎨 **Beautiful UI**: Tailwind CSS with Radix UI components
- 🔐 **Secure Authentication**: NextAuth.js with multiple providers
- 💳 **Payment Integration**: Stripe for seamless course purchases
- 📹 **Video Streaming**: AWS S3 integration for course content
- 📞 **Live Support**: Stream.io integration for video calls
- 📊 **Analytics**: Comprehensive tracking and reporting
- 🧪 **Well Tested**: Unit, integration, and E2E tests

---

## ✨ Features

### 🎓 Course Management

- **Course Creation**: Create courses with rich text descriptions, categories, and pricing
- **Chapter & Lesson Organization**: Structured content with chapters and lessons
- **Video Lessons**: Upload and stream video content
- **Course Status**: Draft, Published, and Archived states
- **Scheduled Publishing**: Schedule chapters and lessons for future release
- **Course Levels**: Beginner, Intermediate, and Advanced classifications
- **Course Ratings & Reviews**: Students can rate and review courses

### 👨‍🎓 Student Features

- **Course Enrollment**: Browse and enroll in courses
- **Progress Tracking**: Track lesson completion and course progress
- **Certificates**: Earn certificates upon course completion
- **Wishlist**: Save courses for later
- **Dashboard**: Personal dashboard with enrolled courses and statistics
- **Lesson Progress**: Automatic tracking of video watch time
- **Early Unlocks**: Use points to unlock content early

### 📝 Assignments & Quizzes

- **Interactive Quizzes**: Multiple-choice questions with instant feedback
- **Assignments**: Submit files, links, or text descriptions
- **Grading System**: Teachers can grade assignments and provide feedback
- **Submission Tracking**: Track submission status and resubmissions
- **Points System**: Earn points for completing quizzes and assignments

### 📚 Blog System

- **Content Creation**: Create and publish blog posts
- **Rich Text Editor**: TipTap integration for rich content editing
- **Categories & Tags**: Organize blog posts with categories and tags
- **Comments & Reactions**: Engage with blog content through comments and reactions
- **SEO Optimization**: Built-in SEO fields for better discoverability
- **Points Integration**: Spend points to publish, earn points from engagement

### 📞 Live Support & Video Calls

- **Support Calls**: Request live support sessions with teachers
- **Stream.io Integration**: High-quality video calls powered by Stream.io
- **Queue Management**: Join queue and wait for support
- **Call History**: Track all support call requests and sessions

### 📢 Announcements

- **Targeted Messaging**: Send announcements to specific roles, courses, or users
- **Scheduled Announcements**: Schedule announcements for future delivery
- **Rich Content**: HTML-rich announcement content
- **Read Tracking**: Track who has read announcements
- **Attachments**: Attach files to announcements

### 👨‍💼 Admin & SuperAdmin Features

- **Admin Dashboard**: Comprehensive analytics and statistics
- **Course Management**: Full CRUD operations for courses
- **Student Management**: View and manage student enrollments
- **Analytics**: Detailed analytics on enrollments, courses, and students
- **Withdrawals**: Manage teacher withdrawals
- **Order History**: Track all course purchases
- **Blog Management**: (SuperAdmin only) Manage blog posts and categories
- **User Management**: Manage users, roles, and permissions

### 🎨 User Experience

- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-first responsive design
- **Smooth Animations**: Framer Motion for smooth animations
- **Accessibility**: Built with accessibility in mind using Radix UI
- **Search**: Search courses and content
- **Notifications**: Real-time notifications for important events

### 🔒 Security & Performance

- **Rate Limiting**: Arcjet integration for API protection
- **Session Management**: Secure session handling
- **Activity Logging**: Track user activities and errors
- **Login History**: Monitor login attempts and sessions
- **Error Logging**: Comprehensive error tracking

---

## 🛠 Technology Stack

### Frontend

- **Framework**: [Next.js 15.3.8](https://nextjs.org/) with App Router
- **UI Library**: [React 19.0.0](https://react.dev/)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Tabler Icons](https://tabler.io/icons) & [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Rich Text Editor**: [TipTap](https://tiptap.dev/)
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Charts**: [Recharts](https://recharts.org/)

### Backend

- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma 6.8.2](https://www.prisma.io/)
- **Authentication**: [NextAuth.js 5.0](https://next-auth.js.org/)
- **API Routes**: Next.js API Routes

### Third-Party Services

- **Payments**: [Stripe](https://stripe.com/)
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/) (Tigris compatible)
- **Video Calls**: [Stream.io](https://getstream.io/)
- **Email**: [Brevo](https://www.brevo.com/) (formerly Sendinblue) / [Resend](https://resend.com/)
- **Rate Limiting**: [Arcjet](https://arcjet.com/)

### Development Tools

- **Testing**: 
  - [Vitest](https://vitest.dev/) - Unit testing
  - [Jest](https://jestjs.io/) - Unit testing
  - [Playwright](https://playwright.dev/) - E2E testing
  - [Cypress](https://www.cypress.io/) - E2E & Component testing
  - [Testing Library](https://testing-library.com/) - React component testing
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Package Manager**: npm / pnpm / yarn

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm**, **pnpm**, or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd knowledge-share
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add the required environment variables (see [Environment Variables](#-environment-variables) section below).

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Making Yourself an Admin

To access admin features, you need to set your user role to `admin`. You have three options:

#### Option 1: Using Prisma Studio (Recommended)

```bash
npx prisma studio
```

1. Open the browser at `http://localhost:5555`
2. Navigate to the `user` table
3. Find your user by email
4. Update the `role` field to `"admin"`
5. Save the changes

#### Option 2: Using SQL

Connect to your PostgreSQL database and run:

```sql
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

#### Option 3: Using the Script

```bash
npx ts-node scripts/make-admin.ts your-email@example.com
```

After setting your role to admin, you can access:
- Admin dashboard at `/admin`
- Course management at `/admin/courses`
- Create courses at `/admin/courses/create`

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"   # Your app URL
```

### Optional Variables

```env
# GitHub OAuth (Optional)
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-secret"

# Email Service (Brevo)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="your-verified-email@example.com"
BREVO_SENDER_NAME="EduPeak"

# AWS S3 / File Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_ENDPOINT_URL_S3="https://your-s3-endpoint.com"
AWS_ENDPOINT_URL_IAM="https://your-iam-endpoint.com"
AWS_REGION="us-east-1"
NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES="your-bucket-name"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stream.io (Video Calls)
STREAM_API_KEY="your-stream-api-key"
STREAM_API_SECRET="your-stream-api-secret"

# Arcjet (Rate Limiting)
ARCJET_KEY="your-arcjet-key"

# OpenAI (Optional - for future AI features)
OPENAI_API_KEY="sk-..."
```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using OpenSSL:

```bash
openssl rand -base64 32
```

---

## 📁 Project Structure

```
knowledge-share/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (public)/                 # Public pages (home, courses)
│   ├── admin/                    # Admin dashboard
│   ├── superadmin/               # SuperAdmin dashboard
│   ├── dashboard/                # Student dashboard
│   ├── api/                      # API routes
│   ├── actions/                  # Server actions
│   └── data/                     # Data fetching functions
├── components/                   # React components
│   ├── ui/                       # UI components (Radix UI)
│   ├── sidebar/                  # Sidebar components
│   ├── rich-text-editor/         # TipTap editor
│   ├── file-uploader/           # File upload components
│   └── video-call/              # Video call components
├── lib/                          # Utility libraries
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # NextAuth configuration
│   ├── env.ts                    # Environment validation
│   └── utils.ts                  # Utility functions
├── prisma/                       # Prisma schema and migrations
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── hooks/                        # Custom React hooks
├── tests/                        # Test files
├── cypress/                      # Cypress E2E tests
├── public/                       # Static assets
└── scripts/                      # Utility scripts
```

---

## 🧪 Testing

This project includes comprehensive testing setup with multiple testing frameworks:

### Unit Tests (Vitest)

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

### Unit Tests (Jest)

```bash
# Run Jest tests
npm run test:jest

# Watch mode
npm run test:jest:watch

# Coverage
npm run test:jest:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Headed mode
npm run test:e2e:headed
```

### E2E Tests (Cypress)

```bash
# Run Cypress tests
npm run test:cypress

# Open Cypress
npm run test:cypress:open

# Component tests
npm run test:cypress:component
npm run test:cypress:component:open
```

### Run All Tests

```bash
npm run test:all
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Environment Setup for Production

1. Set up a PostgreSQL database (e.g., Supabase, Neon, Railway)
2. Configure all environment variables in your hosting platform
3. Set up AWS S3 or compatible storage for file uploads
4. Configure Stripe webhooks for payment processing
5. Set up Stream.io for video calls
6. Configure email service (Brevo/Resend)

### Recommended Hosting Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **Render**
- **AWS Amplify**

---

## 📚 Documentation

Additional documentation files are available in the project:

- [`COURSE_UPLOAD_GUIDE.md`](./COURSE_UPLOAD_GUIDE.md) - Guide for uploading courses
- [`DATABASE_CONNECTION_GUIDE.md`](./DATABASE_CONNECTION_GUIDE.md) - Database setup guide
- [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) - Database schema documentation
- [`STREAM_SETUP.md`](./STREAM_SETUP.md) - Stream.io video call setup
- [`SUPERADMIN_FEATURES.md`](./SUPERADMIN_FEATURES.md) - SuperAdmin features guide
- [`TESTING_SETUP.md`](./TESTING_SETUP.md) - Testing configuration guide

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- All the open-source contributors and libraries that made this project possible

---

<div align="center">

**Built with ❤️ using Next.js and TypeScript**

[Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues) • [Documentation](./docs)

</div>

<!-- temp commit 348 -->
