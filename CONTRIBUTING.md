# Contributing to App Template

Thank you for considering contributing to this project! Here's how you can help.

## Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/app-template.git
   cd app-template
   ```

2. **Install Dependencies**

   ```bash
   npm run setup
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Fill in your Supabase test project credentials
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## Code Quality

This project uses automated tools to maintain code quality:

- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks for pre-commit checks
- **Playwright** - E2E testing

### Pre-commit Hooks

Before each commit, the following will run automatically:

- ESLint with auto-fix
- Prettier formatting
- Type checking

### Testing

Run tests before submitting PRs:

```bash
# E2E tests
npm run test:e2e

# Test specific features
npx playwright test auth.spec.ts
```

## Contribution Guidelines

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**

   - Follow existing code patterns
   - Add tests for new features
   - Update documentation if needed

3. **Test your changes**

   ```bash
   npm run lint
   npm run build
   npm run test:e2e
   ```

4. **Commit with descriptive messages**

   ```bash
   git commit -m "feat: add user profile management"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind CSS classes
- **File naming**: Use kebab-case for files, PascalCase for components
- **Imports**: Use absolute imports with `@/` prefix

### What to Contribute

**High Priority**

- Bug fixes
- Security improvements
- Performance optimizations
- Accessibility improvements
- Test coverage

**Medium Priority**

- New UI components
- Additional auth features
- Documentation improvements
- Example integrations

**Low Priority**

- Style improvements
- Code refactoring
- Additional tools/scripts

### Reporting Issues

When reporting bugs:

1. Use the issue template
2. Include steps to reproduce
3. Provide environment details
4. Add screenshots if relevant

### Feature Requests

For new features:

1. Check existing issues first
2. Describe the use case
3. Explain why it benefits the template
4. Consider implementation complexity

## Project Structure

Understanding the codebase:

```
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # Reusable UI components
├── lib/                # Utility libraries
├── types/              # TypeScript definitions
├── email-templates/    # Email templates for auth
└── tests/              # E2E tests
```

### Key Patterns

- **Server Components**: Used for data fetching and auth checks
- **Client Components**: Interactive UI with state management
- **Auth Context**: Centralized auth state management
- **Protected Routes**: Server-side auth validation
- **Form Validation**: Zod schemas with React Hook Form

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for general questions
- Check existing documentation first

Thank you for contributing! 🚀
