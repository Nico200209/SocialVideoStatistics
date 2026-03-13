export { default } from 'next-auth/middleware'

export const config = {
  // Protect every route except: login page, NextAuth API, static files
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
}
