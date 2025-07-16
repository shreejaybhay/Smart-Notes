# Design Document

## Overview

The Shared Notes Dashboard is a comprehensive interface that centralizes all sharing and collaboration activities within SmartNotes. It provides users with a unified view of notes shared with them and notes they've shared with others, along with powerful management capabilities for permissions, invitations, and link sharing.

The design leverages the existing SmartNotes architecture, extending the current Note model's collaboration features and integrating seamlessly with the dashboard layout and component system.

## Architecture

### Component Hierarchy

```
SharedNotesPage
├── SharedNotesHeader
│   ├── PageTitle
│   ├── ShareButton (floating/fixed)
│   └── SearchAndFilters
├── SharedNotesTabs
│   ├── SharedWithMeTab
│   │   ├── PendingInvitations
│   │   │   └── InvitationCard[]
│   │   └── ActiveShares
│   │       └── SharedNoteCard[]
│   └── SharedByMeTab
│       └── MySharedNotes
│           └── MySharedNoteCard[]
├── ShareNoteModal (enhanced existing component)
├── EmptyStates
│   ├── EmptySharedWithMe
│   └── EmptySharedByMe
└── MobileOptimizations
    ├── SegmentedControl (tabs)
    └── FloatingActionButton
```

### Data Flow

1. **Initial Load**: Fetch shared notes data from multiple API endpoints
2. **Real-time Updates**: WebSocket or polling for invitation status changes
3. **State Management**: React Context for shared notes state
4. **Optimistic Updates**: Immediate UI feedback with server reconciliation

### API Integration

The design extends existing API patterns:
- `/api/notes/shared/with-me` - Notes shared with current user
- `/api/notes/shared/by-me` - Notes shared by current user  
- `/api/notes/invitations` - Pending invitations management
- `/api/notes/[id]/share` - Individual note sharing actions
- `/api/notes/[id]/collaborators` - Collaborator management

## Components and Interfaces

### SharedNotesPage Component

**Props Interface:**
```typescript
interface SharedNotesPageProps {
  initialData?: {
    sharedWithMe: SharedNote[];
    sharedByMe: SharedNote[];
    pendingInvitations: Invitation[];
  };
}
```

**State Management:**
```typescript
interface SharedNotesState {
  activeTab: 'shared-with-me' | 'shared-by-me';
  searchQuery: string;
  filters: {
    permission: 'all' | 'read' | 'write';
    status: 'all' | 'pending' | 'active';
  };
  isLoading: boolean;
  error: string | null;
}
```

### SharedNoteCard Component

**Props Interface:**
```typescript
interface SharedNoteCardProps {
  note: SharedNote;
  viewMode: 'received' | 'shared';
  onPermissionChange?: (noteId: string, userId: string, permission: Permission) => void;
  onRevokeAccess?: (noteId: string, userId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onDeclineInvitation?: (invitationId: string) => void;
}
```

**Card Layout:**
- **Header**: Note title, owner avatar/name, date shared
- **Body**: Permission badge, quick preview (excerpt)
- **Footer**: Action buttons (Open, Star, Manage, etc.)
- **Collaborators**: Avatar stack with "+N" overflow indicator

### Enhanced ShareNoteModal

Extends the existing `ShareNoteDialog` component with:
- Note/folder selection dropdown
- Team sharing capabilities
- Link generation with expiration settings
- Bulk invitation support
- Permission templates (Read-only team, Write access, etc.)

### PendingInvitations Component

**Features:**
- Prominent placement at top of "Shared with Me" tab
- Expandable/collapsible section
- Batch accept/decline actions
- Invitation preview with sender info and permissions

## Data Models

### Extended Note Model

The existing Note model already includes collaboration fields:
```javascript
// Existing fields in Note schema
collaborators: [{
  userId: ObjectId,
  permission: 'viewer' | 'editor' | 'owner',
  addedAt: Date
}],
isPublic: Boolean,
shareToken: String
```

### New Invitation Model

```javascript
const InvitationSchema = new mongoose.Schema({
  noteId: { type: ObjectId, ref: 'Note', required: true },
  inviterId: { type: ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true },
  inviteeId: { type: ObjectId, ref: 'User' }, // Set when user accepts
  permission: { type: String, enum: ['viewer', 'editor'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  token: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true },
  message: String, // Optional invitation message
  teamId: { type: ObjectId, ref: 'Team' } // For team invitations
}, { timestamps: true });
```

### SharedNote Interface (Frontend)

```typescript
interface SharedNote {
  _id: string;
  title: string;
  excerpt: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  permission: 'viewer' | 'editor' | 'owner';
  sharedAt: Date;
  lastModified: Date;
  collaborators: Collaborator[];
  isTeamNote: boolean;
  teamName?: string;
  tags: string[];
  wordCount: number;
  readingTime: number;
}

interface Collaborator {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  permission: 'viewer' | 'editor' | 'owner';
  addedAt: Date;
}

interface Invitation {
  _id: string;
  noteId: string;
  noteTitle: string;
  inviter: {
    name: string;
    email: string;
    avatar?: string;
  };
  permission: 'viewer' | 'editor';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
}
```

