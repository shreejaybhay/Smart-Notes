import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { sendPasswordResetEmail } from '../../../../lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Always return success to prevent email enumeration
    if (!user) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No user found with this email');
      }
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Check if user has a password (not OAuth only)
    if (!user.password) {
      // Check if user has OAuth providers
      const hasGithub = user.githubId;
      const hasGoogle = user.googleId;

      if (hasGithub || hasGoogle) {
        const providers = [];
        if (hasGithub) providers.push('GitHub');
        if (hasGoogle) providers.push('Google');

        return NextResponse.json(
          {
            error: `This account was created using ${providers.join(' and ')}. Please sign in using ${providers.join(' or ')} instead of a password.`,
            isOAuthAccount: true
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.fullName, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
