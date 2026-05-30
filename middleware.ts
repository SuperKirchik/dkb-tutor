import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("tutor_token")?.value;
  const role = request.cookies.get("tutor_role")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/schedule/:path*", "/homework/:path*", "/lesson/:path*", "/profile/:path*", "/admin/:path*"],
};
