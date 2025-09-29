# Agent Guidelines for vibe-apply

## Commands
- **Build**: `pnpm build`
- **Dev server**: `pnpm dev`
- **Preview**: `pnpm preview`
- **No lint/test commands configured** - add ESLint/Prettier if needed

## Code Style
- **React**: Hooks, functional components, controlled inputs
- **Imports**: ES6 modules, relative paths with `../../`
- **Functions**: Arrow functions, const declarations
- **Async**: async/await with try/catch/finally blocks
- **Styling**: SCSS with BEM-like class naming (`component__element--modifier`)
- **Components**: forwardRef with displayName for ref-forwarding
- **State**: Context API + localStorage, no external state libs
- **Naming**: camelCase for JS, kebab-case for CSS classes
- **Error handling**: Throw Error objects, catch and display user-friendly messages
- **No TypeScript** - use .jsx extension
- **No linting/formatting** - maintain consistent style manually