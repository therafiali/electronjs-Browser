import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  // const [url, setUrl] = useState("https://fast.com");
  // const [currentUrl, setCurrentUrl] = useState("https://fast.com");
  // const [isLoading, setIsLoading] = useState(false);
  // const webviewRef = useRef<HTMLIFrameElement>(null);

  // const handleUrlSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   let processedUrl = url;

  //   // Add protocol if missing
  //   if (!url.startsWith("http://") && !url.startsWith("https://")) {
  //     processedUrl = "https://" + url;
  //   }

  //   setCurrentUrl(processedUrl);
  //   setUrl(processedUrl);
  // };

  // const handleGoBack = () => {
  //   if (webviewRef.current) {
  //     webviewRef.current.contentWindow?.history.back();
  //   }
  // };

  // const handleGoForward = () => {
  //   if (webviewRef.current) {
  //     webviewRef.current.contentWindow?.history.forward();
  //   }
  // };

  // const handleRefresh = () => {
  //   if (webviewRef.current) {
  //     webviewRef.current.src = currentUrl;
  //   }
  // };

  // const handleLoadStart = () => {
  //   setIsLoading(true);
  // };

  // const handleLoadEnd = () => {
  //   setIsLoading(false);
  // };

  return (
    <div className="app">
      {/* <div className="toolbar">
        <div className="navigation-buttons">
          <button onClick={handleGoBack} className="nav-button">
            ←
          </button>
          <button onClick={handleGoForward} className="nav-button">
            →
          </button>
          <button onClick={handleRefresh} className="nav-button">
            ↻
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="url-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            className="url-input"
          />
          <button type="submit" className="go-button">
            Search
          </button>
        </form>

        {isLoading && <div className="loading-indicator">Loading...</div>}
      </div> */}

      <div className="browser-content">
        <iframe
          src="https://fast.com"
          className="webview"
          // onLoadStart={handleLoadStart}
          // onLoad={handleLoadEnd}
          // ref={webviewRef}

          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          frameBorder="0"
          scrolling="no"
          allowFullScreen={false}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            margin: "0",
            padding: "0",
          }}
        />
      </div>
    </div>
  );
}

export default App;
