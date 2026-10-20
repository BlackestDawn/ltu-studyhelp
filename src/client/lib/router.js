// Minimal History-API router: links marked data-link navigate without a reload.
const handlers = [];

export const onRoute = cb => handlers.push(cb);

const emit = () => handlers.forEach(cb => cb(location.pathname));

export function navigate(path) {
  if (path !== location.pathname + location.hash) history.pushState(null, "", path);
  emit();
}

export function startRouter() {
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-link]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(a.pathname + a.hash);
  });
  addEventListener("popstate", emit);
  emit();
}
