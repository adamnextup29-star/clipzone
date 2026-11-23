import { getStreamer } from "../data/streamers.js";
import { clipsForStreamer, sortClips } from "../lib/clips.js";
import { escapeHtml, liveEmbedSrc, platformLabel } from "../lib/embed.js";
import { renderClipGrid, emptyState } from "./clipGrid.js";

const LINK_LABELS = {
  kick: "Kick",
  twitch: "Twitch",
  clips: "Official clips",
  vods: "Twitch VODs",
  kickVods: "Kick VODs",
  youtube: "YouTube",
  youtubeLive: "YouTube Live",
  youtubeVods: "YouTube VODs",
  x: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
  website: "Website",
};

export function renderStreamer(id) {
  const s = getStreamer(id);
  if (!s) {
    return `
      <section class="page-block">
        <h1>Streamer not found</h1>
        <p class="muted">That roster slot does not exist.</p>
        <a class="btn btn--primary" href="#/">Back home</a>
      </section>
    `;
  }

  const src = liveEmbedSrc(s.live);
  const platform = s.live.platform === "kick" ? "Kick" : "Twitch";
  const clips = sortClips(clipsForStreamer(s.id), "new");
  const official = officialLinks(s);

  return `
    <section class="streamer-page" style="--accent:${s.accent};--accent-2:${s.accent2}">
      <header class="page-head">
        <p class="eyebrow">${escapeHtml(s.fullName)}</p>
        <h1>${escapeHtml(s.name)}</h1>
        <p class="lead">${escapeHtml(s.bio)}</p>
      </header>

      <div class="live-stage">
        <div class="live-stage__frame">
          <iframe
            src="${escapeHtml(src)}"
            title="${escapeHtml(s.name)} live on ${platform}"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
        <p class="live-stage__note muted">
          Live ${platform} player for <strong>${escapeHtml(s.handle)}</strong>.
          If they are offline, the embed will show the offline state from ${platform}.
        </p>
      </div>

      <div class="link-row" aria-label="Official links">
        ${official}
      </div>

      <div class="section__head section__head--tight">
        <h2>Saved clips of ${escapeHtml(s.name)}</h2>
        <a class="btn btn--ghost btn--sm" href="#/maker">Make a clip</a>
      </div>
      ${
        clips.length
          ? renderClipGrid(clips)
          : emptyState(
              `No clips tagged ${s.name} yet.`,
              "Paste a VOD in the Clip Maker, tag this streamer, and save it. Nothing here is pre-loaded or faked."
            )
      }
    </section>
  `;
}

function officialLinks(s) {
  const order = [
    "kick",
    "twitch",
    "clips",
    "kickVods",
    "vods",
    "youtube",
    "youtubeLive",
    "youtubeVods",
    "x",
    "tiktok",
    "instagram",
    "website",
  ];
  return order
    .filter((key) => s.links[key])
    .map((key) => {
      const label = LINK_LABELS[key] || key;
      return `<a class="chip" href="${escapeHtml(s.links[key])}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    })
    .join("");
}

export { platformLabel };
