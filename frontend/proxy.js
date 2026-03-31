import { NextResponse } from 'next/server'

export function proxy() {
  // Empty proxy for Vercel compatibility
  // Next.js 16 proxy configuration
  return NextResponse.next()
}

export const config = {
  matcher: []
}