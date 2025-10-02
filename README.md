# Vibe Apply

A full-stack application management system built with NestJS, React, and Firebase. This application enables users to submit applications, leaders to provide recommendations, and administrators to review and manage submissions.

## Features

### User Roles

- **Applicant**: Submit and manage applications
- **Leader**: Submit recommendations for applicants
- **Admin**: Review applications and recommendations, manage users and roles

### Key Functionality

- **Authentication**: Google OAuth and email/password authentication with JWT
- **Application Management**: Create, edit, and submit applications with draft support
- **Recommendation System**: Leaders can submit recommendations for approved applicants
- **Admin Dashboard**: Analytics and overview of all submissions with charts
- **Profile Management**: Update personal and church information with cascade updates
- **Role-Based Access Control**: Different views and permissions based on user roles
- **Real-time Status Updates**: Track application and recommendation statuses

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Firebase Admin SDK** - Authentication and Firestore database
- **Passport.js** - Authentication middleware (JWT & Google OAuth)
- **TypeScript** - Type-safe development

### Frontend
- **React 18** - UI library with hooks
- **React Router** - Client-side routing
- **Sass/SCSS** - Styling with BEM methodology
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Vite** - Fast build tool

### Shared
- **TypeScript** - Shared types and DTOs between frontend and backend

## Project Structure

```
vibe-apply/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── applications/ # Application management
│   │   │   ├── recommendations/ # Recommendation system
│   │   │   └── firebase/ # Firebase integration
│   │   └── package.json
│   │
│   └── frontend/         # React application
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/     # Page components
│       │   ├── context/   # React context (state management)
│       │   ├── services/  # API services
│       │   └── styles/    # Global SCSS styles
│       └── package.json
│
└── packages/
    └── shared/           # Shared TypeScript types and DTOs
        └── src/
            └── index.ts
```

## Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Firebase Project** with Firestore enabled
- **Google OAuth Credentials** (for OAuth login)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-apply/apps
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Generate a service account key:
     - Go to Project Settings > Service Accounts
     - Click "Generate New Private Key"
     - Save the JSON file securely

4. **Set up Google OAuth**
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3001/api/auth/google/callback` (development)
     - Your production URL + `/api/auth/google/callback` (production)

5. **Configure environment variables**

   **Backend** (`apps/backend/.env`):
   ```env
   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
   # Or use path to service account file:
   # GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

   # Application Configuration
   PORT=3001
   NODE_ENV=development
   ```

   **Frontend** (`apps/frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_ENV=development
   ```

## Development

### Start Backend Server
```bash
cd apps/backend
pnpm start:dev
```
Backend runs on `http://localhost:3001`

### Start Frontend Development Server
```bash
cd apps/frontend
pnpm dev
```
Frontend runs on `http://localhost:5173`

### Build for Production

**Backend:**
```bash
cd apps/backend
pnpm build
pnpm start:prod
```

**Frontend:**
```bash
cd apps/frontend
pnpm build
pnpm preview
```

## Available Scripts

### Backend (`apps/backend`)
- `pnpm start:dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests

### Frontend (`apps/frontend`)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile

### Applications
- `GET /api/applications` - Get all applications (Admin/Leader)
- `GET /api/applications/my` - Get user's application
- `POST /api/applications` - Create/update application
- `PATCH /api/applications/:id/status` - Update application status (Admin)

### Recommendations
- `GET /api/recommendations` - Get all recommendations (Admin)
- `GET /api/recommendations/my` - Get leader's recommendations
- `POST /api/recommendations` - Create recommendation
- `PATCH /api/recommendations/:id/status` - Update recommendation status (Admin)
- `DELETE /api/recommendations/:id` - Delete recommendation (Leader)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/leader-status` - Update leader approval status

## User Flows

### Applicant Flow
1. Sign up or sign in
2. Complete profile (stake, ward, phone)
3. Fill out application form
4. Save draft or submit application
5. Wait for admin review
6. View application status (awaiting, approved, rejected)

### Leader Flow
1. Sign up or sign in as leader
2. Wait for admin approval
3. Once approved, view approved applications
4. Submit recommendations for applicants
5. Track recommendation status

### Admin Flow
1. Sign in as admin
2. View dashboard with analytics
3. Review pending applications and recommendations
4. Approve or reject submissions
5. Manage user roles and leader approvals
6. View all submissions by stake/ward

## Firebase Collections

### users
```typescript
{
  id: string
  email: string
  name: string
  role: 'applicant' | 'leader' | 'admin'
  stake?: string
  ward?: string
  phone?: string
  leaderStatus?: 'pending' | 'approved'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### applications
```typescript
{
  id: string
  userId: string
  name: string
  email: string
  phone: string
  age: number
  gender: 'male' | 'female'
  stake: string
  ward: string
  moreInfo?: string
  status: 'draft' | 'awaiting' | 'approved' | 'rejected'
  canEdit: boolean
  canDelete: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### recommendations
```typescript
{
  id: string
  leaderId: string
  leaderName: string
  leaderEmail: string
  applicantName: string
  applicantId: string
  stake: string
  ward: string
  recommendation: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Tokens stored in HTTP-only cookies
- **Role-Based Access Control**: Endpoints protected by role guards
- **Password Hashing**: Passwords hashed with bcrypt (if using email/password auth)
- **CORS Configuration**: Cross-origin requests properly configured
- **Environment Variables**: Sensitive data stored in environment variables

## Code Style

### React/JavaScript
- Functional components with hooks
- Arrow functions with const declarations
- ES6 modules with relative imports
- camelCase for JS variables/functions
- kebab-case for CSS class names
- SCSS with BEM-like naming (`component__element--modifier`)

### Backend/TypeScript
- NestJS modules and decorators
- DTOs for validation
- Guards for authentication and authorization
- Services for business logic
- Controllers for routing

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking:
   ```bash
   # Backend
   cd apps/backend
   pnpm lint
   pnpm typecheck
   
   # Frontend
   cd apps/frontend
   pnpm lint
   pnpm format:check
   ```
4. Build to ensure no errors:
   ```bash
   pnpm build
   ```
5. Commit your changes
6. Create a pull request

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
