import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import Note from "@/models/Note";

export async function PATCH(request, { params }) {
  try {
    console.log("PATCH /api/teams/[id]/notes/[noteId] - Starting request");

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session: Found");

    await connectDB();
    console.log("Connecting to database...");

    const teamId = params.id;
    const noteId = params.noteId;
    const { folder } = await request.json();

    console.log("Team ID from params:", teamId);
    console.log("Note ID from params:", noteId);
    console.log("Folder to move to:", folder);

    // Find the team and check access
    const team = await Team.findById(teamId).populate("ownerId", "firstName lastName email");
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    console.log("Team found:", team.name);

    // Check if user has access to this team
    const userId = session.user.id;
    const canUserAccess = (userId, team) => {
      console.log("canUserAccess - userId:", userId);
      console.log("canUserAccess - ownerId type:", typeof team.ownerId);
      console.log("canUserAccess - ownerId:", team.ownerId);

      const ownerIdString = team.ownerId._id ? team.ownerId._id.toString() : team.ownerId.toString();
      const userIdString = userId.toString();

      console.log("canUserAccess - ownerIdString:", ownerIdString);
      console.log("canUserAccess - userId string:", userIdString);
      console.log("canUserAccess - owner match:", ownerIdString === userIdString);

      if (ownerIdString === userIdString) {
        console.log("canUserAccess - Owner access granted");
        return true;
      }

      const member = team.members?.find(m => {
        const memberUserId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
        return memberUserId === userIdString;
      });

      console.log("canUserAccess - member found:", member ? "Yes" : "No");
      if (member) {
        console.log("canUserAccess - member status:", member.status);
        console.log("canUserAccess - final result:", member.status === "active");
        return member.status === "active";
      }

      return false;
    };

    if (!canUserAccess(userId, team)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("Access granted for user:", userId);

    // Find the note
    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check if this is a team note
    if (!note.teamId || note.teamId.toString() !== teamId) {
      return NextResponse.json({ error: "Note does not belong to this team" }, { status: 403 });
    }

    console.log("Note found and belongs to team");

    // Update the note's folder
    note.folder = folder || null;
    await note.save();

    console.log("Note folder updated successfully");

    return NextResponse.json({
      success: true,
      message: "Note moved successfully",
      note: {
        id: note._id,
        title: note.title,
        folder: note.folder
      }
    });

  } catch (error) {
    console.error("Error updating team note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
