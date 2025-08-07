# Quick Start Guide

## Simple Electron Browser

A minimal, production-ready browser built with Electron and React.

### 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Development mode:**

   ```bash
   npm run dev
   ```

3. **Production build:**

   ```bash
   npm run build
   npm start
   ```

4. **Create distributable:**
   ```bash
   npm run dist
   ```

### ✨ Features

- **Simple Interface**: Clean, minimal browser UI
- **URL Navigation**: Enter any URL and browse
- **Navigation Controls**: Back, forward, and refresh buttons
- **Loading Indicators**: Visual feedback during page loads
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Production Ready**: Built with security best practices

### 🛠️ Tech Stack

- **Electron**: Desktop application framework
- **React**: UI library with TypeScript
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development

### 📁 Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # App entry point
│   └── preload.ts  # Secure IPC bridge
└── renderer/       # React frontend
    ├── src/
    │   ├── App.tsx # Main browser component
    │   └── *.css   # Styles
    └── index.html  # HTML template
```

### 🔒 Security Features

- Context isolation enabled
- Node integration disabled
- Web security enabled
- Sandboxed web content
- Secure IPC communication

### 🎯 Usage

1. Launch the application
2. Enter a URL in the address bar
3. Press Enter or click "Go"
4. Use navigation buttons to browse
5. Enjoy simple, fast browsing!

The browser starts with Google as the default page and supports all standard web protocols.
