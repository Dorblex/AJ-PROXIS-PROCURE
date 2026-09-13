import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * `window.storage` is a persistence API provided automatically inside Claude.ai's
 * artifact sandbox (see: https://docs.claude.com — "persistent storage for artifacts").
 * App.jsx uses it to save/restore the whole app's state between visits.
 *
 * Outside that sandbox, `window.storage` doesn't exist, so this polyfill backs the
 * exact same {key, value, shared} API with the browser's localStorage instead, giving
 * you the same save/restore behavior when running this as a standalone app.
 */
if (!window.storage) {
  const prefix = "aj-proxis-storage:";
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(prefix + key);
      if (raw === null) throw new Error("Key not found: " + key);
      return { key, value: raw, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(prefix + key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      const existed = localStorage.getItem(prefix + key) !== null;
      localStorage.removeItem(prefix + key);
      return { key, deleted: existed, shared: false };
    },
    async list(keyPrefix = "") {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(prefix + keyPrefix))
        .map((k) => k.slice(prefix.length));
      return { keys, prefix: keyPrefix, shared: false };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
