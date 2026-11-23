import { getStreamer } from "../data/streamers.js";
import {
  decodeClipPayload,
  getClip,
  incrementViews,
  upsertClip,
  shareUrlFor,
} from "../lib/clips.js";
import { clipPreviewSrc, escapeHtml, sourcePageUrl, platformLabel } from "../lib/embed.js";
import { formatDate, formatDurationLabel, formatTime } from "../lib/time.js";
import { copyShareLink } from "./clipGrid.js";

export function renderWatch(token) {
  const fromUrl = decodeClipPayload(decodeURIComponent(token || ""));
  if (!fromUrl) {
    return `
      <section class="page-block">
        <h1>Clip not found</h1>
        <p class="muted">This share link is invalid or incomplete. Ask the sender for a fresh ClipZone link.</p>
        <a class="btn btn--primary" href="#/clips">My Clips</a>
      </section>
    `;
  }

  const local = getClip(fromUrl.id);
  const clip = local
    ? { ...fromUrl, views: local.views, caption: fromUrl.caption || local.caption }
    : fromUrl;
  const s = getStreamer(clip.streamerId);
  const src = clipPreviewSrc(clip, { autoplay: false });
  const dur = Math.max(1, clip.end - clip.start);
  const views = local ? local.views : 0;
  const inLibrary = Boolean(local);

  return `
    <section class="page-block watch-page" style="--accent:${s ? s.accent : "#c8ff3d"}">
      <header class="page-head">
        <p class="eyebrow">${escapeHtml(s ? s.name : "Clip")}</p>
        <h1>${escapeHtml(clip.caption || "Untitled clip")}</h1>
        <p class="lead">
          ${escapeHtml(platformLabel(clip.source))} · ${formatTime(clip.start)}–${formatTime(clip.end)}
          · ${formatDurationLabel(dur)}
          ${inLibrary ? ` · ${views} local view${views === 1 ? "" : "s"}` : ""}
          · saved ${escapeHtml(formatDate(clip.createdAt))}
        </p>
      </header>

      <div class="preview-frame ${clip.aspect === "9:16" ? "is-vertical" : ""}">
        <div class="preview-inner">
          <iframe
            src="${escapeHtml(src)}"
            title="Shared clip"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <div class="watch-actions">
        <button type="button" class="btn btn--primary" data-copy-watch>Copy link</button>
        ${
          inLibrary
            ? `<span class="muted">Already in your library.</span>`
            : `<button type="button" class="btn btn--ghost" data-save-watch>Save to My Clips</button>`
        }
        <a class="btn btn--ghost" href="${escapeHtml(sourcePageUrl(clip))}" target="_blank" rel="noopener noreferrer">Open source</a>
        ${s ? `<a class="btn btn--ghost" href="#/streamer/${escapeHtml(s.id)}">${escapeHtml(s.name)}'s page</a>` : ""}
      </div>
      <p class="field-hint muted" data-watch-status></p>
    </section>
  `;
}

export function bindWatch(root, token) {
  const clip = decodeClipPayload(decodeURIComponent(token || ""));
  if (!clip) return;

  // Count a view only when this clip already lives in the local library.
  if (getClip(clip.id)) incrementViews(clip.id);

  root.addEventListener("click", async (e) => {
    if (e.target.closest("[data-copy-watch]")) {
      const ok = await copyShareLink(clip);
      const btn = e.target.closest("[data-copy-watch]");
      btn.textContent = ok ? "Copied" : "Copy link";
      setTimeout(() => {
        btn.textContent = "Copy link";
      }, 1400);
      return;
    }
    if (e.target.closest("[data-save-watch]")) {
      upsertClip({ ...clip, views: 0 });
      const status = root.querySelector("[data-watch-status]");
      if (status) status.innerHTML = `Saved. Find it in <a href="#/clips">My Clips</a>.`;
      const btn = e.target.closest("[data-save-watch]");
      btn.disabled = true;
      btn.textContent = "Saved";
    }
  });
}

export { shareUrlFor };
