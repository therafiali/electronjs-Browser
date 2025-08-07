# Electron Browser - Complete Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Fundamentals](#architecture-fundamentals)
3. [Project Structure](#project-structure)
4. [Main Process (Electron)](#main-process-electron)
5. [Renderer Process (React)](#renderer-process-react)
6. [Build System](#build-system)
7. [Security Model](#security-model)
8. [Development Workflow](#development-workflow)
9. [Production Build](#production-build)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Electron?

Electron is a framework that allows you to build cross-platform desktop applications using web technologies (HTML, CSS, JavaScript). It combines Chromium (for rendering) and Node.js (for backend functionality).

### Why This Architecture?

- **Cross-platform**: One codebase for Windows, macOS, and Linux
- **Web Technologies**: Leverage existing React/TypeScript skills
- **Native Performance**: Desktop app performance with web development ease
- **Security**: Built-in security features and sandboxing

---

## Architecture Fundamentals

### Multi-Process Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Process  │    │ Renderer Process│    │   Browser Process│
│   (Node.js)     │◄──►│   (Chromium)    │◄──►│   (Chromium)    │
│                 │    │                 │    │                 │
│ • App lifecycle │    │ • UI rendering  │    │ • Web content   │
│ • Window mgmt   │    │ • User interface│    │ • JavaScript    │
│ • System APIs   │    │ • React app     │    │ • DOM rendering │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Process Communication

- **Main Process**: Controls app lifecycle, creates windows, manages system resources
- **Renderer Process**: Handles UI rendering, user interactions, web content
- **IPC (Inter-Process Communication)**: Secure communication between processes

---

## Project Structure

```
browser-wrapper/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # App entry point & window creation
│   │   └── preload.ts       # Secure bridge between processes
│   └── renderer/            # React renderer process
│       ├── src/
│       │   ├── App.tsx      # Main React component
│       │   ├── main.tsx     # React entry point
│       │   ├── App.css      # Component styles
│       │   └── index.css    # Global styles
│       └── index.html       # HTML template
├── dist/                    # Built files
├── public/                  # Static assets
├── package.json             # Dependencies & scripts
├── tsconfig.json           # TypeScript config (renderer)
├── tsconfig.main.json      # TypeScript config (main)
├── vite.config.ts          # Build tool configuration
└── README.md               # Project documentation
```

---

## Main Process (Electron)

### 1. Main Entry Point (`src/main/main.ts`)

```typescript
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;
```

**Line-by-line explanation:**

- `import { app, BrowserWindow, ipcMain } from 'electron'`: Imports core Electron modules
  - `app`: Controls application lifecycle (start, quit, etc.)
  - `BrowserWindow`: Creates and manages application windows
  - `ipcMain`: Handles inter-process communication from main process
- `import * as path from 'path'`: Node.js path module for file path operations
- `let mainWindow: BrowserWindow | null = null`: Global variable to store window reference

```typescript
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });
```

**Window Configuration Explanation:**

- `width: 1200, height: 800`: Initial window dimensions
- `webPreferences`: Security and functionality settings
  - `nodeIntegration: false`: Prevents renderer from accessing Node.js APIs directly
  - `contextIsolation: true`: Isolates main and renderer processes
  - `webSecurity: true`: Enables web security features
  - `preload: path.join(__dirname, 'preload.js')`: Path to preload script
- `titleBarStyle: 'default'`: Uses native window title bar
- `show: false`: Window starts hidden (shown when ready)

```typescript
// Load the renderer process
if (process.env.NODE_ENV === "development") {
  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools();
} else {
  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
}
```

**Loading Logic:**

- **Development**: Loads from Vite dev server (`http://localhost:5173`)
- **Production**: Loads built HTML file from `dist/renderer/index.html`
- `openDevTools()`: Opens browser dev tools in development mode

```typescript
mainWindow.once("ready-to-show", () => {
  mainWindow?.show();
});

mainWindow.on("closed", () => {
  mainWindow = null;
});
```

**Event Handlers:**

- `ready-to-show`: Shows window when content is ready (prevents white flash)
- `closed`: Cleans up window reference when closed

```typescript
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

**App Lifecycle:**

- `app.whenReady()`: Waits for Electron to be ready, then creates window
- `window-all-closed`: Quits app when all windows are closed (except on macOS)
- `activate`: Recreates window when app is activated (macOS dock click)

### 2. Preload Script (`src/main/preload.ts`)

```typescript
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  navigateToUrl: (url: string) => ipcRenderer.invoke("navigate-to-url", url),
});
```

**Security Bridge:**

- `contextBridge`: Creates secure bridge between main and renderer processes
- `exposeInMainWorld`: Exposes functions to renderer's `window` object
- `ipcRenderer.invoke`: Sends messages to main process and waits for response

**Type Definitions:**

```typescript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      navigateToUrl: (url: string) => Promise<void>;
    };
  }
}
```

This provides TypeScript type safety for the exposed API.

---

## Renderer Process (React)

### 1. React Entry Point (`src/renderer/src/main.tsx`)

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Explanation:**

- `ReactDOM.createRoot`: Creates React 18 root for concurrent features
- `document.getElementById('root')`: Finds the root DOM element
- `React.StrictMode`: Enables additional development checks
- `App`: Main React component

### 2. Main App Component (`src/renderer/src/App.tsx`)

```typescript
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const webviewRef = useRef<HTMLIFrameElement>(null);
```

**State Management:**

- `url`: Current input field value
- `currentUrl`: Actually loaded URL in iframe
- `isLoading`: Loading state indicator
- `webviewRef`: Reference to iframe element for direct manipulation

```typescript
const handleUrlSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  let processedUrl = url;

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    processedUrl = "https://" + url;
  }

  setCurrentUrl(processedUrl);
  setUrl(processedUrl);
};
```

**URL Processing:**

- `e.preventDefault()`: Prevents form default submission
- Protocol detection: Automatically adds `https://` if missing
- Updates both input field and iframe URL

