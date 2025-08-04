import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () { return !this.isTeamFolder; } // Only required for personal folders
  },
  // Team the folder belongs to (optional - for team folders)
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
    index: true
  },
  // Whether this is a team folder
  isTeamFolder: {
    type: Boolean,
    default: false,
    index: true
  },
  // Creator of team folder (for team folders only)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  color: {
    type: String,
    default: 'primary', // Default theme color
    enum: ['primary', 'secondary', 'accent', 'muted', 'destructive'] // Theme color validation
  },
  icon: {
    type: String,
    default: 'folder',
    maxlength: 50
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowCollaboration: {
      type: Boolean,
      default: false
    },
    defaultNoteTemplate: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
// Separate indexes for personal and team folders
FolderSchema.index({ userId: 1, name: 1 }, {
  unique: true,
  partialFilterExpression: { isTeamFolder: false }
}); // Unique personal folder names per user
FolderSchema.index({ teamId: 1, name: 1 }, {
  unique: true,
  partialFilterExpression: { isTeamFolder: true }
}); // Unique team folder names per team
FolderSchema.index({ userId: 1, createdAt: -1 });
FolderSchema.index({ userId: 1, parentFolder: 1 });
FolderSchema.index({ userId: 1, isArchived: 1 });
FolderSchema.index({ teamId: 1, isTeamFolder: 1 });
FolderSchema.index({ teamId: 1, createdAt: -1 });

// Virtual for note count (will be populated when needed)
FolderSchema.virtual('noteCount', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'folderId',
  count: true,
  match: { deleted: false }
});

// Methods
FolderSchema.methods.getNotesCount = async function () {
  const Note = mongoose.model('Note');
  return await Note.countDocuments({
    userId: this.userId,
    folder: this.name,
    deleted: false
  });
};

FolderSchema.methods.getStarredNotesCount = async function () {
  const Note = mongoose.model('Note');
  return await Note.countDocuments({
    userId: this.userId,
    folder: this.name,
    starred: true,
    deleted: false
  });
};

// Static methods
FolderSchema.statics.findByUser = function (userId) {
  return this.find({ userId, isTeamFolder: false, isArchived: false }).sort({ order: 1, createdAt: -1 });
};

FolderSchema.statics.findByTeam = function (teamId) {
  return this.find({ teamId, isTeamFolder: true, isArchived: false }).sort({ order: 1, createdAt: -1 });
};

FolderSchema.statics.findByUserWithStats = async function (userId) {
  const Note = mongoose.model('Note');

  // Get folders with note statistics
  const folders = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false }
    },
    {
      $lookup: {
        from: 'notes',
        let: { folderName: '$name', userId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] },
                  { $eq: ['$folder', '$$folderName'] },
                  { $eq: ['$deleted', false] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              starred: { $sum: { $cond: ['$starred', 1, 0] } },
              lastUpdated: { $max: '$updatedAt' }
            }
          }
        ],
        as: 'stats'
      }
    },
    {
      $addFields: {
        count: { $ifNull: [{ $arrayElemAt: ['$stats.count', 0] }, 0] },
        starred: { $ifNull: [{ $arrayElemAt: ['$stats.starred', 0] }, 0] },
        lastUpdated: { $ifNull: [{ $arrayElemAt: ['$stats.lastUpdated', 0] }, '$updatedAt'] }
      }
    },
    {
      $project: {
        stats: 0
      }
    },
    {
      $sort: { order: 1, createdAt: -1 }
    }
  ]);

  return folders;
};

// Pre-save middleware
FolderSchema.pre('save', function (next) {
  // Ensure folder name is unique per user
  if (this.isNew || this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

// Export model
const Folder = mongoose.models.Folder || mongoose.model('Folder', FolderSchema);
export default Folder;
