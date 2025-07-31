# SmartNotes - Features Documentation

## Overview
SmartNotes is a comprehensive note-taking and collaboration platform built with Next.js, featuring rich text editing, team collaboration, and advanced organization tools.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with MongoDB adapter
- **Rich Text Editor**: TipTap with extensive extensions
- **UI Components**: Radix UI with custom styling
- **Email**: Nodemailer for notifications
- **Deployment**: Vercel-ready configuration

---

## Core Features

### 1. Authentication & User Management
- **User Registration & Login**
  - Email/password authentication
  - OAuth integration (Google, GitHub)
  - Email verification system
  - Password reset functionality
  - Secure session management

- **User Profile Management**
  - Profile editing and avatar upload
  - Account settings and preferences
  - Password change functionality

### 2. Rich Text Editor (TipTap)
- **Advanced Text Formatting**
  - Bold, italic, underline, strikethrough
  - Headings (H1-H4)
  - Text alignment (left, center, right, justify)
  - Text colors and highlighting
  - Subscript and superscript
  - Code formatting

- **Content Structure**
  - Bullet and numbered lists
  - Task lists with checkboxes
  - Blockquotes
  - Horizontal rules/dividers
  - Tables with headers
  - Image embedding

- **Advanced Features**
  - Link insertion and management
  - Typography enhancements
  - Character count tracking
  - Word count and reading time estimation
  - Auto-save functionality
  - Version control

### 3. Note Management
- **Note Operations**
  - Create, read, update, delete notes
  - Auto-save with visual indicators
  - Manual save (Ctrl+S) support
  - Duplicate note functionality
  - Note templates

- **Organization Features**
  - Folder-based organization
  - Tagging system with autocomplete
  - Starred/favorite notes
  - Search functionality (title, content, tags)
  - Sorting options (date, title, etc.)

- **Note Metadata**
  - Creation and modification timestamps
  - Word count and reading time
  - Content excerpts for previews
  - Version tracking

### 4. Collaboration & Sharing
- **Note Sharing**
  - Share notes with specific users
  - Permission levels (viewer, editor)
  - Public sharing with tokens
  - Collaborative editing
  - Real-time collaboration cursors

- **Team Management**
  - Create and manage teams
  - Team member roles (owner, admin, editor, viewer)
  - Team-specific notes and folders
  - Member invitation system
  - Team activity tracking

### 5. Folder Management
- **Folder Operations**
  - Create, rename, delete folders
  - Nested folder support (subfolders)
  - Move notes between folders
  - Folder-based filtering
  - Folder statistics (note count, starred count)

- **Team Folders**
  - Team-specific folder creation
  - Shared folder access
  - Folder permissions based on team roles

### 6. Search & Discovery
- **Advanced Search**
  - Full-text search across notes
  - Search by title, content, and tags
  - Filter by folder, starred status
  - Search within teams
  - Real-time search suggestions

- **Tag System**
  - Tag creation and management
  - Tag-based filtering
  - Tag usage statistics
  - Tag autocomplete

### 7. Dashboard & Navigation
- **Personal Dashboard**
  - Recent notes overview
  - Quick note creation
  - Statistics and metrics
  - Quick actions menu

- **Team Dashboard**
  - Team overview and statistics
  - Member management
  - Team activity feed
  - Quick team note creation

### 8. Mobile Responsiveness
- **Responsive Design**
  - Mobile-first approach
  - Touch-friendly interface
  - Optimized layouts for all screen sizes
  - Mobile-specific navigation patterns

### 9. Theme & Customization
- **Theme Support**
  - Light and dark mode
  - System theme detection
  - Theme persistence
  - Custom color schemes

### 10. Activity Tracking
- **Team Activity**
  - Note creation/editing logs
  - Member activity tracking
  - Team collaboration history
  - Activity feed with timestamps

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `POST /api/auth/verify-email` - Email verification

