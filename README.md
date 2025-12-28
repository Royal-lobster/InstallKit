<p align="center">
  <img src="./public/logo.svg" alt="InstallKit logo" width="120" />
</p>

<h1 align="center">InstallKit 🚀</h1>

<p align="center">A beautiful, modern web app to help you take over your new Mac by quickly installing all your favorite applications via Homebrew.</p>

<p align="center">
  <a href="https://installkit.vercel.app">🔗 Live</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

## ✨ Features

- 🎯 **Curated App Collection** - Browse 200+ popular macOS applications across 11 categories
- 🔍 **Smart Search** - Quickly find apps with fuzzy search
- 🎨 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS 4
- 📦 **One-Click Install** - Generate Homebrew commands to install multiple apps at once
- 🌓 **Dark Mode** - Automatic dark mode support with icon inversion
- ⚡ **Fast & Modern** - Built with Next.js 15 and React 19
- 🎭 **Category Filtering** - Browse apps by browsers, development, productivity, and more

## 📸 Preview

Browse through curated categories of applications, select the ones you want, and get a ready-to-run Homebrew command to install them all at once.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Royal-lobster/installkit.git
cd installkit
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) + [@base-ui/react](https://base-ui.netlify.app/)
- **Icons:** [Phosphor Icons](https://phosphoricons.com/) + [Simple Icons](https://simpleicons.org/)
- **State Management:** [TanStack Query](https://tanstack.com/query)
- **Search:** [Fuse.js](https://fusejs.io/) (fuzzy search)
- **Validation:** [Zod](https://zod.dev/)
- **Package Manager:** pnpm

## 📁 Project Structure

```
installkit/
├── app/
│   ├── (landing)/           # Landing page with app picker
│   │   ├── _components/     # Landing page components
│   │   └── page.tsx
│   ├── (layout)/            # Layout components
│   ├── components/ui/       # Reusable UI components (shadcn)
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── lib/
│   ├── api/                 # API clients (Homebrew API)
│   ├── data/
│   │   └── apps.ts         # App data source (200+ apps)
│   ├── helpers/            # Helper functions
│   └── schema.ts           # Zod schemas and types
├── public/                  # Static assets
├── scripts/                 # Utility scripts
│   ├── detect-dark-icons.mjs     # Icon analysis
│   ├── fix-icons.mjs            # Icon fixes
│   └── verify-homebrew-packages.mjs  # Package verification
└── package.json
```

## 🛠️ Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome
pnpm format       # Format code with Biome
```

### Adding New Apps

See [CONTRIBUTING.md](./CONTRIBUTING.md#adding-new-apps) for detailed instructions on how to add new applications to the collection.

Quick example:

```typescript
// lib/data/apps.ts
{
  id: 'my-app',
  name: 'My App',
  brewName: 'my-app',  // Exact Homebrew cask/formula name
  category: AppCategoryEnum.enum.development,
  description: 'Short description of the app',
  iconUrl: simpleIcon('myapp'),  // or favicon('myapp.com')
  isCask: true,  // true for casks, false for formulae
  invertInDark: false,  // optional: invert icon in dark mode
}
```

### Verification Scripts

Before submitting a PR with new apps:

```bash
# Verify all Homebrew packages exist
node scripts/verify-homebrew-packages.mjs

# Detect icons that may need dark mode inversion
node scripts/detect-dark-icons.mjs
```

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to add new apps.

### Quick Contribution Guide

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add your apps or make changes
4. Run verification scripts
5. Commit your changes (`git commit -m 'feat: add some amazing apps'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Simple Icons](https://simpleicons.org/) for brand icons
- [Homebrew](https://brew.sh/) for making macOS package management easy
- All the amazing app developers whose work we showcase

## 🌟 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

## 📧 Contact

Have questions or suggestions? Feel free to [open an issue](https://github.com/Royal-lobster/installkit/issues)!

---

Built with ❤️ by [Srujan](https://github.com/Royal-lobster)
