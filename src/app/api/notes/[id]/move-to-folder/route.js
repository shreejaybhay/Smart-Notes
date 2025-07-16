import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import Team from "@/models/Team";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params; // Await params for NextJS 15
    const { folderId, folderName } = await request.json();

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check if user has permission to edit this note
    if (note.teamId) {
      // For team notes, check team permissions
      const team = await Team.findById(note.teamId);
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      const member = team.members.find(
        (m) => m.userId.toString() === session.user.id
      );
      if (!member || (member.role !== "owner" && member.role !== "editor")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // For personal notes, check ownership
      if (note.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Update the note's folder
    note.folder = folderName;
    note.folderId = folderId;
    await note.save();

    return NextResponse.json({
      success: true,
      message: `Note moved to ${folderName || "root"}`,
      note: {
        id: note._id,
        folder: note.folder,
        folderId: note.folderId,
      },
    });
  } catch (error) {
    console.error("Error moving note to folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
