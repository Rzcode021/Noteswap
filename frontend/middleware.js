import { NextResponse } from 'next/server'

export default function middleware(request) {
  // Middleware disabled - using proxy configuration instead
  // Next.js 16 deprecated middleware.js files
  return NextResponse.next()
}