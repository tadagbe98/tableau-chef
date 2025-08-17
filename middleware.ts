import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'fr', 'it', 'pt'],
  defaultLocale: 'fr'
});
 
export const config = {
  matcher: ['/', '/(en|fr|it|pt)/:path*']
};