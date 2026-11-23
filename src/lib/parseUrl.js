import { parseTime } from "./time.js";

/**
 * Parse a YouTube video URL or Twitch VOD URL into a normalized source.
 * Returns { source: "youtube"|"twitch", videoId, start } or { error }.
 */
export function parseVideoUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return { error: "Paste a YouTube or Twitch VOD link." };

  let url;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return { error: "That does not look like a valid URL." };
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
    const id = extractYouTubeId(url);
    if (!id) return { error: "Could not find a YouTube video ID in that link." };
    const start = extractYouTubeStart(url);
    return { source: "youtube", videoId: id, start };
  }

  if (host === "twitch.tv" || host === "m.twitch.tv" || host === "clips.twitch.tv") {
    const vod = extractTwitchVod(url);
    if (!vod) {
      return {
        error: "Use a Twitch VOD link (twitch.tv/videos/… ), not a live channel or clip page.",
      };
    }
    return { source: "twitch", videoId: vod.id, start: vod.start };
  }

  return { error: "Only YouTube videos and Twitch VODs are supported right now." };
}

function extractYouTubeId(url) {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return isYouTubeId(id) ? id : null;
  }
  const v = url.searchParams.get("v");
  if (isYouTubeId(v)) return v;

  const parts = url.pathname.split("/").filter(Boolean);
  // /embed/ID, /shorts/ID, /live/ID, /v/ID, /watch/ID
  const prefixed = ["embed", "shorts", "live", "v", "watch"];
  if (parts.length >= 2 && prefixed.includes(parts[0]) && isYouTubeId(parts[1])) {
    return parts[1];
  }
  return null;
}

function isYouTubeId(id) {
  return typeof id === "string" && /^[\w-]{11}$/.test(id);
}

function extractYouTubeStart(url) {
  const t = url.searchParams.get("t") || url.searchParams.get("start") || url.searchParams.get("time_continue");
  if (t) {
    const seconds = parseYouTubeTimeParam(t);
    if (seconds != null) return seconds;
  }
  if (url.hash) {
    const m = url.hash.match(/t=([^&]+)/);
    if (m) {
      const seconds = parseYouTubeTimeParam(m[1]);
      if (seconds != null) return seconds;
    }
  }
  return 0;
}

function parseYouTubeTimeParam(value) {
  const raw = String(value).trim();
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (m && (m[1] || m[2] || m[3])) {
    return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
  }
  const colon = parseTime(raw);
  return colon;
}

function extractTwitchVod(url) {
  const parts = url.pathname.split("/").filter(Boolean);
  let id = null;
  // /videos/123456789
  const vidIdx = parts.findIndex((p) => p === "videos" || p === "video");
  if (vidIdx !== -1 && parts[vidIdx + 1] && /^\d+$/.test(parts[vidIdx + 1])) {
    id = parts[vidIdx + 1];
  }
  // /channel/v/123456789 (legacy)
  if (!id) {
    const vIdx = parts.findIndex((p) => p === "v");
    if (vIdx !== -1 && parts[vIdx + 1] && /^\d+$/.test(parts[vIdx + 1])) {
      id = parts[vIdx + 1];
    }
  }
  if (!id) return null;

  const t = url.searchParams.get("t") || url.searchParams.get("time");
  let start = 0;
  if (t) {
    const parsed = parseYouTubeTimeParam(t);
    if (parsed != null) start = parsed;
  }
  return { id, start };
}
