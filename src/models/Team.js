import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'pending'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date
  },
  permissions: {
    canCreateNotes: {
      type: Boolean,
      default: true
    },
    canEditNotes: {
      type: Boolean,
      default: true
    },
    canDeleteNotes: {
      type: Boolean,
      default: false
    },
    canInviteMembers: {
      type: Boolean,
      default: false
    },
    canManageTeam: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot be more than 100 characters'],
    minlength: [2, 'Team name must be at least 2 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  // Team owner (creator)
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Team members
  members: [TeamMemberSchema],
  // Team settings
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowPublicJoin: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    defaultMemberRole: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    },
    maxMembers: {
      type: Number,
      default: 50
    }
  },
  // Team branding
  avatar: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#6366f1',
    match: /^#[0-9A-F]{6}$/i
  },
  // Team statistics
  stats: {
    totalNotes: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 1
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  // Team status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
TeamSchema.index({ ownerId: 1, createdAt: -1 });
TeamSchema.index({ slug: 1 }, { unique: true });
TeamSchema.index({ 'members.userId': 1 });
TeamSchema.index({ isActive: 1, isArchived: 1 });
TeamSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to generate slug
TeamSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs and append number if needed
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Update member count
  this.stats.totalMembers = this.members.length;

  next();
});

// Instance methods
TeamSchema.methods.addMember = function (userId, role = 'viewer', invitedBy = null) {
  // Check if user is already a member
  const existingMember = this.members.find(member => {
    // Handle both populated and non-populated userId
    const memberUserId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
    return memberUserId === userId.toString();
  });

  if (existingMember) {
    throw new Error('User is already a member of this team');
  }

  // Set permissions based on role
  let permissions = {
    canCreateNotes: true,
    canEditNotes: role !== 'viewer',
    canDeleteNotes: ['owner', 'admin'].includes(role),
    canInviteMembers: ['owner', 'admin'].includes(role),
    canManageTeam: ['owner', 'admin'].includes(role)
  };

  this.members.push({
    userId,
    role,
    status: 'active', // Make members active immediately for development
    invitedBy,
    joinedAt: new Date(), // Set joined date
    permissions
  });

  return this.save();
};

TeamSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(member => {
    // Handle both populated and non-populated userId
    const memberUserId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
    return memberUserId !== userId.toString();
  });
  return this.save();
};

TeamSchema.methods.updateMemberRole = function (userId, newRole) {
  const member = this.members.find(member => {
    // Handle both populated and non-populated userId
    const memberUserId = member.userId._id ? member.userId._id.toString() : member.userId.toString();
    return memberUserId === userId.toString();
  });

  if (!member) {
    throw new Error('Member not found');
  }

  member.role = newRole;

  // Update permissions based on new role
  member.permissions = {
    canCreateNotes: true,
    canEditNotes: newRole !== 'viewer',
    canDeleteNotes: ['owner', 'admin'].includes(newRole),
    canInviteMembers: ['owner', 'admin'].includes(newRole),
    canManageTeam: ['owner', 'admin'].includes(newRole)
  };

  return this.save();
};

TeamSchema.methods.getMember = function (userId) {
  return this.members.find(member => {
    // Handle both populated and non-populated userId
    let memberUserId;

    if (typeof member.userId === 'object' && member.userId._id) {
      // Populated user object
      memberUserId = member.userId._id.toString();
    } else if (typeof member.userId === 'object' && member.userId.toString) {
      // ObjectId
      memberUserId = member.userId.toString();
    } else {
      // String
      memberUserId = member.userId;
    }

    const result = memberUserId === userId.toString();
    return result;
  });
};

TeamSchema.methods.canUserAccess = function (userId) {
  // Owner always has access - handle both populated and non-populated ownerId
  const ownerIdString = this.ownerId._id ? this.ownerId._id.toString() : this.ownerId.toString();

  if (ownerIdString === userId.toString()) {
    return true;
  }

  // Check if user is a member - use direct search instead of getMember
  const member = this.members.find(member => {
    let memberUserId;

    if (typeof member.userId === 'object' && member.userId._id) {
      // Populated user object
      memberUserId = member.userId._id.toString();
    } else if (typeof member.userId === 'object' && member.userId.toString) {
      // ObjectId
      memberUserId = member.userId.toString();
    } else {
      // String
      memberUserId = member.userId;
    }

    return memberUserId === userId.toString();
  });

  const hasAccess = member && member.status === 'active';
  return hasAccess;
};

TeamSchema.methods.canUserManage = function (userId) {
  // Owner can always manage - handle both populated and non-populated ownerId
  const ownerIdString = this.ownerId._id ? this.ownerId._id.toString() : this.ownerId.toString();
  if (ownerIdString === userId.toString()) {
    return true;
  }

  // Check member permissions
  const member = this.getMember(userId);
  return member && member.status === 'active' && member.permissions.canManageTeam;
};

// Static methods
TeamSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true, isArchived: false });
};

TeamSchema.statics.findUserTeams = function (userId) {
  return this.find({
    $or: [
      { ownerId: userId },
      { 'members.userId': userId, 'members.status': 'active' }
    ],
    isActive: true,
    isArchived: false
  }).sort({ createdAt: -1 });
};

// Virtual for member count
TeamSchema.virtual('memberCount').get(function () {
  return this.members.filter(member => member.status === 'active').length;
});

// Ensure virtual fields are serialized
TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

export default Team;
