import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { nextUrl } = request
    const { supabase, response } = await updateSession(request)
    const { data: { user } } = await supabase.auth.getUser()

    const isLoginPage = nextUrl.pathname === '/login'
    const isRegisterPage = nextUrl.pathname === '/register'
    const isConfirmPage = nextUrl.pathname === '/confirm-email'
    const isAuthCallback = nextUrl.pathname.startsWith('/auth')
    const isOnboarding = nextUrl.pathname.startsWith('/onboarding')
    const isApi = nextUrl.pathname.startsWith('/api')

    // Not logged in → redirect to login (except public pages)
    if (!user && !isLoginPage && !isRegisterPage && !isConfirmPage && !isAuthCallback && !isApi) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Already logged in → redirect away from login
    if (user && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Logged in but no school → redirect to onboarding
    if (user && !isOnboarding && !isAuthCallback && !isLoginPage && !isRegisterPage && !isApi) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('school_id')
            .eq('id', user.id)
            .maybeSingle()

        if (profile && !profile.school_id) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
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
