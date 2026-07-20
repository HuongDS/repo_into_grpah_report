import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: '/login', // Route đến trang login custom của chúng ta
  }
})

// Chặn TẤT CẢ các route, trừ các file tĩnh, API và trang login
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
