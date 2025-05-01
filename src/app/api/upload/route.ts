// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // In a real scenario, you'd parse the FormData, process the file,
    // upload it to a storage service (like Firebase Storage, Cloudinary, S3),
    // and get the public URL.
    // const formData = await request.formData();
    // const file = formData.get('image') as File | null;
    // if (!file) {
    //   return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    // }
    // console.log('API: Received file:', file.name, file.size);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate success and return a fake URL
    const randomId = Math.random().toString(36).substring(7);
    // Using picsum.photos for a realistic-looking placeholder URL
    const mockUrl = `https://picsum.photos/seed/${randomId}/600/900`;
    console.log('API: Mock upload complete. URL:', mockUrl);

    return NextResponse.json({ imageUrl: mockUrl });

  } catch (error) {
    console.error('API Error during mock upload:', error);
    return NextResponse.json({ message: 'Mock upload failed' }, { status: 500 });
  }
}
