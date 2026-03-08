import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.tsx";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // New SW available — auto-update immediately
    updateSW(true);
  },
  onOfflineReady() {},
  onRegisterError() {
    // SW failed — nuke all caches and reload once
    if ("caches" in window && !sessionStorage.getItem("sw-recovery")) {
      sessionStorage.setItem("sw-recovery", "1");
      caches.keys().then((names) => {
        Promise.all(names.map((n) => caches.delete(n))).then(() => {
          window.location.reload();
        });
      });
    }
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
