import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname === "/login"
  
  // Always allow API auth routes
  if (isApiAuthRoute) return undefined
  
  // If not logged in and trying to access a protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }
  
  // If logged in and trying to access login page, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return Response.redirect(new URL("/", nextUrl))
  }
  
  return undefined
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
