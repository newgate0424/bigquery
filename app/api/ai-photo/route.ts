import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // เพิ่ม timestamp เพื่อไม่ให้ cache
    const timestamp = new Date().getTime();
    const response = await fetch(`https://thispersondoesnotexist.com/?${timestamp}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI photo');
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching AI photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI photo' },
      { status: 500 }
    );
  }
}
