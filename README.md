# NoteFlow - Collaborative Note Taking Platform

NoteFlow is a modern, collaborative note-taking application built with Next.js 15. It provides powerful features for personal note management and team collaboration with real-time editing capabilities.

## ✨ Features

### 📝 Note Management

- **Rich Text Editing**: Create and edit notes with full formatting support
- **Advanced Search**: Search through notes by title, content, and tags with highlighting
- **Folder Organization**: Organize notes into custom folders with color coding and icons
- **Tags System**: Tag notes for better categorization and filtering
- **Starred Notes**: Mark important notes for quick access
- **Trash & Recovery**: Soft delete with recovery options

### 👥 Team Collaboration

- **Team Workspaces**: Create and manage teams with role-based permissions
- **Member Management**: Invite users with different roles (owner, admin, editor, viewer)
- **Team Notes**: Create notes that belong to teams with shared access
- **Activity Tracking**: Monitor team activities and note changes
- **Permission Control**: Fine-grained permissions for team operations

### 🔄 Sharing & Collaboration

- **Note Sharing**: Share individual notes with specific users
- **Permission Levels**: Control access with viewer/editor permissions
- **Shared Dashboard**: View all notes shared with you or by you
- **Collaboration History**: Track who has access to what

### � Authentication & Security

- **NextAuth.js**: Secure authentication with email/password
- **OAuth Support**: Google and GitHub login integration
- **Email Verification**: Account verification via email
- **Password Reset**: Secure password recovery system
- **Session Management**: Secure user sessions with proper middleware

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Email service (for verification and password reset)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd note_flow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # App URL (for production)
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Email Service (for verification and password reset)
   EMAIL_SERVER_HOST=your_smtp_host
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your_email
   EMAIL_SERVER_PASSWORD=your_email_password
   EMAIL_FROM=noreply@yourapp.com
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TailwindCSS 4** - Utility-first CSS framework
- **Shadcn UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **TipTap** - Rich text editor with collaboration

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication solution

### Development Tools

- **ESLint** - Code linting
- **Turbopack** - Fast bundler for development
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── notes/         # Notes CRUD operations
│   │   ├── teams/         # Team management
│   │   ├── folders/       # Folder operations
│   │   └── ...
│   ├── dashboard/         # Main application pages
│   │   ├── notes/         # Notes management
│   │   ├── shared/        # Shared notes
│   │   └── account/       # User settings
│   ├── login/             # Authentication pages
│   ├── signup/
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── editor/           # Rich text editor components
│   └── ...
├── lib/                  # Utility functions
│   ├── auth.js           # NextAuth configuration
│   ├── api.js            # API utilities
│   └── db.js             # Database connection
├── models/               # MongoDB schemas
│   ├── User.js
│   ├── Note.js
│   ├── Team.js
│   └── ...
└── styles/               # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Utility Scripts

- `node scripts/update-api-calls.js` - Check API calls for production compatibility
- `node scripts/auto-update-api-calls.js` - Automatically update API calls
- `node scripts/clean-content-type-headers.js` - Clean up unnecessary headers
- `node scripts/fix-team-folder-creators.js` - Fix team folder creator references

## 🚀 Deployment

### Vercel (Recommended)

1. **Set environment variables in Vercel dashboard:**

   ```env
   MONGODB_URI=your_production_mongodb_uri
   NEXTAUTH_SECRET=your_production_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

2. **Deploy:**

   ```bash
   npm run build
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

### Other Platforms

The application is compatible with any Node.js hosting platform. Make sure to:

- Set all required environment variables
- Use Node.js 18+
- Configure your MongoDB connection
- Set up email service for password reset

## 📚 API Documentation

### Core Endpoints

#### Notes API (`/api/notes`)

- `GET /api/notes` - List notes with filtering (folder, starred, search, pagination)
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note (soft delete)
- `GET /api/notes/search` - Advanced search with highlighting
- `GET /api/notes/starred` - Get starred notes
- `GET /api/notes/trash` - Get deleted notes

#### Teams API (`/api/teams`)

- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team
- `POST /api/teams/[id]/members` - Add team member
- `DELETE /api/teams/[id]/members/[userId]` - Remove member

#### Folders API (`/api/folders`)

- `GET /api/folders` - List folders with note counts
- `POST /api/folders` - Create new folder
- `PUT /api/folders/[id]` - Update folder
- `DELETE /api/folders/[id]` - Delete folder

#### Sharing API (`/api/shared`)

- `GET /api/shared` - Get shared notes (by me / with me)
- `POST /api/shared` - Share note with users
- `DELETE /api/shared/[id]` - Remove sharing

#### Authentication API (`/api/auth`)

- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address

## 📊 Data Models

### User Model

- Personal information (firstName, lastName, email)
- Authentication (password, OAuth IDs)
- Email verification and password reset tokens
- Account status and preferences

### Note Model

- Content (title, content, wordCount, readingTime)
- Organization (folder, tags, starred, archived)
- Ownership (userId, teamId, isTeamNote)
- Collaboration (collaborators with permissions)
- Metadata (version, lastViewedAt, shareToken)

### Team Model

- Basic info (name, description, slug, avatar, color)
- Ownership (ownerId)
- Members with roles (owner, admin, editor, viewer)
- Settings (public, approval required, max members)
- Statistics (totalNotes, totalMembers, lastActivity)

### Folder Model

- Organization (name, description, color, icon)
- Hierarchy (parentFolder support)
- Ownership (userId for personal, teamId for team folders)
- Settings (public, collaboration allowed)

### Activity Model

- Team activity tracking
- Action types (note_created, member_joined, etc.)
- Metadata and timestamps
- User and resource references

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions:

- Check the [Deployment Guide](DEPLOYMENT_GUIDE.md)
- Review the [API Update Summary](API_UPDATE_SUMMARY.md)
- Check the [Quick Fix Guide](QUICK_FIX_GUIDE.md)

## 🔧 Development

### Database Schema

The application uses MongoDB with Mongoose for data modeling. Key collections:

- `users` - User accounts and authentication
- `notes` - Note content and metadata
- `teams` - Team workspaces and member management
- `folders` - Note organization structure
- `activities` - Team activity logs

### Authentication Flow

1. User registration with email verification
2. Login with email/password or OAuth (Google/GitHub)
3. Session management with NextAuth.js
4. Password reset via email tokens
5. Middleware protection for authenticated routes

### Team Permissions

- **Owner**: Full control over team and all notes
- **Admin**: Manage members and team settings
- **Editor**: Create, edit, and delete notes
- **Viewer**: Read-only access to team notes

### Note Sharing

- Individual notes can be shared with specific users
- Permissions: viewer (read-only) or editor (can modify)
- Shared notes appear in recipient's "Shared with me" section
- Original owner maintains full control

---

Built with ❤️ using Next.js, React, and modern web technologies.
