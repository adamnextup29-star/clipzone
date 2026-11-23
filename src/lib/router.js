/**
 * Hash-based router for static hosts (Bolt, GitHub Pages, etc.).
 * Routes:
 *   #/                  home
 *   #/streamer/:id      streamer page
 *   #/maker             clip maker
 *   #/clips             my clips / trending
 *   #/watch/:payload    shared clip
 */
export function parseHash() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
  const [pathPart, queryPart] = cleaned.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryPart || ""));
  const path = parts.length ? `/${parts.join("/")}` : "/";
  return { path, parts, query, raw: cleaned };
}

export function navigate(to, { replace = false } = {}) {
  const hash = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : `/${to}`}`;
  if (replace) {
    const url = `${location.pathname}${location.search}${hash}`;
    history.replaceState(null, "", url);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    location.hash = hash.replace(/^#/, "");
  }
}

export function startRouter(onChange) {
  const fire = () => onChange(parseHash());
  window.addEventListener("hashchange", fire);
  if (!location.hash) {
    history.replaceState(null, "", `${location.pathname}${location.search}#/`);
  }
  fire();
  return () => window.removeEventListener("hashchange", fire);
}
