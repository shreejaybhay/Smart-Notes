import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
    }

    await connectDB();

    // Find user with the verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid-or-expired-token', request.url));
    }

    // Verify the email
    user.emailVerified = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?verified=true', request.url));

  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
}

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

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const { sendVerificationEmail } = await import('../../../../lib/email');
    await sendVerificationEmail(user.email, user.fullName, verificationToken);

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
