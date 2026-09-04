// Recover a broken app shell and remove legacy protected-media caches.
window.setTimeout(function recoverAppShell() {
  var root = document.getElementById("root");
  var bootScreen = root && root.querySelector(":scope > .boot-screen");
  if (!bootScreen || !("caches" in window)) return;
  if (window.sessionStorage.getItem("sw-fix")) return;

  window.sessionStorage.setItem("sw-fix", "1");
  navigator.serviceWorker
    .getRegistrations()
    .then(function unregisterShellWorkers(registrations) {
      registrations.forEach(function unregister(registration) {
        registration.unregister();
      });
    });
  caches.keys().then(function clearAppShellCaches(names) {
    return Promise.all(
      names.map(function removeCache(name) {
          return caches.delete(name);
        }),
    ).then(function reload() {
      window.location.reload();
    });
  });
}, 5000);
