This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

This project uses Supabase for auth and some server-side features. Create a `.env.local` file (copy from `.env.example`) and fill in the values before running the app. Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL (public).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key (public).

If you use any server-only Supabase keys (for example a service role key), store them without the `NEXT_PUBLIC_` prefix and never commit them. See `.env.example` for a template.

Make sure `.env.local` is in your `.gitignore` (this repo ignores it by default).

## OAuth providers (Google & GitHub)

This template supports social auth via OAuth providers. If you want users to sign in with Google or GitHub you'll need to register OAuth apps in each provider's console and then wire the credentials into your Supabase project.

High level steps:

1. Create OAuth credentials in the provider console (Google / GitHub).
2. Add the provider Client ID and Client Secret in the Supabase Dashboard (Authentication -> Settings -> External OAuth providers).
3. Test sign-in locally or on your deployed domain.

Notes on redirect URIs

- If you use Supabase Auth (recommended), set the provider's redirect/callback URL to your Supabase project's callback URL:

  `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`

  You can find your Supabase project ref in the Supabase project settings. Supabase routes the OAuth response back to your app.

- For local testing you can either configure a separate OAuth credential that allows `http://localhost:3000` as an authorized origin, or use the Supabase redirect URL above and test via the routed domain. Provider consoles differ in whether they allow `localhost` in production credentials.

Google Cloud Console (create OAuth 2.0 Client ID)

1. Open https://console.cloud.google.com and create/select a project.
2. Navigate to APIs & Services -> OAuth consent screen and configure the consent screen (choose External or Internal depending on your audience). Add the email and app name, and set any required scopes (email, profile are typical).
3. Go to APIs & Services -> Credentials -> Create Credentials -> OAuth client ID.
4. Choose "Web application" and set the Authorized redirect URIs. If you use Supabase Auth, add:

   `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`

   Optionally add local URLs for development if you plan to run OAuth locally:

   `http://localhost:3000` (or a specific local callback if you handle it in-app)

5. Create the client and note the Client ID and Client Secret.

GitHub (register an OAuth App)

1. Go to https://github.com/settings/developers -> OAuth Apps -> New OAuth App.
2. Fill the Application name and Homepage URL (e.g. `http://localhost:3000` for dev or your deployed domain).
3. For Authorization callback URL use the Supabase callback URL if you're routing via Supabase:

   `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`

4. Register the app and copy the Client ID and Client Secret from the app settings.

Wiring credentials into Supabase

1. Open your Supabase project dashboard.
2. Go to Authentication -> Providers (or Settings -> External OAuth providers).
3. Find the provider (Google, GitHub) and paste the Client ID and Client Secret you obtained.
4. Save changes and test sign-in via the app (Sign in with Google / GitHub). Supabase will handle the OAuth flow and redirect back to your app.

Storing secrets

- Client IDs are public-ish, but Client Secrets must be kept private. Add them to the Supabase provider config in the Dashboard (not to client-side `.env` file). If you do need them locally for a custom provider flow, store them in a local `.env.local` and never commit that file.

Troubleshooting

- If you see redirect URI mismatch errors, verify the callback URL configured in the provider exactly matches what Supabase expects.
- For local development, create separate OAuth credentials or allow `localhost` origins where the provider console supports it.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
