// language: JavaScript (ESM), file: public/js/router.js
// *Hash-based navigation. app.js registers the re-render function via setReload().*

export function navigate(path) {
  const target = "#" + (path.startsWith("/") ? path : "/" + path);
  if (location.hash === target) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = target;
}

export let reload = () => {};
export function setReload(fn) {
  reload = fn;
}
