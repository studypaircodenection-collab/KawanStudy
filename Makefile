# App Template

A modern Next.js starter template with authentication, UI components, and developer tooling.

## Quick Start

```bash
# Clone and setup
git clone <your-repo>
cd app-template
npm run setup

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local

# Start development
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run setup` - Install dependencies and check environment
- `npm run check:env` - Verify .env.local exists

## Environment Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Testing

### E2E Tests
```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run specific test
npx playwright test auth.spec.ts
```

Tests cover:
- Authentication flows (login, signup, password reset)
- Form validation
- Protected routes
- Responsive design
- Navigation

### Git Hooks
Pre-commit hooks automatically run:
- ESLint (fixes issues)
- Prettier (formats code)
- Type checking

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (protected)/       # Protected routes group
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Auth-related components
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase clients
│   └── context/           # React contexts
├── types/                 # TypeScript type definitions
├── email-templates/       # Custom email templates
└── tests/                 # E2E tests
```

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Supabase authentication (email, OAuth)
- ✅ Protected routes with server-side checks
- ✅ Form validation (React Hook Form + Zod)
- ✅ Dark/light mode support
- ✅ Custom email templates
- ✅ E2E testing with Playwright
- ✅ Git hooks for code quality
- ✅ Responsive design

## Development Workflow

1. **Setup**: Run `npm run setup` to install and check environment
2. **Development**: Use `npm run dev` for local development
3. **Testing**: Run `npm run test:e2e` before commits
4. **Git**: Pre-commit hooks ensure code quality
5. **Build**: `npm run build` validates production build

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

## Customization

### Branding
- Update `app/layout.tsx` for site metadata
- Customize colors in `tailwind.config.js`
- Replace email templates in `email-templates/`

### Authentication
- Configure OAuth providers in Supabase dashboard
- Customize auth pages in `app/auth/`
- Modify email templates and upload to Supabase

### Database
- Set up your database schema in Supabase
- Generate TypeScript types: `npx supabase gen types typescript`
- Add database queries in `lib/supabase/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Run `npm run lint` and `npm run test:e2e`
5. Submit a pull request

## Support

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## License

MIT
