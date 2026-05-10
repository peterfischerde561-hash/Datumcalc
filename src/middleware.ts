import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    matcher: [
        '/', 
        '/(de|en)/:path*',
        '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|878dc35e0.*\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json)).*)'
    ]
};
