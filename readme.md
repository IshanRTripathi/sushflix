# SushFlix

A user profiles and featured content platform.

## Features

- User profile management
- Featured content sections
- Progressive Web App (PWA) support
- Responsive design
- MongoDB integration
- Caching system

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sushflix.git
cd sushflix
```

2. Install dependencies:
```bash
npm install
```

3. Generate assets:
```bash
npm run generate-assets
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will:
1. Generate all required assets (icons, favicon)
2. Build the React application
3. Create an optimized production build

## Scripts

- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run generate-assets` - Generate icons and favicon
- `npm run convert-logo` - Convert SVG logo to PNG icons
- `npm run generate-favicon` - Generate favicon from logo

## Project Structure

```
sushflix/
├── public/                 # Static files
│   ├── icons/             # PWA icons
│   ├── logo.svg           # Logo source
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # Service worker
├── src/                   # Source code
│   ├── components/        # React components
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── scripts/              # Build scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.