# Contributing to TakeOver 🎉

Thank you for your interest in contributing to TakeOver! We welcome contributions from everyone, whether it's adding new apps, fixing bugs, improving documentation, or suggesting new features.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Adding New Apps](#adding-new-apps)
- [Development Setup](#development-setup)
- [Testing Your Changes](#testing-your-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Style Guidelines](#style-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🤔 How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in [Issues](https://github.com/Royal-lobster/Takeover/issues)
- If not, create a new issue with a clear title and description
- Include steps to reproduce, expected behavior, and actual behavior
- Add screenshots if applicable

### Suggesting Enhancements

- Check if the enhancement has already been suggested
- Create a new issue with the `enhancement` label
- Clearly describe the feature and its benefits

### Adding New Apps

This is the most common and welcome contribution! See the detailed guide below.

## 🚀 Adding New Apps

### Step 1: Verify the App Exists in Homebrew

Before adding an app, verify it's available in Homebrew:

```bash
# For GUI applications (casks)
brew search --cask app-name

# For CLI tools (formulae)
brew search app-name

# Get detailed info
brew info --cask app-name
# or
brew info app-name
```

### Step 2: Choose the Correct Category

Apps are organized into these categories:

- `browsers` - Web browsers (Chrome, Firefox, etc.)
- `development` - Development tools (VS Code, Docker, etc.)
- `productivity` - Productivity apps (Notion, Todoist, etc.)
- `communication` - Messaging and video chat (Slack, Discord, etc.)
- `media` - Media players and streaming (Spotify, VLC, etc.)
- `utilities` - System utilities (AppCleaner, Rectangle, etc.)
- `security` - Security and VPN apps (NordVPN, 1Password, etc.)
- `design` - Design and creative tools (Figma, Sketch, etc.)
- `cli` - Command-line tools (git, fzf, ripgrep, etc.)
- `languages` - Programming languages (Node.js, Python, etc.)
- `package-managers` - Package managers (npm, pnpm, poetry, etc.)

### Step 3: Add the App to `lib/data/apps.ts`

Open `lib/data/apps.ts` and add your app to the appropriate category array:

```typescript
// Example: Adding to DEVELOPMENT_APPS
const DEVELOPMENT_APPS: Array<App> = [
  // ... existing apps ...
  {
    id: 'my-awesome-app', // Unique ID (lowercase, hyphen-separated)
    name: 'My Awesome App', // Display name
    brewName: 'my-awesome-app', // EXACT Homebrew cask/formula name
    category: AppCategoryEnum.enum.development,
    description: 'Brief description of what the app does',
    iconUrl: simpleIcon('myawesomeapp'), // Icon source (see Icon Guide below)
    isCask: true, // true for GUI apps, false for CLI tools
    invertInDark: false, // Optional: set to true if icon needs inversion in dark mode
  },
]
```

### App Object Properties

| Property       | Type        | Required | Description                                                   |
| -------------- | ----------- | -------- | ------------------------------------------------------------- |
| `id`           | string      | ✅       | Unique identifier (lowercase, kebab-case)                     |
| `name`         | string      | ✅       | Display name of the app                                       |
| `brewName`     | string      | ✅       | Exact Homebrew cask/formula name (verify with `brew info`)    |
| `category`     | AppCategory | ✅       | Category from `AppCategoryEnum`                               |
| `description`  | string      | ✅       | Brief description (50-70 characters recommended)              |
| `iconUrl`      | string      | ✅       | Icon URL using helper functions                               |
| `isCask`       | boolean     | ✅       | `true` for GUI apps (casks), `false` for CLI tools (formulae) |
| `invertInDark` | boolean     | ❌       | Set to `true` if icon should be inverted in dark mode         |

### Icon Guide

TakeOver uses two icon helper functions:

#### 1. `simpleIcon(iconName)`

For brand icons from [Simple Icons](https://simpleicons.org/):

```typescript
iconUrl: simpleIcon('visualstudiocode') // VS Code
iconUrl: simpleIcon('docker') // Docker
iconUrl: simpleIcon('spotify') // Spotify
```

**Finding the icon name:**

1. Visit [simpleicons.org](https://simpleicons.org/)
2. Search for your app
3. Use the exact slug shown (usually lowercase, no spaces)

#### 2. `favicon(domain)`

For favicons from websites:

```typescript
iconUrl: favicon('code.visualstudio.com') // VS Code website favicon
iconUrl: favicon('docker.com') // Docker website favicon
iconUrl: favicon('notion.so') // Notion website favicon
```

**When to use favicon vs simpleIcon:**

- Prefer `simpleIcon()` when available (consistent, high-quality SVG icons)
- Use `favicon()` for apps not in Simple Icons or when the website has a better logo

#### Dark Mode Icons

Some icons (especially light-colored or white icons) need to be inverted in dark mode:

```typescript
{
  iconUrl: simpleIcon('github'),
  invertInDark: true,  // GitHub's icon is white, needs inversion
}
```

### Step 4: Verify Your Addition

#### Run the Homebrew Verification Script

This script checks that all `brewName` values exist in Homebrew:

```bash
node scripts/verify-homebrew-packages.mjs
```

If your app is not found, double-check the `brewName` value:

```bash
# Get the exact name
brew info --cask your-app-name
# or
brew info your-app-name
```

#### Run the Icon Detection Script

This script analyzes icons and suggests which ones might need `invertInDark: true`:

```bash
node scripts/detect-dark-icons.mjs
```

#### Test Locally

```bash
pnpm dev
```

1. Open http://localhost:3000
2. Navigate to your app's category
3. Verify the app appears correctly
4. Check the icon loads properly in both light and dark modes
5. Select the app and verify the generated Homebrew command is correct

### Step 5: Maintain Alphabetical Order (Optional but Appreciated)

Within each category array, apps are loosely organized. Keeping them alphabetically sorted helps with maintenance:

```typescript
const DEVELOPMENT_APPS: Array<App> = [
  // A
  { id: 'alacritty', name: 'Alacritty', ... },
  { id: 'android-studio', name: 'Android Studio', ... },

  // C
  { id: 'cursor', name: 'Cursor', ... },

  // D
  { id: 'docker', name: 'Docker Desktop', ... },
  // ...
]
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended)
- Git

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork:**

```bash
git clone https://github.com/YOUR_USERNAME/Takeover.git
cd Takeover
```

3. **Add upstream remote:**

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/Takeover.git
```

4. **Install dependencies:**

```bash
pnpm install
```

5. **Create a branch:**

```bash
git checkout -b feature/add-my-apps
```

## 🧪 Testing Your Changes

### Manual Testing Checklist

- [ ] App appears in the correct category
- [ ] App icon loads correctly
- [ ] Icon displays correctly in dark mode (toggle dark mode to test)
- [ ] App description is clear and concise
- [ ] Selecting the app updates the command at the bottom
- [ ] Generated Homebrew command is correct (contains correct `--cask` flag)
- [ ] Search functionality finds your app

### Automated Verification

```bash
# Verify Homebrew packages
node scripts/verify-homebrew-packages.mjs

# Check for dark mode icon issues
node scripts/detect-dark-icons.mjs

# Run linter
pnpm lint

# Format code
pnpm format
```

## 📤 Submitting a Pull Request

### Before Submitting

1. ✅ Run all verification scripts
2. ✅ Test your changes locally
3. ✅ Ensure code follows style guidelines
4. ✅ Update documentation if needed
5. ✅ Commit with clear, descriptive messages

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add Raycast and Linear to productivity apps
fix: correct Docker brewName from 'docker' to 'docker-desktop'
docs: update contributing guide with icon examples
chore: update dependencies
```

**Types:**

- `feat:` - New feature (adding apps, new functionality)
- `fix:` - Bug fix (correcting app info, fixing broken features)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic changes)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. **Push your changes:**

```bash
git add .
git commit -m "feat: add 10 new productivity apps"
git push origin feature/add-my-apps
```

2. **Create a Pull Request** on GitHub with:
   - Clear title following commit message format
   - Description of changes
   - List of apps added (if applicable)
   - Screenshots (if UI changes)
   - Verification that scripts passed

3. **Example PR Template:**

```markdown
## Description

Added 5 new development tools to the development category.

## Apps Added

- [ ] Cursor - AI-first code editor
- [ ] Warp - Modern terminal with AI
- [ ] DevToys - Swiss Army knife for developers
- [ ] Proxyman - HTTP debugging proxy
- [ ] HTTPie - User-friendly HTTP client

## Checklist

- [x] Verified all apps exist in Homebrew
- [x] Ran `verify-homebrew-packages.mjs` successfully
- [x] Ran `detect-dark-icons.mjs` and applied suggestions
- [x] Tested all apps load correctly in the UI
- [x] Tested dark mode icon display
- [x] Generated Homebrew commands are correct
```

4. **Wait for review** - maintainers will review your PR and may request changes

5. **Make requested changes** if needed:

```bash
git add .
git commit -m "fix: address review feedback"
git push origin feature/add-my-apps
```

## 📐 Style Guidelines

### TypeScript

- Use TypeScript for all code
- Follow existing patterns in the codebase
- Use type inference where possible
- Avoid `any` types

### Formatting

- Use Prettier for code formatting: `pnpm format`
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multiline objects/arrays

### App Data Format

```typescript
// ✅ Good
{
  id: 'my-app',
  name: 'My App',
  brewName: 'my-app',
  category: AppCategoryEnum.enum.development,
  description: 'Clear, concise description under 70 characters',
  iconUrl: simpleIcon('myapp'),
  isCask: true,
}

// ❌ Bad
{
  id: 'MyApp',  // Should be kebab-case
  name: 'my app',  // Should be properly capitalized
  brewName: 'my_app',  // Incorrect Homebrew name
  category: 'development',  // Should use enum
  description: 'This is my app and it does lots of things and has many features...',  // Too long
  iconUrl: 'https://example.com/icon.png',  // Should use helper functions
  isCask: true,
}
```

### Description Guidelines

- Keep descriptions between 30-70 characters
- Be specific but concise
- Focus on the primary purpose
- No marketing fluff
- No periods at the end

**Good examples:**

- ✅ "Fast, secure web browser by Google"
- ✅ "AI-first code editor built for pair programming"
- ✅ "Terminal emulator for macOS"

**Bad examples:**

- ❌ "The best browser ever made with amazing features!"
- ❌ "Code editor." (too short, not descriptive)
- ❌ "A revolutionary, groundbreaking, next-generation code editor that will change the way you write code forever." (too long, marketing fluff)

## 🤝 Need Help?

- 💬 Open a [Discussion](https://github.com/Royal-lobster/Takeover/discussions) for questions
- 🐛 Open an [Issue](https://github.com/Royal-lobster/Takeover/issues) for bugs
- 📧 Reach out to maintainers

## 🎉 Recognition

All contributors will be recognized in our README and release notes. Thank you for making TakeOver better!

---

Happy contributing! 🚀
