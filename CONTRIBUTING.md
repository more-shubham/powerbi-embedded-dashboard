# Contributing

Thank you for your interest in contributing to Power BI Embedded Dashboard!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/more-shubham/powerbi-embedded-dashboard.git
   cd powerbi-embedded-dashboard
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm lint     # Run ESLint
```

## Project Structure

- `src/contexts/` - React Context for state management
- `src/components/PowerBI/` - Power BI specific components
- `src/lib/` - Business logic and utilities
- `src/types/` - TypeScript type definitions

## Pull Request Process

1. Ensure your code passes linting: `pnpm lint`
2. Ensure the build succeeds: `pnpm build`
3. Update documentation if needed
4. Create a Pull Request with a clear description

## Code Style

- Use TypeScript strict mode
- Follow existing patterns in the codebase
- Use the `usePowerBI()` hook for state access
- Use type guards from `src/lib/powerbi-type-guards.ts` for Power BI API calls

## Reporting Issues

When reporting issues, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
