import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { nextUrl, cookies } = request
    const { supabase, response } = await updateSession(request)
    const { data: { user } } = await supabase.auth.getUser()

    const isLoginPage = nextUrl.pathname === '/login'
    const isRegisterPage = nextUrl.pathname === '/register'
    const isAuthCallback = nextUrl.pathname.startsWith('/auth')

    if (!user && !isLoginPage && !isRegisterPage && !isAuthCallback) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
