import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// 需要登录才能访问的路径
const PROTECTED_PATHS = ["/account", "/checkout"];
// 登录/注册页（已登录用户重定向到首页）
const AUTH_PATHS = ["/auth/login", "/auth/register"];

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(zh|en)(\/|$)/);
  return match ? match[1] : "zh";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.includes(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.includes(p));

  // 受保护路径：未登录则重定向到登录页
  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    if (!token) {
      const locale = getLocaleFromPath(pathname);
      const loginUrl = new URL(
        `/${locale}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // 登录/注册页：已登录则重定向到首页
  if (isAuthPage) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    if (token) {
      const locale = getLocaleFromPath(pathname);
      return NextResponse.redirect(new URL(`/${locale}/`, request.url));
    }
  }

  // 其余路径交给 next-intl 处理（locale 检测/重定向）
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(zh|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
