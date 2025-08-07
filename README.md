# Simple Electron Browser

A minimal, production-ready Electron browser application built with React and TypeScript.

## Features

- Simple and clean browser interface
- URL navigation with automatic protocol detection
- Back, forward, and refresh navigation
- Loading indicators
- Modern UI with responsive design
- Cross-platform support (Windows, macOS, Linux)

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Mode

Run the application in development mode:

```bash
npm run dev
```

This will start both the Vite dev server for the React frontend and the Electron main process.

### Building

Build the application for production:

```bash
npm run build
```

### Distribution

Create distributable packages:

```bash
npm run dist
```

This will create platform-specific installers in the `release` directory.

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # Main process entry point
│   └── preload.ts  # Preload script for secure IPC
└── renderer/       # React renderer process
    ├── src/
    │   ├── App.tsx # Main React component
    │   ├── main.tsx # React entry point
    │   └── *.css   # Styles
    └── index.html  # HTML template
```

## Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages
- `npm start` - Start the built application

## Security

The application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled
- Remote module disabled
- Web security enabled
- Sandboxed iframe for web content

## License

MIT
