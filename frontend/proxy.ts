import createMiddleware from "next-intl/middleware";

export default createMiddleware({
    locales: ['en', 'es'],
    localePrefix: 'as-needed',
    defaultLocale: 'en'
});

export const config = {
    matcher: ["/", "/((?!_next|api|images|fonts|favicon|manifest|sw|icons).*)"],
};