### Notes
- `GET /api/notes` - Get user notes with filtering/pagination
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note (soft/hard delete)
- `POST /api/notes/[id]/star` - Toggle note star status
- `GET /api/notes/search` - Search notes
- `GET /api/notes/starred` - Get starred notes
- `GET /api/notes/trash` - Get deleted notes

### Folders
- `GET /api/folders` - Get user folders with statistics
- `POST /api/folders` - Create new folder
- `PUT /api/folders/[id]` - Update folder
- `DELETE /api/folders/[id]` - Delete folder

### Teams
- `GET /api/teams` - Get user teams
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team
- `GET /api/teams/[id]/members` - Get team members
- `POST /api/teams/[id]/members` - Add team member
- `GET /api/teams/[id]/notes` - Get team notes
- `POST /api/teams/[id]/notes/create` - Create team note
- `GET /api/teams/[id]/activities` - Get team activities

### Sharing
- `GET /api/shared` - Get shared items
- `POST /api/shared` - Share note with users
- `GET /api/shared/[id]` - Get shared item details
- `PATCH /api/shared/[id]` - Update sharing permissions
- `DELETE /api/shared/[id]` - Remove sharing

### Tags
- `GET /api/tags` - Get user tags with statistics
- `POST /api/tags` - Get notes by tags

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password
- `GET /api/users/search` - Search users for sharing

### Utilities
- `POST /api/upload/image` - Upload images
- `GET /api/debug/*` - Debug endpoints (development)

---

## Database Models

### User Model
- Personal information (name, email, avatar)
- Authentication data (password hash, OAuth IDs)
- Email verification status
- Account preferences

### Note Model
- Content and metadata
- User/team ownership
- Folder and tag associations
- Sharing and collaboration settings
- Version control and timestamps

### Team Model
- Team information and settings
- Member management with roles
- Team statistics and activity

### Folder Model
- Folder hierarchy and organization
- User/team ownership
- Folder metadata and settings

### Activity Model
- Team activity logging
- Action types and descriptions
- User attribution and timestamps

---

## Security Features

### Authentication Security
- Password hashing with bcrypt
- JWT token management
- Session security
- OAuth integration

### Data Protection
- User data isolation
- Permission-based access control
- Secure API endpoints
- Input validation and sanitization

### Sharing Security
- Token-based public sharing
- Permission level enforcement
- Access control for team resources

---

## Performance Features

### Optimization
- Server-side rendering (SSR)
- Static generation where applicable
- Image optimization
- Code splitting and lazy loading

### Database
- Efficient MongoDB queries
- Proper indexing strategy
- Aggregation pipelines for statistics
- Connection pooling

### Caching
- API response caching
- Static asset caching
- Browser caching strategies

---

## Development Features

### Developer Experience
- TypeScript support
- ESLint configuration
- Hot reload development
- Comprehensive error handling

### Debugging
- Development-only debug endpoints
- Comprehensive logging
- Error tracking and reporting

### Testing
- API endpoint testing capabilities
- Component testing setup
- Integration testing support

---

## Deployment & Infrastructure

### Vercel Deployment
- Optimized for Vercel platform
- Environment variable management
- Automatic deployments
- Edge function support

### Database
- MongoDB Atlas integration
- Connection string management
- Database migration support

### Email Service
- Nodemailer integration
- Email template system
- Verification and notification emails

---

## Future Enhancements

### Planned Features
- Real-time collaborative editing
- Advanced search with filters
- Note templates and snippets
- Export functionality (PDF, Markdown)
- Advanced team permissions
- Integration with external services
- Mobile app development
- Offline support
- Advanced analytics and insights

### Technical Improvements
- Performance optimizations
- Enhanced security measures
- Better error handling
- Improved accessibility
- Advanced caching strategies

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- Email service (for notifications)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL
- Email service configuration
- OAuth provider credentials

---

This documentation provides a comprehensive overview of all the features implemented in your SmartNotes application. The platform offers a robust set of tools for personal note-taking and team collaboration, with a focus on user experience and security.