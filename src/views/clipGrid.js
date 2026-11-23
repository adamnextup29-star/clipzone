import { getStreamer } from "../data/streamers.js";
import { escapeHtml, platformLabel } from "../lib/embed.js";
import { formatDurationLabel, formatTime, formatDate } from "../lib/time.js";
import { shareUrlFor } from "../lib/clips.js";

export function renderClipGrid(clips, { showDelete = false } = {}) {
  const cards = clips.map((clip) => clipCard(clip, { showDelete })).join("");
  return `<div class="clip-grid">${cards}</div>`;
}

export function clipCard(clip, { showDelete = false } = {}) {
  const s = getStreamer(clip.streamerId);
  const accent = s ? s.accent : "#c8ff3d";
  const name = s ? s.name : clip.streamerId;
  const dur = Math.max(1, (clip.end || 0) - (clip.start || 0));
  const views = Number(clip.views) || 0;
  return `
    <article class="clip-card" style="--accent:${accent}" data-clip-id="${escapeHtml(clip.id)}">
      <a class="clip-card__hit" href="#/watch/${encodeURIComponent(shareToken(clip))}">
        <div class="clip-card__thumb ${clip.aspect === "9:16" ? "is-vertical" : ""}">
          <span class="clip-card__play" aria-hidden="true">▶</span>
          <span class="clip-card__aspect">${escapeHtml(clip.aspect)}</span>
        </div>
        <div class="clip-card__body">
          <div class="clip-card__meta">
            <span class="pill pill--tiny">${escapeHtml(name)}</span>
            <span class="muted">${escapeHtml(platformLabel(clip.source))}</span>
          </div>
          <h3 class="clip-card__title">${escapeHtml(clip.caption || "Untitled clip")}</h3>
          <p class="muted clip-card__stats">
            ${formatTime(clip.start)}–${formatTime(clip.end)} · ${formatDurationLabel(dur)}
            · ${views} view${views === 1 ? "" : "s"}
            · ${escapeHtml(formatDate(clip.createdAt))}
          </p>
        </div>
      </a>
      <div class="clip-card__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-copy-link="${escapeHtml(clip.id)}">Copy link</button>
        ${showDelete ? `<button type="button" class="btn btn--danger btn--sm" data-delete-clip="${escapeHtml(clip.id)}">Delete</button>` : ""}
      </div>
    </article>
  `;
}

function shareToken(clip) {
  // Keep the href in sync with shareUrlFor, but only the hash payload.
  const url = shareUrlFor(clip);
  const idx = url.indexOf("#/watch/");
  return idx >= 0 ? url.slice(idx + 8) : "";
}

export function emptyState(title, body, href = "#/maker", cta = "Open Clip Maker") {
  return `
    <div class="empty">
      <h3>${escapeHtml(title)}</h3>
      <p class="muted">${escapeHtml(body)}</p>
      <a class="btn btn--primary" href="${escapeHtml(href)}">${escapeHtml(cta)}</a>
    </div>
  `;
}

export async function copyShareLink(clip) {
  const url = shareUrlFor(clip);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    window.prompt("Copy this clip link:", url);
    return false;
  }
}