## Error Handling

### Client-Side Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

**Error Categories:**
1. **Network Errors**: Connection issues, API timeouts
2. **Permission Errors**: Insufficient access, expired tokens
3. **Validation Errors**: Invalid email addresses, malformed data
4. **Server Errors**: Database issues, internal server errors

### Error Recovery Strategies

- **Retry Logic**: Automatic retry for transient network errors
- **Graceful Degradation**: Show cached data when API is unavailable
- **User Feedback**: Clear error messages with actionable suggestions
- **Fallback UI**: Simplified interface when full features are unavailable

### Error States

```typescript
interface ErrorState {
  type: 'network' | 'permission' | 'validation' | 'server';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible: boolean;
}
```

## Testing Strategy

### Unit Testing

**Component Tests:**
- SharedNoteCard rendering with different props
- Permission change handlers
- Search and filter functionality
- Empty state displays

**Hook Tests:**
- useSharedNotes custom hook
- useInvitations management
- usePermissions validation

**Utility Tests:**
- Permission level calculations
- Date formatting helpers
- Avatar stack generation

### Integration Testing

**API Integration:**
- Shared notes fetching and caching
- Invitation CRUD operations
- Real-time updates handling
- Error response handling

**User Flow Tests:**
- Complete sharing workflow
- Invitation acceptance/decline
- Permission management
- Search and filtering

### End-to-End Testing

**Critical User Journeys:**
1. **Share Note Flow**: Select note → Choose recipients → Set permissions → Send invitations
2. **Accept Invitation Flow**: View invitation → Preview note → Accept → Access shared note
3. **Manage Permissions Flow**: View shared notes → Change permissions → Verify access changes
4. **Revoke Access Flow**: Select shared note → Remove collaborator → Confirm revocation

**Cross-Browser Testing:**
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design validation

### Performance Testing

**Metrics to Monitor:**
- Initial page load time
- Search response time
- Real-time update latency
- Memory usage with large datasets

**Load Testing Scenarios:**
- 100+ shared notes rendering
- Rapid permission changes
- Concurrent invitation processing
- Mobile performance under load

## Mobile Responsiveness

### Breakpoint Strategy

```css
/* Mobile First Approach */
.shared-notes-container {
  /* Base mobile styles */
}

@media (min-width: 640px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### Mobile-Specific Components

**SegmentedControl (Tabs):**
- Full-width tab switcher
- Touch-optimized tap targets
- Smooth transition animations

**FloatingActionButton:**
- Fixed position bottom-right
- Material Design elevation
- Accessible touch target (44px minimum)

**MobileNoteCard:**
- Simplified layout for small screens
- Swipe gestures for quick actions
- Collapsible details sections

### Touch Interactions

- **Swipe Actions**: Left swipe to reveal quick actions
- **Long Press**: Context menu for additional options
- **Pull to Refresh**: Update shared notes list
- **Infinite Scroll**: Load more notes on scroll

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation:**
- Tab order follows logical flow
- All interactive elements focusable
- Escape key closes modals
- Arrow keys navigate lists

**Screen Reader Support:**
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic updates
- Role attributes for custom components

**Visual Accessibility:**
- High contrast color schemes
- Scalable text (up to 200%)
- Focus indicators
- Color-blind friendly design

### Accessibility Features

```typescript
interface AccessibilityProps {
  'aria-label': string;
  'aria-describedby'?: string;
  'role'?: string;
  'tabIndex'?: number;
}
```

**Implementation Examples:**
- Skip links for main content
- Descriptive button labels
- Status announcements for actions
- Alternative text for avatars

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load heavy components
const ShareNoteModal = lazy(() => import('./ShareNoteModal'));
const AdvancedFilters = lazy(() => import('./AdvancedFilters'));
```

### Data Optimization

**Pagination Strategy:**
- Initial load: 20 notes per tab
- Infinite scroll: Load 10 more on demand
- Virtual scrolling for 100+ items

**Caching Strategy:**
- React Query for server state
- Local storage for user preferences
- Service worker for offline support

### Bundle Optimization

- Tree shaking for unused code
- Dynamic imports for route-based splitting
- Compression and minification
- CDN delivery for static assets

## Security Considerations

### Data Protection

**Sensitive Information:**
- Email addresses in invitations
- User avatars and names
- Note content previews
- Permission levels

**Security Measures:**
- Input sanitization for all user data
- XSS prevention in note content
- CSRF protection for state changes
- Rate limiting for API endpoints

### Access Control

**Permission Validation:**
- Server-side permission checks
- Token-based invitation system
- Expiring share links
- Audit logging for access changes

**Privacy Controls:**
- Granular sharing permissions
- Revocation capabilities
- Data retention policies
- User consent for data sharing