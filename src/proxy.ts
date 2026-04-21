import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const isAdmin = req.auth?.user?.role === "ADMIN"

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated)
      return NextResponse.redirect(new URL("/login", req.url))
    if (!isAdmin)
      return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith("/account")) {
    if (!isAuthenticated)
      return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}
