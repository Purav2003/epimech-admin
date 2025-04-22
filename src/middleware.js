import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // You'll need to add jose to your dependencies

export async function middleware(request) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // List of public routes that don't require auth
  const publicPaths = [
    '/login', 
    '/api/signup', 
    '/api/login', 
    '/api/verify-otp', 
    '/api/logout',
    '/api/send-email',
    // Add other public paths here
  ];

  // Check if the requested path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // If the path is public, allow access regardless of token
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If there's no token and the path isn't public, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify JWT token (optional but recommended for security)
    // This requires the 'jose' package: npm install jose
    if (process.env.JWT_SECRET) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      
      try {
        await jwtVerify(token, secret);
      } catch (error) {
        // If token verification fails, remove the invalid token and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.set('token', '', { 
          expires: new Date(0),
          path: '/'
        });
        return response;
      }
    }
    
    // Continue to the requested page
    return NextResponse.next();
    
  } catch (error) {
    // For any other errors, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon\\.ico|public/).*)',
  ],
};