```typescript
const handleGoBack = () => {
  if (webviewRef.current) {
    webviewRef.current.contentWindow?.history.back();
  }
};

const handleGoForward = () => {
  if (webviewRef.current) {
    webviewRef.current.contentWindow?.history.forward();
  }
};

const handleRefresh = () => {
  if (webviewRef.current) {
    webviewRef.current.src = currentUrl;
  }
};
```

**Navigation Functions:**

- `contentWindow?.history.back()`: Uses browser's history API
- `contentWindow?.history.forward()`: Navigate forward in history
- `src = currentUrl`: Reloads iframe with current URL

```typescript
  return (
    <div className="app">
      <div className="toolbar">
        <div className="navigation-buttons">
          <button onClick={handleGoBack} className="nav-button">←</button>
          <button onClick={handleGoForward} className="nav-button">→</button>
          <button onClick={handleRefresh} className="nav-button">↻</button>
        </div>

        <form onSubmit={handleUrlSubmit} className="url-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            className="url-input"
          />
          <button type="submit" className="go-button">Go</button>
        </form>

        {isLoading && <div className="loading-indicator">Loading...</div>}
      </div>

      <div className="browser-content">
        <iframe
          ref={webviewRef}
          src={currentUrl}
          className="webview"
          onLoadStart={handleLoadStart}
          onLoad={handleLoadEnd}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  );
}
```

**UI Structure:**

- **Toolbar**: Contains navigation buttons, URL input, and loading indicator
- **Browser Content**: Contains the iframe for web content
- **Sandbox**: Security restrictions for iframe content

---

## Build System

### 1. Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  root: "src/renderer",
  build: {
    outDir: "../../dist/renderer",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/renderer/src"),
    },
  },
});
```

**Configuration Explanation:**

- `plugins: [react()]`: Enables React support
- `base: './'`: Relative base path for assets
- `root: 'src/renderer'`: Sets Vite's root directory
- `outDir: '../../dist/renderer'`: Output directory for built files
- `emptyOutDir: true`: Clears output directory before build
- `alias: { '@': ... }`: Path alias for imports

### 2. TypeScript Configurations

**Main Process (`tsconfig.main.json`):**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src/main",
    "resolveJsonModule": true
  },
  "include": ["src/main"]
}
```

