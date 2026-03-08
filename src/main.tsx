import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.tsx";

registerSW({
  immediate: true,
  onNeedRefresh() {
    const toast = document.createElement("div");
    toast.setAttribute("role", "alert");
    toast.style.cssText =
      "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;" +
      "background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:16px;" +
      "box-shadow:0 4px 20px rgba(0,0,0,0.4);display:flex;align-items:center;gap:12px;" +
      "font-size:14px;font-family:system-ui;animation:fadeIn .3s ease";
    toast.innerHTML =
      '<span>Доступно обновление</span>' +
      '<button style="background:#6d5dfc;color:#fff;border:none;padding:6px 14px;border-radius:10px;font-size:13px;cursor:pointer">Обновить</button>';
    toast.querySelector("button")!.onclick = () => window.location.reload();
    document.body.appendChild(toast);
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
