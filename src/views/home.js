import { STREAMERS } from "../data/streamers.js";
import { escapeHtml } from "../lib/embed.js";
import { loadClips } from "../lib/clips.js";

export function renderHome() {
  const total = loadClips().length;
  const cards = STREAMERS.map((s, i) => {
    const saved = loadClips().filter((c) => c.streamerId === s.id).length;
    return `
      <a class="streamer-card" href="#/streamer/${escapeHtml(s.id)}" style="--accent:${s.accent};--accent-2:${s.accent2}; --delay:${i * 80}ms">
        <div class="streamer-card__glow" aria-hidden="true"></div>
        <div class="streamer-card__meta">
          <span class="pill">${escapeHtml(s.platform)}</span>
          <span class="muted">${saved ? `${saved} saved clip${saved === 1 ? "" : "s"}` : "No clips yet"}</span>
        </div>
        <h2 class="streamer-card__name">${escapeHtml(s.name)}</h2>
        <p class="streamer-card__full">${escapeHtml(s.fullName)}</p>
        <p class="streamer-card__tag">${escapeHtml(s.tagline)}</p>
        <span class="streamer-card__cta">Open page <span aria-hidden="true">→</span></span>
      </a>
    `;
  }).join("");

  return `
    <section class="hero">
      <div class="hero__orb hero__orb--a" aria-hidden="true"></div>
      <div class="hero__orb hero__orb--b" aria-hidden="true"></div>
      <p class="eyebrow">Fan clip studio</p>
      <h1 class="hero__title">
        <span>CLIP</span><span class="hero__title-accent">ZONE</span>
      </h1>
      <p class="hero__lead">
        Make and share fan clips of <a href="#/streamer/jynxzi">Jynxzi</a>,
        <a href="#/streamer/ron">Ron</a>, and <a href="#/streamer/los">Los</a>.
        Paste a VOD, trim the moment, preview it vertical, and drop a link.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#/maker">Open Clip Maker</a>
        <a class="btn btn--ghost" href="#/clips">My Clips${total ? ` (${total})` : ""}</a>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2>The roster</h2>
        <p class="muted">Official channels only — edit <code>src/data/streamers.js</code> to update handles.</p>
      </div>
      <div class="streamer-grid">
        ${cards}
      </div>
    </section>
  `;
}