**Renderer Process (`tsconfig.json`):**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/renderer"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:5173 && npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "tsc -p tsconfig.main.json && cross-env NODE_ENV=development electron .",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",
    "dist": "npm run build && electron-builder",
    "start": "electron ."
  }
}
```

**Script Explanation:**

- `dev`: Runs both renderer and main processes concurrently
- `dev:renderer`: Starts Vite dev server
- `dev:main`: Compiles TypeScript and starts Electron
- `build`: Builds both processes for production
- `dist`: Creates distributable packages
- `start`: Runs the built application

---

## Security Model

### 1. Context Isolation

```typescript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  webSecurity: true,
  preload: path.join(__dirname, 'preload.js')
}
```

**Security Features:**

- `nodeIntegration: false`: Prevents direct Node.js access from renderer
- `contextIsolation: true`: Isolates main and renderer process contexts
- `webSecurity: true`: Enables web security features
- `preload`: Secure bridge for inter-process communication

### 2. Iframe Sandboxing

```typescript
<iframe sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads" />
```

**Sandbox Permissions:**

- `allow-same-origin`: Allows same-origin requests
- `allow-scripts`: Allows JavaScript execution
- `allow-forms`: Allows form submissions
- `allow-popups`: Allows popup windows
- `allow-downloads`: Allows file downloads

### 3. IPC Security

```typescript
// Preload script exposes only specific functions
contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  navigateToUrl: (url: string) => ipcRenderer.invoke("navigate-to-url", url),
});
```

**Security Benefits:**

- Only specific functions are exposed
- No direct access to Node.js APIs
- Controlled communication between processes

---

## Development Workflow

### 1. Development Mode

```bash
npm run dev
```

**What happens:**

1. Vite starts dev server on `http://localhost:5173`
2. TypeScript compiles main process
3. Electron starts and loads from dev server
4. Hot reload enabled for both processes

### 2. File Watching

- **Renderer**: Vite watches for changes and hot reloads
- **Main**: TypeScript recompiles on changes
- **Electron**: Restarts when main process changes

### 3. Debugging

- **Renderer**: Browser dev tools (F12)
- **Main**: Console logs in terminal
- **IPC**: Dev tools console for communication

---

## Production Build

### 1. Build Process

```bash
npm run build
```

**Steps:**

1. Vite builds renderer process to `dist/renderer/`
2. TypeScript compiles main process to `dist/`
3. Assets are optimized and bundled

### 2. Distribution

```bash
npm run dist
```

**Electron Builder Configuration:**

```json
{
  "build": {
    "appId": "com.electron.browser",
    "productName": "Simple Browser",
    "directories": {
      "output": "release"
    },
    "files": ["dist/**/*", "node_modules/**/*"],
    "mac": {
      "category": "public.app-category.utilities"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

**Platform Support:**

- **Windows**: NSIS installer
- **macOS**: DMG package
- **Linux**: AppImage format

---

## Troubleshooting

### Common Issues

1. **"Failed to load URL" Error**

   - **Cause**: Incorrect file paths in production
   - **Solution**: Check `dist/renderer/index.html` exists

2. **TypeScript Compilation Errors**

   - **Cause**: Type mismatches or missing types
   - **Solution**: Check type definitions and imports

3. **Security Warnings**

   - **Cause**: Electron security policies
   - **Solution**: Review webPreferences settings

4. **Build Failures**
   - **Cause**: Missing dependencies or configuration
   - **Solution**: Run `npm install` and check configs

### Debug Commands

```bash
# Check for TypeScript errors
npm run build:main
npm run build:renderer

# Run with verbose logging
DEBUG=* npm run dev

# Check Electron version
npx electron --version
```

---

## Key Concepts Summary

### 1. Process Architecture

- **Main Process**: App lifecycle, system APIs
- **Renderer Process**: UI rendering, user interactions
- **IPC**: Secure communication bridge

### 2. Security Model

- **Context Isolation**: Prevents unauthorized access
- **Sandboxing**: Restricts iframe capabilities
- **Preload Scripts**: Controlled API exposure

### 3. Build System

- **Vite**: Fast development and optimized builds
- **TypeScript**: Type safety across processes
- **Electron Builder**: Cross-platform distribution

### 4. Development Workflow

- **Hot Reload**: Instant feedback during development
- **Concurrent Processes**: Simultaneous development
- **Debugging Tools**: Browser and terminal debugging

This architecture provides a robust, secure, and maintainable foundation for desktop applications using web technologies.
