import "./style.css";
import { STREAMERS, getStreamer } from "./data/streamers.js";
import { startRouter, parseHash } from "./lib/router.js";
import { renderHome } from "./views/home.js";
import { renderStreamer } from "./views/streamer.js";
import { renderMaker, bindMaker } from "./views/maker.js";
import { renderLibrary, bindLibrary } from "./views/library.js";
import { renderWatch, bindWatch } from "./views/watch.js";
import { getClip, deleteClip } from "./lib/clips.js";
import { copyShareLink } from "./views/clipGrid.js";
import { escapeHtml } from "./lib/embed.js";

const app = document.querySelector("#app");

function layout(content) {
  return `
    <div class="bg" aria-hidden="true"></div>
    <header class="topbar">
      <a class="brand" href="#/" aria-label="ClipZone home">
        <span class="brand__mark" aria-hidden="true">▶</span>
        <span class="brand__name">CLIPZONE</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav" id="site-nav">
        <a href="#/">Home</a>
        ${STREAMERS.map((s) => `<a href="#/streamer/${escapeHtml(s.id)}">${escapeHtml(s.name)}</a>`).join("")}
        <a href="#/maker">Clip Maker</a>
        <a href="#/clips">My Clips</a>
      </nav>
    </header>
    <main id="main" class="main">${content}</main>
    <footer class="footer">
      <p>ClipZone is a fan-made clip studio. Not affiliated with Jynxzi, Stable Ronaldo, or LosPollosTV. Clips stay in your browser unless you share a link.</p>
    </footer>
  `;
}

function routeView(route) {
  const [head, ...rest] = route.parts;
  if (!head) return { html: renderHome(), bind: null, title: "ClipZone — Jynxzi, Ron & Los", nav: "/" };
  if (head === "streamer") {
    const id = rest[0];
    const s = getStreamer(id);
    return {
      html: renderStreamer(id),
      bind: bindGlobalClipActions,
      title: s ? `${s.name} — ClipZone` : "Streamer not found — ClipZone",
      nav: `/streamer/${id}`,
    };
  }
  if (head === "maker") {
    return { html: renderMaker(), bind: bindMaker, title: "Clip Maker — ClipZone", nav: "/maker" };
  }
  if (head === "clips") {
    return {
      html: renderLibrary(route),
      bind: bindLibrary,
      title: "My Clips — ClipZone",
      nav: "/clips",
    };
  }
  if (head === "watch") {
    const token = rest.join("/");
    return {
      html: renderWatch(token),
      bind: (el) => bindWatch(el, token),
      title: "Clip — ClipZone",
      nav: "/watch",
    };
  }
  return {
    html: `
      <section class="page-block">
        <h1>Page not found</h1>
        <p class="muted">That ClipZone route does not exist.</p>
        <a class="btn btn--primary" href="#/">Back home</a>
      </section>
    `,
    bind: null,
    title: "Not found — ClipZone",
    nav: "",
  };
}

function bindGlobalClipActions(root) {
  root.addEventListener("click", async (e) => {
    const copyBtn = e.target.closest("[data-copy-link]");
    if (copyBtn) {
      const clip = getClip(copyBtn.getAttribute("data-copy-link"));
      if (!clip) return;
      const ok = await copyShareLink(clip);
      copyBtn.textContent = ok ? "Copied" : "Copy link";
      setTimeout(() => {
        copyBtn.textContent = "Copy link";
      }, 1400);
    }
    const delBtn = e.target.closest("[data-delete-clip]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-clip");
      if (!id) return;
      if (!window.confirm("Delete this clip from this browser?")) return;
      deleteClip(id);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  });
}

function setActiveNav(navKey) {
  const links = app.querySelectorAll(".nav a");
  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const path = href.replace(/^#/, "").split("?")[0] || "/";
    const active =
      (navKey === "/" && path === "/") ||
      (navKey !== "/" && navKey && path !== "/" && navKey.startsWith(path));
    a.classList.toggle("is-active", Boolean(active));
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function bindShell() {
  const toggle = app.querySelector(".nav-toggle");
  const nav = app.querySelector("#site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function render(route) {
  const view = routeView(route);
  app.innerHTML = layout(view.html);
  document.title = view.title;
  setActiveNav(view.nav);
  bindShell();
  const main = app.querySelector("#main");
  main.classList.add("is-enter");
  if (typeof view.bind === "function") view.bind(main);
  window.scrollTo(0, 0);
}

startRouter(render);

// Expose a tiny hook for headless checks without leaking app state elsewhere.
window.__CLIPZONE__ = {
  version: "1.0.0",
  route: () => parseHash(),
};
