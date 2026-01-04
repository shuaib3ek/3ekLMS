import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/admin', '/instructor', '/learner'];
const publicRoutes = ['/login', '/', '/auth'];

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

    // 3. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/', req.nextUrl)); // Redirect to Landing/Login
    }

    // 5. Redirect to /dashboard if the user is authenticated and on login page?
    // We can leave this optional for now.

    // 6. RBAC (Simplistic)
    if (session?.role && path.startsWith('/admin') && session.role !== 'SUPER_ADMIN' && session.role !== 'ORG_ADMIN') {
        // Forbidden
        return NextResponse.redirect(new URL('/unauthorized', req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
