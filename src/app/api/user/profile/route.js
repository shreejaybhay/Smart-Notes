import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Handle both OAuth and credential logins
    let user;
    if (session.user.email) {
      // For OAuth providers, find user by email
      user = await User.findOne({ email: session.user.email }).select('-password');
    } else {
      // For credential login, find by ID
      user = await User.findById(session.user.id).select('-password');
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



export async function PUT(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { firstName, lastName, image } = await request.json();

    // Validation
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json(
        { error: 'Names cannot be more than 50 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    // Only update image if provided
    if (image) {
      updateData.image = image;
    }

    // Handle both OAuth and credential logins for updates
    let user;
    if (session.user.email) {
      // For OAuth providers, find and update user by email
      user = await User.findOneAndUpdate(
        { email: session.user.email },
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    } else {
      // For credential login, find and update by ID
      user = await User.findByIdAndUpdate(
        session.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
