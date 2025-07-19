import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (32MB limit for ImgBB)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 32MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64 for ImgBB API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Create FormData for ImgBB API
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', 'db6accfc0a3b951f16d45a92c2a6b3af');
    imgbbFormData.append('image', base64);

    // Upload to ImgBB API
    const uploadResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('ImgBB API error:', errorText);
      }
      throw new Error(`Failed to upload image to ImgBB: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('ImgBB API response:', uploadResult);
    }

    if (!uploadResult.success) {
      throw new Error(uploadResult.error?.message || 'Image upload failed');
    }

    // Return the direct image URL
    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.data.url,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Image upload error:', error);
    }
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
