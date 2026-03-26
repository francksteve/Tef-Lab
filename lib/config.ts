export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  nextauthSecret: process.env.NEXTAUTH_SECRET!,
  nextauthUrl: process.env.NEXTAUTH_URL!,
  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  },
  adminEmail: process.env.ADMIN_EMAIL!,
  adminWhatsapp: process.env.ADMIN_WHATSAPP!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  inworldApiKey: process.env.INWORLD_API_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}
