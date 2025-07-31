# SmartNotes - AI-Powered Note Taking Revolution

> Transform your scattered thoughts into an intelligent, connected knowledge system with AI-powered organization, smart linking, and contextual insights.

![SmartNotes Interface](https://i.postimg.cc/GtdrH5wp/Screenshot-2025-07-19-110313-1.jpg)

## ✨ What is SmartNotes?

SmartNotes is a next-generation note-taking application that uses artificial intelligence to automatically organize, connect, and surface your notes exactly when you need them. Stop losing brilliant ideas in messy notes and start building a truly intelligent knowledge system.

### 🎯 Key Features

- **🔗 AI-Powered Linking** - Automatically discovers connections between your notes
- **🔍 Intelligent Search** - Find notes by meaning, not just keywords
- **📝 Auto-Summarization** - Smart summaries for long notes
- **⚡ Smart Suggestions** - Contextual recommendations as you write
- **🎯 Context Awareness** - Notes surface at the right time
- **👥 Team Collaboration** - Real-time collaboration with shared workspaces
- **🌙 Dark/Light Mode** - Beautiful interface that adapts to your preference
- **📱 Responsive Design** - Works seamlessly across all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js with MongoDB adapter
- **Editor**: TipTap (Rich text editor with collaboration features)
- **UI Components**: Radix UI, Lucide React icons
- **Styling**: TailwindCSS with custom animations
- **Deployment**: Vercel-ready with production optimizations

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd note_flow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_SERVER_HOST=your_smtp_host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email
EMAIL_SERVER_PASSWORD=your_password
EMAIL_FROM=noreply@yourapp.com
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard pages
│   ├── login/            # Authentication pages
│   └── signup/
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix)
│   └── ...               # Feature-specific components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── models/               # MongoDB/Mongoose models
└── styles/               # Global styles

scripts/                  # Utility scripts
├── auto-update-api-calls.js
├── clean-content-type-headers.js
└── update-api-calls.js
```

## 🎨 Key Features Deep Dive

### AI-Powered Organization
- Automatic note categorization and tagging
- Smart folder suggestions based on content
- Intelligent note clustering and grouping

### Advanced Search
- Semantic search that understands context
- Full-text search across all notes
- Filter by tags, dates, and note types

### Rich Text Editor
- TipTap-powered editor with markdown support
- Real-time collaboration features
- Image uploads and media embedding
- Table support and formatting options

### Team Collaboration
- Shared workspaces and team management
- Real-time collaborative editing
- Permission-based access control
- Activity tracking and notifications

## 🚀 Deployment

### Production Environment Variables

For production deployment (Vercel), set these environment variables:

```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy automatically on every push

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 🔧 Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `node scripts/update-api-calls.js` - Check API call compatibility
- `node scripts/auto-update-api-calls.js` - Auto-update API calls for production

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Notes Endpoints
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Teams Endpoints
- `GET /api/teams` - Get user teams
- `POST /api/teams` - Create team
- `PUT /api/teams/[id]` - Update team
- `POST /api/teams/[id]/invite` - Invite team member

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **API Updates**: See [API_UPDATE_SUMMARY.md](API_UPDATE_SUMMARY.md)
- **Quick Fixes**: See [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Rich text editing powered by [TipTap](https://tiptap.dev/)

---

**Ready to revolutionize your note-taking?** Start building your intelligent knowledge system today! 🚀
