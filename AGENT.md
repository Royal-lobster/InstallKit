
# Coding style

## Component Structure
- Composition over Ternaries: You prefer breaking down complex UI into smaller, focused components rather than using nested ternary operators for conditional rendering.
- Clean Component Hierarchy: Each component should have a single responsibility with clear separation of concerns.
- Proper Tailwind Integration: Using cn() utility for class name composition to ensure Tailwind's JIT compiler properly includes all classes.
- Explicit State Components: Separate components for different UI states (loading, empty, error, etc.) rather than inline conditional rendering.
- Typed Interfaces: Well-defined TypeScript interfaces for component props to ensure type safety.
- Declarative Approach: Components should express what they render rather than how they render it, making the code more readable.
- Data Handling: Ensure we are using react server components where possible and if we need client features we need to fetch initial data in server components and pass it to the client component with react query hook for polling / handling other data patterns

## Hook Structure
- Custom Hooks for Logic: Extracting complex logic into custom hooks (like usePagination, useClosePositions, usePositionModals).
- Single Responsibility: Each hook should handle one specific concern or related set of functionality.
- Clean API: Hooks should return a clean, well-structured object with named properties rather than arrays or complex nested structures.
- Reusability: Hooks should be designed for reuse across different components when possible.
- Separation from UI: Business logic should live in hooks, keeping components focused on rendering.
- Use tanstack query for async functions. When ever you see isLoading, isFetching, isSuccess, isError, etc. its a sign that you should use tanstack query.

## Overall Code Style
- Readability First: Code should be easy to understand at a glance, avoiding clever tricks that sacrifice clarity.
- Explicit over Implicit: Prefer explicit, descriptive code over implicit or overly concise approaches.
- Consistent Patterns: Following consistent patterns throughout the codebase for similar functionality.
- Modular Design: Breaking down complex features into modular, composable pieces.
- Avoiding Repetition: Using composition and abstraction to avoid duplicating code.
- This approach results in a codebase that's more maintainable, testable, and easier for team members to understand and contribute to.

## Folder Structure Rules

### Page Organization
- Use route groups (in parentheses) to organize related pages and shared layouts
- Co-locate components, hooks, and schemas with their respective pages in dedicated folders:
  - `_components/`: UI components specific to the page
  - `_hooks/`: Custom hooks specific to the page functionality
  - `_schema/`: Zod schemas and TypeScript types for the page
  - `_actions.ts`: Server actions for the page
- Keep files under 500 lines of code - if a file exceeds this limit, break it down into smaller, more focused components

### Component Naming Conventions
- Use `.server.tsx` suffix for server components
- Use `.loading.tsx` suffix for loading state components
- Name components based on their functionality, not their visual appearance
- Group related component variants with consistent naming (e.g., `agents-table.tsx`, `agents-table.server.tsx`, `agents-table.loading.tsx`)

### Feature Organization
- Organize complex features into nested directories with their own _components, _hooks, and _schema folders
- For deeply nested features (like agent proposals), maintain consistent structure at each level
- Use layout.tsx files to define shared UI elements for nested routes

### Internationalization
- Ensure all user-facing text is wrapped in translation functions
- Store translations in src/messages/{locale}.json files
- Keep translation keys organized by feature/page for easier maintenance
- Update all language files when adding new text

### Shared Components
- Place truly reusable components in the root `/components` directory
- Organize UI primitives in `/components/ui`
- Place shared icons in `/components/icons`
- Use `/components/shared` for business-specific reusable components

### Code Organization Principles
- Prefer co-location over centralization for better discoverability
- Keep related code close together in the file tree
- Maintain consistent patterns at each level of nesting
- Split complex components into smaller pieces rather than creating large files
- Use explicit naming over clever abbreviations
