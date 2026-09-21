import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect(new URL('/apple-touch-icon.png', 'https://www.chaletexpress.com'))
}