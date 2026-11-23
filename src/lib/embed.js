import { formatTwitchTime } from "./time.js";

export function twitchParent() {
  const host = (typeof window !== "undefined" && window.location && window.location.hostname) || "localhost";
  return host || "localhost";
}

export function liveEmbedSrc(live) {
  if (!live || !live.channel) return "";
  if (live.platform === "kick") {
    return `https://player.kick.com/${encodeURIComponent(live.channel)}`;
  }
  const parent = encodeURIComponent(twitchParent());
  return `https://player.twitch.tv/?channel=${encodeURIComponent(live.channel)}&parent=${parent}&autoplay=false&muted=true`;
}

export function clipPreviewSrc(clip, { autoplay = false } = {}) {
  if (!clip) return "";
  if (clip.source === "youtube") {
    const params = new URLSearchParams({
      start: String(clip.start || 0),
      rel: "0",
      modestbranding: "1",
      autoplay: autoplay ? "1" : "0",
    });
    if (clip.end && clip.end > clip.start) params.set("end", String(clip.end));
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(clip.videoId)}?${params.toString()}`;
  }
  if (clip.source === "twitch") {
    const parent = encodeURIComponent(twitchParent());
    const time = formatTwitchTime(clip.start || 0);
    const auto = autoplay ? "true" : "false";
    return `https://player.twitch.tv/?video=${encodeURIComponent(clip.videoId)}&time=${time}&parent=${parent}&autoplay=${auto}&muted=${autoplay ? "false" : "true"}`;
  }
  return "";
}

export function sourcePageUrl(clip) {
  if (!clip) return "";
  if (clip.source === "youtube") {
    const t = clip.start ? `&t=${clip.start}s` : "";
    return `https://www.youtube.com/watch?v=${encodeURIComponent(clip.videoId)}${t}`;
  }
  if (clip.source === "twitch") {
    const t = clip.start ? `?t=${formatTwitchTime(clip.start)}` : "";
    return `https://www.twitch.tv/videos/${encodeURIComponent(clip.videoId)}${t}`;
  }
  return "";
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function platformLabel(source) {
  if (source === "twitch") return "Twitch VOD";
  if (source === "youtube") return "YouTube";
  if (source === "kick") return "Kick";
  return source || "";
}
