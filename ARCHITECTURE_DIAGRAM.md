# Electron Browser - Architecture Flow Diagrams

## 1. Application Startup Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Starts   │────►│  Main Process   │────►│  Create Window  │
│   Application   │     │   (main.ts)     │     │  (BrowserWindow)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Load Renderer  │◄────│  Preload Script │◄────│  Security Setup │
│   (React App)   │     │   (preload.ts)  │     │ (webPreferences)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React App      │────►│  Browser UI     │────►│  Iframe Content │
│  (App.tsx)      │     │  (Toolbar)      │     │  (Web Pages)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 2. Process Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN PROCESS                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   App Lifecycle │    │  Window Mgmt    │    │  System APIs│  │
│  │                 │    │                 │    │             │  │
│  │ • app.whenReady │    │ • BrowserWindow │    │ • File I/O  │  │
│  │ • app.quit      │    │ • Window Events │    │ • Network   │  │
│  │ • app.activate  │    │ • Window State  │    │ • Security  │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ IPC (Inter-Process Communication)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRELOAD SCRIPT                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              contextBridge.exposeInMainWorld                │ │
│  │                                                             │ │
│  │  window.electronAPI = {                                     │ │
│  │    getAppVersion: () => ipcRenderer.invoke('get-app-version')│ │
│  │    navigateToUrl: (url) => ipcRenderer.invoke('navigate', url)│ │
│  │  }                                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Secure Bridge
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RENDERER PROCESS                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   React App     │    │  Browser UI     │    │  Web Content│  │
│  │                 │    │                 │    │             │  │
│  │ • State Mgmt    │    │ • URL Bar       │    │ • Iframe    │  │
│  │ • Event Handlers│    │ • Nav Buttons   │    │ • Sandbox   │  │
│  │ • Component Life│    │ • Loading State │    │ • Web Pages │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. URL Navigation Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Enters   │────►│  URL Processing │────►│  Update State   │
│   URL in Input  │     │                 │     │                 │
│                 │     │ • Add https://  │     │ • setUrl()      │
│                 │     │ • Validate URL  │     │ • setCurrentUrl()│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Form Submit    │────►│  handleUrlSubmit│────►│  Update Iframe  │
│  (Enter/Go)     │     │                 │     │                 │
│                 │     │ • preventDefault│     │ • src = newUrl  │
│                 │     │ • Process URL   │     │ • Load Content  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Loading State  │────►│  Content Loads  │────►│  Page Rendered  │
│                 │     │                 │     │                 │
│ • isLoading=true│     │ • iframe.onLoad │     │ • User can      │
│ • Show Indicator│     │ • Set loading   │     │   interact with │
│                 │     │   to false      │     │   web content   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 4. Build Process Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Source Code   │────►│  TypeScript     │────►│  Compiled JS    │
│                 │     │  Compilation    │     │                 │
│ • main.ts       │     │ • tsc -p config │     │ • main.js       │
│ • preload.ts    │     │ • Type checking │     │ • preload.js    │
│ • App.tsx       │     │ • Error handling│     │ • index.js      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vite Build     │────►│  Asset Bundling │────►│  Optimized      │
│                 │     │                 │     │  Output         │
│ • React Build   │     │ • CSS bundling  │     │ • index.html    │
│ • CSS Processing│     │ • JS bundling   │     │ • assets/       │
│ • Asset Copy    │     │ • Optimization  │     │ • vendor chunks │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Electron       │────►│  Package        │────►│  Distributable  │
│  Builder        │     │  Creation       │     │                 │
│                 │     │                 │     │ • Windows .exe  │
│ • App packaging │     │ • Platform      │     │ • macOS .dmg    │
│ • Dependencies  │     │   specific      │     │ • Linux .AppImage│
│ • Resources     │     │   packaging     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 5. Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN PROCESS                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              SECURITY CONFIGURATION                         │ │
│  │                                                             │ │
│  │  webPreferences: {                                          │ │
│  │    nodeIntegration: false,    // No Node.js access          │ │
│  │    contextIsolation: true,    // Process isolation          │ │
│  │    webSecurity: true,         // Web security enabled       │ │
│  │    preload: 'preload.js'      // Secure bridge only         │ │
│  │  }                                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRELOAD SCRIPT                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              CONTROLLED API EXPOSURE                         │ │
│  │                                                             │ │
│  │  contextBridge.exposeInMainWorld('electronAPI', {           │ │
│  │    // Only specific functions exposed                       │ │
│  │    getAppVersion: () => ipcRenderer.invoke('get-app-version')│ │
│  │    navigateToUrl: (url) => ipcRenderer.invoke('navigate', url)│ │
│  │    // No direct Node.js access                              │ │
│  │  });                                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERER PROCESS                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              SANDBOXED WEB CONTENT                          │ │
│  │                                                             │ │
│  │  <iframe                                                    │ │
│  │    sandbox="allow-same-origin allow-scripts                 │ │
│  │             allow-forms allow-popups allow-downloads"       │ │
│  │    // Restricted permissions only                           │ │
│  │  />                                                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 6. Development vs Production Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vite Dev       │────►│  Hot Reload     │────►│  Instant        │
│  Server         │     │                 │     │  Feedback       │
│                 │     │ • File watching │     │                 │
│ • localhost:5173│     │ • HMR enabled   │     │ • UI updates    │
│ • Fast refresh  │     │ • Source maps   │     │ • Error overlay │
│ • Dev tools     │     │ • Debug info    │     │ • Console logs  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Electron       │────►│  Load from      │────►│  Development    │
│  Main Process   │     │  Dev Server     │     │  Mode           │
│                 │     │                 │     │                 │
│ • TypeScript    │     │ • loadURL()     │     │ • Dev tools     │
│   compilation   │     │ • http://...    │     │   enabled       │
│ • Process mgmt  │     │ • Live reload   │     │ • Debug info    │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Build Process  │────►│  Optimized      │────►│  Bundled        │
│                 │     │  Assets         │     │  Files          │
│                 │     │                 │     │                 │
│ • Vite build    │     │ • Minified JS   │     │ • index.html    │
│ • TypeScript    │     │ • Optimized CSS │     │ • assets/       │
│   compilation   │     │ • Tree shaking  │     │ • vendor chunks │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Electron       │────►│  Load from      │────►│  Production     │
│  Main Process   │     │  Built Files    │     │  Mode           │
│                 │     │                 │     │                 │
│ • Compiled JS   │     │ • loadFile()    │     │ • Optimized     │
│ • Static assets │     │ • file://...    │     │   performance   │
│ • No dev tools  │     │ • No hot reload │     │ • No debug info │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 7. Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP COMPONENT                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  function App() {                                           │ │
│  │    const [url, setUrl] = useState('https://google.com');    │ │
│  │    const [currentUrl, setCurrentUrl] = useState(...);       │ │
│  │    const [isLoading, setIsLoading] = useState(false);      │ │
│  │    const webviewRef = useRef<HTMLIFrameElement>(null);      │ │
│  │                                                             │ │
│  │    return (                                                 │ │
│  │      <div className="app">                                  │ │
│  │        <Toolbar />                                          │ │
│  │        <BrowserContent />                                   │ │
│  │      </div>                                                 │ │
│  │    );                                                       │ │
│  │  }                                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    TOOLBAR      │     │  NAVIGATION     │     │  URL FORM       │
│                 │     │  BUTTONS        │     │                 │
│ • Navigation    │     │                 │     │ • URL Input     │
│   buttons       │     │ • Back (←)      │     │ • Go button     │
│ • URL form      │     │ • Forward (→)   │     │ • Loading       │
│ • Loading       │     │ • Refresh (↻)   │     │   indicator     │
│   indicator     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER CONTENT                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  <div className="browser-content">                          │ │
│  │    <iframe                                                  │ │
│  │      ref={webviewRef}                                       │ │
│  │      src={currentUrl}                                       │ │
│  │      className="webview"                                    │ │
│  │      onLoadStart={handleLoadStart}                          │ │
│  │      onLoad={handleLoadEnd}                                 │ │
│  │      sandbox="allow-same-origin allow-scripts               │ │
│  │               allow-forms allow-popups allow-downloads"     │ │
│  │    />                                                       │ │
│  │  </div>                                                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 8. State Management Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Initial       │────►│  User Input     │────►│  State Update   │
│   State         │     │                 │     │                 │
│                 │     │ • URL typing    │     │ • setUrl()      │
│ • url: 'google' │     │ • Form submit   │     │ • setCurrentUrl()│
│ • currentUrl:   │     │ • Navigation    │     │ • setIsLoading()│
│   'google'      │     │   buttons       │     │                 │
│ • isLoading:    │     │ • iframe events │     │                 │
│   false         │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Component      │────►│  Re-render      │────►│  UI Update      │
│  Re-render      │     │                 │     │                 │
│                 │     │ • React         │     │ • URL bar       │
│ • State change  │     │   reconciliation│     │   updates       │
│   triggers      │     │ • Virtual DOM   │     │ • Buttons       │
│   re-render     │     │   diffing       │     │   enable/disable│
│                 │     │ • DOM updates   │     │ • Loading       │
│                 │     │                 │     │   indicator     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

This comprehensive architecture documentation shows how all the pieces work together to create a secure, efficient, and maintainable Electron browser application.
