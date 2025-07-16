import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  // Team this activity belongs to
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  
  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Type of activity
  type: {
    type: String,
    required: true,
    enum: [
      // Note activities
      'note_created',
      'note_edited',
      'note_deleted',
      'note_starred',
      'note_unstarred',
      'note_moved',
      
      // Member activities
      'member_invited',
      'member_joined',
      'member_left',
      'member_role_changed',
      'member_permissions_updated',
      
      // Team activities
      'team_created',
      'team_settings_changed',
      'team_name_changed',
      'team_description_updated',
      
      // Folder activities
      'folder_created',
      'folder_renamed',
      'folder_deleted',
      'notes_moved_to_folder'
    ],
    index: true
  },
  
  // Activity description/message
  description: {
    type: String,
    required: true
  },
  
  // Related resource (note, member, etc.)
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Resource type (note, user, folder, etc.)
  resourceType: {
    type: String,
    enum: ['note', 'user', 'folder', 'team'],
    default: null
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Visibility
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
ActivitySchema.index({ teamId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

// Static methods
ActivitySchema.statics.createActivity = async function(activityData) {
  const activity = new this(activityData);
  return await activity.save();
};

ActivitySchema.statics.getTeamActivities = function(teamId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    type = null,
    userId = null
  } = options;
  
  const query = { teamId, isVisible: true };
  
  if (type) query.type = type;
  if (userId) query.userId = userId;
  
  return this.find(query)
    .populate('userId', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Instance methods
ActivitySchema.methods.getFormattedMessage = function() {
  const user = this.userId;
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Someone';
  
  switch (this.type) {
    case 'note_created':
      return `${userName} created a note "${this.metadata.noteTitle}"`;
    case 'note_edited':
      return `${userName} edited "${this.metadata.noteTitle}"`;
    case 'note_deleted':
      return `${userName} deleted a note "${this.metadata.noteTitle}"`;
    case 'note_starred':
      return `${userName} starred "${this.metadata.noteTitle}"`;
    case 'note_unstarred':
      return `${userName} unstarred "${this.metadata.noteTitle}"`;
    case 'member_invited':
      return `${userName} invited ${this.metadata.invitedEmail} to the team`;
    case 'member_joined':
      return `${userName} joined the team`;
    case 'member_left':
      return `${userName} left the team`;
    case 'member_role_changed':
      return `${userName}'s role was changed to ${this.metadata.newRole}`;
    case 'team_created':
      return `${userName} created the team`;
    case 'team_name_changed':
      return `${userName} changed team name to "${this.metadata.newName}"`;
    case 'folder_created':
      return `${userName} created folder "${this.metadata.folderName}"`;
    case 'folder_renamed':
      return `${userName} renamed folder to "${this.metadata.newName}"`;
    case 'folder_deleted':
      return `${userName} deleted folder "${this.metadata.folderName}"`;
    default:
      return this.description;
  }
};

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

export default Activity;
