# D&D Chronicle

A comprehensive campaign management tool for Dungeons & Dragons sessions, designed to help Dungeon Masters and players track entities, record thoughts, and manage multiple campaigns with ease.

## Features

### Entity Management
- Track characters (PCs, NPCs), locations, items, and organizations
- Customizable entity attributes with required field validation
- Entity relationships and metrics (mention counts, last mentioned dates)
- Multiple view modes: grid, list, and table views
- Advanced search and filtering by entity type

### Thought Recording
- Quick capture of session notes and ideas with keyboard shortcuts (Ctrl+Enter)
- Automatic entity extraction and suggestions
- Tag system for organizing thoughts
- Game date tracking for chronicle timeline
- Markdown formatting support

### Campaign Management
- Multi-campaign support with quick switching
- Campaign-specific entity and thought isolation
- Import/export functionality for backup and sharing
- Offline-first architecture with cloud sync

### Data Management
- Automatic schema migrations with validation
- Migration history and rollback support
- Data validation and integrity checks
- Secure local storage with optional cloud backup

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn-ui, Tailwind CSS
- **State Management**: React Hooks, Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form, Zod validation
- **Storage**: LocalStorage with optional Supabase sync
- **Testing**: Vitest, Testing Library

## Development Setup

### Prerequisites
- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

### Running Tests

```sh
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
src/
├── components/        # React components
│   ├── display/      # Display-only components
│   ├── forms/        # Form components with validation
│   ├── layout/       # Layout and page components
│   ├── settings/     # Settings-related components
│   └── ui/           # shadcn-ui components
├── hooks/            # Custom React hooks
├── pages/            # Route pages
├── services/         # Business logic and data services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── schemas/          # Zod validation schemas
```

## Key Development Files

- `DEVELOPMENT_RULES.md` - Development guidelines and standards
- `docs/ID_BASED_REFERENCES.md` - Entity reference system documentation
- `docs/TESTING_STRATEGY.md` - Testing approach and standards

## Deployment

### Via Lovable
Simply open [Lovable](https://lovable.dev/projects/2796b295-16d5-4955-9bc8-8e551f69e0b9) and click on Share → Publish.

### Custom Domain
Navigate to Project > Settings > Domains and click Connect Domain in Lovable.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

### Self-Hosting
The project can be built and deployed to any static hosting service:

```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

This project follows strict development rules outlined in `DEVELOPMENT_RULES.md`, including:
- Design system first approach
- Clean code principles
- Comprehensive testing requirements
- Changelog and versioning standards

## Version

Current version: **1.3.6**

See `CHANGELOG.md` or visit `/changelog` in the app for full version history.

## License

This project is built with [Lovable](https://lovable.dev) and uses open-source technologies.
