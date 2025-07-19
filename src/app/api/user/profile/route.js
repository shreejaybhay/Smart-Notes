import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, profileImage } = await request.json();

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Convert string ID to ObjectId if needed
    let userId = session.user.id;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    
    // Find and update user using Mongoose model
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    
    if (profileImage) {
      user.image = profileImage;
    }

    const savedUser = await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        profileImage: savedUser.image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}