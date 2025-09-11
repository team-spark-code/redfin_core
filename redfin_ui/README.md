# AI News Personalization Service

This is a web application that provides personalized AI news to users. It authenticates users through email and social logins (Google, Kakao) and delivers a news feed tailored to their registered interests.

## Key Features

- **User Authentication**: Supports email-based signup and login, as well as social login functionality using Google and Kakao.
- **Interest-Based Personalization**: Users can set their interests in specific jobs, AI companies, and AI fields.
- **Personalized News Feed**: The main page displays a curated list of news articles, with top stories prioritized based on the user's registered interests.
- **Dynamic Content Loading**: Fetches and displays news from both internal and external RSS feeds.
- **Responsive UI**: Built with Next.js and Tailwind CSS to provide a seamless experience across various devices.

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Authentication**: JWT (JSON Web Token), Google Identity Services, Kakao Login API
- **State Management**: React Context API (`AuthContext`)
- **Styling**: `shadcn/ui`, `lucide-react` for UI components and icons
- **Backend Communication**: Asynchronous API calls using `fetch`

## Folder Structure

```
/app
├── api/                # API routes (authentication, news, etc.)
├── components/         # Reusable React components
├── contexts/           # Global state management (e.g., AuthContext)
├── (routes)/           # Page routes (e.g., login, signup, interests)
└── layout.tsx          # Main layout
/lib
├── actions/            # Server-side actions (e.g., user signup)
├── database.ts         # Database connection and query functions
└── categoryStyle.ts    # Style definitions for news categories
/public
└── ...                 # Static assets (images, fonts)
```

## Getting Started

### Prerequisites

- Node.js
- pnpm (or npm/yarn)
- MariaDB (or other compatible database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd redfin_ui
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Application

1. Set up the required environment variables (see below).
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file in the project root and add the following variables. These are essential for authentication and backend API communication.

```
# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Kakao OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-kakao-rest-api-key
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/signup

# Backend API Server
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Database (MariaDB)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

**Note**: Ensure the `NEXT_PUBLIC_KAKAO_REDIRECT_URI` matches the one registered in your Kakao Developers console.
