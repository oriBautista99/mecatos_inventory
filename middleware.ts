import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export default createMiddleware(routing);


export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/",
    '/(es|en)/:path*',
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
