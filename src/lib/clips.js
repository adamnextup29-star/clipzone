const STORAGE_KEY = "clipzone.clips.v1";

export function loadClips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeClip).filter(Boolean);
  } catch {
    return [];
  }
}

export function saveClips(clips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
}

export function getClip(id) {
  return loadClips().find((c) => c.id === id) || null;
}

export function upsertClip(clip) {
  const clips = loadClips();
  const next = normalizeClip({ ...clip, updatedAt: Date.now() });
  const idx = clips.findIndex((c) => c.id === next.id);
  if (idx === -1) clips.unshift(next);
  else clips[idx] = { ...clips[idx], ...next };
  saveClips(clips);
  return next;
}

export function deleteClip(id) {
  const clips = loadClips().filter((c) => c.id !== id);
  saveClips(clips);
  return clips;
}

export function incrementViews(id) {
  const clips = loadClips();
  const idx = clips.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clips[idx] = { ...clips[idx], views: (Number(clips[idx].views) || 0) + 1 };
  saveClips(clips);
  return clips[idx];
}

export function clipsForStreamer(streamerId) {
  return loadClips().filter((c) => c.streamerId === streamerId);
}

export function createClipId() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return `cz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeClip(clip) {
  if (!clip || typeof clip !== "object") return null;
  const source = clip.source === "twitch" ? "twitch" : clip.source === "youtube" ? "youtube" : null;
  const videoId = String(clip.videoId || "").trim();
  const streamerId = String(clip.streamerId || "").trim();
  if (!source || !videoId || !streamerId) return null;
  let start = Math.max(0, Math.floor(Number(clip.start) || 0));
  let end = Math.max(0, Math.floor(Number(clip.end) || 0));
  if (end && end <= start) end = start + 1;
  return {
    id: String(clip.id || createClipId()),
    streamerId,
    source,
    videoId,
    start,
    end: end || start + 15,
    aspect: clip.aspect === "9:16" ? "9:16" : "16:9",
    caption: String(clip.caption || "").slice(0, 200),
    createdAt: Number(clip.createdAt) || Date.now(),
    views: Math.max(0, Math.floor(Number(clip.views) || 0)),
  };
}

/** Compact, URL-safe encoding so a shared link reconstructs the clip without localStorage. */
export function encodeClipPayload(clip) {
  const c = normalizeClip(clip);
  if (!c) return "";
  const payload = {
    i: c.id,
    s: c.streamerId,
    p: c.source === "twitch" ? "tw" : "yt",
    v: c.videoId,
    a: c.start,
    b: c.end,
    r: c.aspect === "9:16" ? "v" : "w",
    c: c.caption,
    t: c.createdAt,
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeClipPayload(token) {
  if (!token) return null;
  try {
    let b64 = String(token).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json);
    return normalizeClip({
      id: p.i,
      streamerId: p.s,
      source: p.p === "tw" ? "twitch" : "youtube",
      videoId: p.v,
      start: p.a,
      end: p.b,
      aspect: p.r === "v" ? "9:16" : "16:9",
      caption: p.c,
      createdAt: p.t,
      views: 0,
    });
  } catch {
    return null;
  }
}

export function shareUrlFor(clip) {
  const token = encodeClipPayload(clip);
  const base = `${location.origin}${location.pathname}`.replace(/index\.html$/i, "");
  return `${base}#/watch/${token}`;
}

export function sortClips(clips, sort) {
  const list = [...clips];
  if (sort === "views") {
    list.sort((a, b) => (b.views || 0) - (a.views || 0) || b.createdAt - a.createdAt);
  } else {
    list.sort((a, b) => b.createdAt - a.createdAt);
  }
  return list;
}
