import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Team from '@/models/Team';
import mongoose from 'mongoose';

// GET /api/notes/[id]/permissions - Get user's permissions for a specific note
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find the note
    const note = await Note.findOne({
      _id: id,
      deleted: false
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    let userRole = 'viewer';
    let canEdit = false;
    let canShare = false;
    let canDelete = false;
    let teamRole = null;
    let collaboratorRole = null;
    let accessSource = 'none';

    // Check if user is the owner
    if (note.userId.toString() === session.user.id) {
      userRole = 'owner';
      canEdit = true;
      canShare = true;
      canDelete = true;
      accessSource = 'owner';
    } else {
      // Check BOTH collaborator and team permissions, then use the highest
      
      // 1. Check if user is a direct collaborator
      const collaborator = note.collaborators.find(
        collab => collab.userId.toString() === session.user.id
      );

      if (collaborator) {
        collaboratorRole = collaborator.permission; // 'viewer' or 'editor'
      }

      // 2. Check team permissions if it's a team note
      let teamMember = null;
      if (note.isTeamNote && note.teamId) {
        const team = await Team.findById(note.teamId);
        if (team) {
          teamMember = team.members.find(member => {
            let memberUserId;
            if (typeof member.userId === 'object' && member.userId._id) {
              memberUserId = member.userId._id.toString();
            } else if (typeof member.userId === 'object' && member.userId.toString) {
              memberUserId = member.userId.toString();
            } else {
              memberUserId = member.userId;
            }
            return memberUserId === session.user.id && member.status === 'active';
          });

          if (teamMember) {
            teamRole = teamMember.role;
          }
        }
      }

      // 3. Resolve permissions - HIGHEST PERMISSION WINS
      const permissionLevels = {
        'viewer': 1,
        'editor': 2,
        'admin': 3,
        'owner': 4
      };

      let finalPermissionLevel = 0;
      let finalRole = 'viewer';

      // Check collaborator permission level
      if (collaboratorRole) {
        const collabLevel = permissionLevels[collaboratorRole] || 1;
        if (collabLevel > finalPermissionLevel) {
          finalPermissionLevel = collabLevel;
          finalRole = collaboratorRole;
          accessSource = 'direct-share';
        }
      }

      // Check team permission level
      if (teamRole) {
        const teamLevel = permissionLevels[teamRole] || 1;
        if (teamLevel > finalPermissionLevel) {
          finalPermissionLevel = teamLevel;
          finalRole = teamRole;
          accessSource = 'team';
        } else if (collaboratorRole && teamLevel <= finalPermissionLevel) {
          // Keep direct share as source if it's higher or equal
          accessSource = 'direct-share';
        }
      }

      // If no permissions found, deny access
      if (finalPermissionLevel === 0 && !collaboratorRole && !teamRole) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Set final permissions based on highest role
      userRole = finalRole;
      canEdit = finalPermissionLevel >= 2; // editor and above
      canShare = finalPermissionLevel >= 2; // editor and above  
      canDelete = finalPermissionLevel >= 3; // admin and above (team only)
    }

    // Final access check
    let userTeamMember = null;
    if (note.isTeamNote && note.teamId) {
      const team = await Team.findById(note.teamId);
      if (team) {
        userTeamMember = team.members.find(member => {
          let memberUserId;
          if (typeof member.userId === 'object' && member.userId._id) {
            memberUserId = member.userId._id.toString();
          } else if (typeof member.userId === 'object' && member.userId.toString) {
            memberUserId = member.userId.toString();
          } else {
            memberUserId = member.userId;
          }
          return memberUserId === session.user.id && member.status === 'active';
        });
      }
    }

    if (!note.canUserAccess(session.user.id, 'viewer', userTeamMember)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      role: userRole,
      canEdit,
      canShare,
      canDelete,
      isOwner: userRole === 'owner',
      isTeamNote: note.isTeamNote,
      teamId: note.teamId,
      accessSource, // 'owner', 'direct-share', 'team', 'none'
      teamRole, // User's role in the team (if applicable)
      collaboratorRole, // User's direct share permission (if applicable)
      permissionDetails: {
        hasTeamAccess: !!teamRole,
        hasDirectShare: !!collaboratorRole,
        effectivePermission: userRole,
        teamPermission: teamRole,
        directSharePermission: collaboratorRole
      }
    });

  } catch (error) {
    console.error('Error checking note permissions:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
}