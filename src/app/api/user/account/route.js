import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Check if user exists
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // For now, we'll just delete the user account
    // In a production app, you might want to implement soft delete
    // or move user data to an archive before deletion
    
    try {
      // Delete the user account using Mongoose
      await User.findByIdAndDelete(session.user.id);

      return NextResponse.json({
        message: "Account deleted successfully"
      });
    } catch (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}