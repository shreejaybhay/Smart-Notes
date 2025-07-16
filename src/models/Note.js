import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Content cannot be more than 50,000 characters']
  },
  // User who owns the note
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  // Author of the note (alias for userId, for team notes)
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Team the note belongs to (optional)
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
    index: true
  },
  // Whether this is a team note
  isTeamNote: {
    type: Boolean,
    default: false,
    index: true
  },
  // Team-specific metadata
  teamMetadata: {
    teamName: String,
    createdByRole: String
  },
  // Organization
  folder: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, 'Folder name cannot be more than 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  // Status
  starred: {
    type: Boolean,
    default: false,
    index: true
  },
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  // Sharing and collaboration
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['viewer', 'editor', 'owner'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number,
    default: 0 // in minutes
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  },
  // Version control
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for better performance
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, starred: 1 });
NoteSchema.index({ userId: 1, folder: 1 });
NoteSchema.index({ userId: 1, tags: 1 });
NoteSchema.index({ userId: 1, deleted: 1 });
NoteSchema.index({ title: 'text', content: 'text' }); // Text search
NoteSchema.index({ shareToken: 1 }, { unique: true, sparse: true }); // Sparse unique index for shareToken

// Pre-save middleware to calculate word count and reading time
NoteSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;

    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

// Instance methods
NoteSchema.methods.generateShareToken = function () {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  return this.shareToken;
};

NoteSchema.methods.addCollaborator = function (userId, permission = 'viewer') {
  const existingCollaborator = this.collaborators.find(
    collab => collab.userId.toString() === userId.toString()
  );

  if (existingCollaborator) {
    existingCollaborator.permission = permission;
  } else {
    this.collaborators.push({ userId, permission });
  }
};

NoteSchema.methods.removeCollaborator = function (userId) {
  this.collaborators = this.collaborators.filter(
    collab => collab.userId.toString() !== userId.toString()
  );
};

NoteSchema.methods.canUserAccess = function (userId, requiredPermission = 'viewer', userTeamMember = null) {
  // Owner has full access
  if (this.userId.toString() === userId.toString()) {
    return true;
  }

  // Check team access if note belongs to a team
  if (this.teamId && userTeamMember) {
    const permissions = ['viewer', 'editor', 'admin', 'owner'];
    const userPermissionLevel = permissions.indexOf(userTeamMember.role);
    const requiredPermissionLevel = permissions.indexOf(requiredPermission);

    if (userPermissionLevel >= requiredPermissionLevel) {
      return true;
    }
  }

  // Check collaborator permissions
  const collaborator = this.collaborators.find(
    collab => collab.userId.toString() === userId.toString()
  );

  if (!collaborator) return false;

  const permissions = ['viewer', 'editor', 'owner'];
  const userPermissionLevel = permissions.indexOf(collaborator.permission);
  const requiredPermissionLevel = permissions.indexOf(requiredPermission);

  return userPermissionLevel >= requiredPermissionLevel;
};

// Static methods
NoteSchema.statics.findByUser = function (userId, options = {}) {
  const query = {
    userId,
    deleted: false,
    ...options
  };
  return this.find(query).sort({ updatedAt: -1 });
};

NoteSchema.statics.findStarred = function (userId) {
  return this.find({
    userId,
    starred: true,
    deleted: false
  }).sort({ updatedAt: -1 });
};

NoteSchema.statics.findByFolder = function (userId, folder) {
  return this.find({
    userId,
    folder,
    deleted: false
  }).sort({ updatedAt: -1 });
};

NoteSchema.statics.searchNotes = function (userId, searchTerm) {
  return this.find({
    userId,
    deleted: false,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  }).sort({ updatedAt: -1 });
};

NoteSchema.statics.findByTeam = function (teamId, options = {}) {
  const query = {
    teamId,
    deleted: false,
    ...options
  };
  return this.find(query).sort({ updatedAt: -1 });
};

NoteSchema.statics.findUserAndTeamNotes = function (userId, teamIds = []) {
  const query = {
    $or: [
      { userId, teamId: null }, // Personal notes
      { teamId: { $in: teamIds } } // Team notes
    ],
    deleted: false
  };
  return this.find(query).sort({ updatedAt: -1 });
};

// Virtual for excerpt
NoteSchema.virtual('excerpt').get(function () {
  if (!this.content) return '';
  const plainText = this.content.replace(/<[^>]*>/g, '');
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
});

// Ensure virtual fields are serialized
NoteSchema.set('toJSON', {
  virtuals: true,
  transform: function (_, ret) {
    delete ret.__v;
    return ret;
  }
});

// Additional indexes for team support
NoteSchema.index({ teamId: 1, updatedAt: -1 });
NoteSchema.index({ teamId: 1, userId: 1 });
NoteSchema.index({ teamId: 1, deleted: 1, updatedAt: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
