import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return a transparent 1x1 pixel PNG as fallback
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    
    return new NextResponse(transparentPixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error in icon route:', error)
    return new NextResponse(null, { status: 500 })
  }
}
