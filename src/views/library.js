import { STREAMERS } from "../data/streamers.js";
import { loadClips, sortClips, getClip, deleteClip } from "../lib/clips.js";
import { renderClipGrid, emptyState, copyShareLink } from "./clipGrid.js";
import { escapeHtml } from "../lib/embed.js";

export function renderLibrary({ query }) {
  const filter = query.streamer || "all";
  const sort = query.sort === "views" ? "views" : "new";
  let clips = loadClips();
  if (filter !== "all") clips = clips.filter((c) => c.streamerId === filter);
  clips = sortClips(clips, sort);

  const filters = [
    { id: "all", label: "All" },
    ...STREAMERS.map((s) => ({ id: s.id, label: s.name })),
  ]
    .map((f) => {
      const href = hashFor(f.id, sort);
      const on = f.id === filter ? " is-on" : "";
      return `<a class="chip${on}" href="${href}">${escapeHtml(f.label)}</a>`;
    })
    .join("");

  const sorts = [
    ["new", "Newest"],
    ["views", "Most viewed"],
  ]
    .map(([id, label]) => {
      const on = id === sort ? " is-on" : "";
      return `<a class="chip${on}" href="${hashFor(filter, id)}">${label}</a>`;
    })
    .join("");

  return `
    <section class="page-block">
      <header class="page-head">
        <p class="eyebrow">Library</p>
        <h1>My Clips</h1>
        <p class="lead">
          Everything you save stays in this browser. View counts are local too — opening a clip here adds one view on this device. Nothing is pre-loaded.
        </p>
      </header>

      <div class="toolbar">
        <div class="toolbar__group" aria-label="Filter by streamer">
          <span class="toolbar__label">Filter</span>
          ${filters}
        </div>
        <div class="toolbar__group" aria-label="Sort clips">
          <span class="toolbar__label">Sort</span>
          ${sorts}
        </div>
      </div>

      ${
        clips.length
          ? renderClipGrid(clips, { showDelete: true })
          : emptyState(
              "Your library is empty.",
              "Make a clip from a YouTube video or Twitch VOD and it will show up here."
            )
      }
    </section>
  `;
}

function hashFor(streamer, sort) {
  const params = new URLSearchParams();
  if (streamer && streamer !== "all") params.set("streamer", streamer);
  if (sort && sort !== "new") params.set("sort", sort);
  const q = params.toString();
  return q ? `#/clips?${q}` : "#/clips";
}

export function bindLibrary(root) {
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
      return;
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
