import { STREAMERS, getStreamer } from "../data/streamers.js";
import { parseVideoUrl } from "../lib/parseUrl.js";
import { parseTime, formatTime } from "../lib/time.js";
import {
  createClipId,
  upsertClip,
  shareUrlFor,
  normalizeClip,
} from "../lib/clips.js";
import { clipPreviewSrc, escapeHtml, sourcePageUrl, platformLabel } from "../lib/embed.js";
import { copyShareLink } from "./clipGrid.js";

const DEFAULT_SPAN = 15;
const DEFAULT_MAX = 10 * 60;

const draft = {
  source: null,
  videoId: null,
  streamerId: "jynxzi",
  start: 0,
  end: DEFAULT_SPAN,
  aspect: "16:9",
  caption: "",
  sliderMax: DEFAULT_MAX,
  lastSaved: null,
};

export function renderMaker() {
  const options = STREAMERS.map(
    (s) =>
      `<option value="${escapeHtml(s.id)}" ${s.id === draft.streamerId ? "selected" : ""}>${escapeHtml(s.name)} — ${escapeHtml(s.fullName)}</option>`
  ).join("");

  return `
    <section class="page-block maker">
      <header class="page-head">
        <p class="eyebrow">Studio</p>
        <h1>Clip Maker</h1>
        <p class="lead">
          Paste a YouTube video or Twitch VOD link, mark the start and end, preview the cut in 16:9 or vertical 9:16, then save it to this browser and copy a shareable link.
        </p>
      </header>

      <div class="maker-layout">
        <form class="maker-form" id="maker-form" novalidate>
          <label class="field">
            <span>Video URL</span>
            <input id="clip-url" type="url" name="url" placeholder="https://www.youtube.com/watch?v=… or https://www.twitch.tv/videos/…" autocomplete="off" />
          </label>
          <p class="field-hint muted" id="url-status">YouTube and Twitch VOD links only. Live channel URLs will not work.</p>

          <label class="field">
            <span>Tag streamer</span>
            <select id="clip-streamer" name="streamer">${options}</select>
          </label>

          <div class="time-grid">
            <label class="field">
              <span>Start</span>
              <input id="clip-start" type="text" inputmode="numeric" placeholder="0:00" value="${formatTime(draft.start)}" />
            </label>
            <label class="field">
              <span>End</span>
              <input id="clip-end" type="text" inputmode="numeric" placeholder="0:15" value="${formatTime(draft.end)}" />
            </label>
            <label class="field">
              <span>Slider length</span>
              <input id="clip-max" type="text" inputmode="numeric" placeholder="10:00" value="${formatTime(draft.sliderMax)}" />
            </label>
          </div>

          <div class="range-wrap">
            <div class="range-pair" id="range-pair">
              <input id="range-start" type="range" min="0" max="${draft.sliderMax}" step="1" value="${draft.start}" aria-label="Start time" />
              <input id="range-end" type="range" min="0" max="${draft.sliderMax}" step="1" value="${draft.end}" aria-label="End time" />
            </div>
            <div class="range-labels muted">
              <span id="range-start-label">${formatTime(draft.start)}</span>
              <span id="range-end-label">${formatTime(draft.end)}</span>
            </div>
          </div>

          <fieldset class="segment">
            <legend>Preview frame</legend>
            <div class="segment__opts">
              <label class="radio-pill">
                <input type="radio" name="aspect" value="16:9" ${draft.aspect === "16:9" ? "checked" : ""} />
                <span>16:9 widescreen</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="aspect" value="9:16" ${draft.aspect === "9:16" ? "checked" : ""} />
                <span>9:16 vertical (TikTok / Shorts)</span>
              </label>
            </div>
          </fieldset>

          <label class="field">
            <span>Caption</span>
            <input id="clip-caption" type="text" maxlength="200" placeholder="What's the moment?" value="${escapeHtml(draft.caption)}" />
          </label>

          <div class="maker-actions">
            <button type="submit" class="btn btn--primary" id="save-clip">Save clip</button>
            <button type="button" class="btn btn--ghost" id="copy-saved" ${draft.lastSaved ? "" : "disabled"}>Copy share link</button>
          </div>
          <p class="field-hint muted" id="save-status"></p>
        </form>

        <div class="maker-preview">
          <div id="preview-shell">${renderPreview()}</div>
        </div>
      </div>
    </section>
  `;
}

function currentClipShape() {
  if (!draft.source || !draft.videoId) return null;
  return normalizeClip({
    id: draft.lastSaved?.id || createClipId(),
    streamerId: draft.streamerId,
    source: draft.source,
    videoId: draft.videoId,
    start: draft.start,
    end: draft.end,
    aspect: draft.aspect,
    caption: draft.caption,
    createdAt: draft.lastSaved?.createdAt || Date.now(),
    views: draft.lastSaved?.views || 0,
  });
}

function renderPreview() {
  const clip = currentClipShape();
  if (!clip) {
    return `
      <div class="preview-empty">
        <p>Preview appears here after you paste a video link.</p>
      </div>
    `;
  }
  const src = clipPreviewSrc(clip);
  const s = getStreamer(clip.streamerId);
  const note =
    clip.source === "twitch"
      ? "Twitch VODs start at the time you set. Twitch does not support an end timestamp in the player, so the official start time is used."
      : "YouTube preview uses start and end parameters, so this should play exactly your segment.";
  return `
    <div class="preview-frame ${clip.aspect === "9:16" ? "is-vertical" : ""}">
      <div class="preview-inner">
        <iframe
          src="${escapeHtml(src)}"
          title="Clip preview"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </div>
    </div>
    <div class="preview-meta">
      <span class="pill">${escapeHtml(s ? s.name : clip.streamerId)}</span>
      <span class="muted">${escapeHtml(platformLabel(clip.source))} · ${formatTime(clip.start)}–${formatTime(clip.end)}</span>
      <a class="text-link" href="${escapeHtml(sourcePageUrl(clip))}" target="_blank" rel="noopener noreferrer">Open source</a>
    </div>
    <p class="field-hint muted">${note}</p>
  `;
}

export function bindMaker(root) {
  const urlInput = root.querySelector("#clip-url");
  const status = root.querySelector("#url-status");
  const startInput = root.querySelector("#clip-start");
  const endInput = root.querySelector("#clip-end");
  const maxInput = root.querySelector("#clip-max");
  const rangeStart = root.querySelector("#range-start");
  const rangeEnd = root.querySelector("#range-end");
  const startLabel = root.querySelector("#range-start-label");
  const endLabel = root.querySelector("#range-end-label");
  const streamerSelect = root.querySelector("#clip-streamer");
  const captionInput = root.querySelector("#clip-caption");
  const previewShell = root.querySelector("#preview-shell");
  const form = root.querySelector("#maker-form");
  const saveStatus = root.querySelector("#save-status");
  const copyBtn = root.querySelector("#copy-saved");

  let previewTimer = 0;

  function refreshPreview(immediate = false) {
    const run = () => {
      if (previewShell) previewShell.innerHTML = renderPreview();
    };
    if (immediate) {
      clearTimeout(previewTimer);
      run();
      return;
    }
    clearTimeout(previewTimer);
    previewTimer = setTimeout(run, 280);
  }

  function syncTimeUi() {
    startInput.value = formatTime(draft.start);
    endInput.value = formatTime(draft.end);
    maxInput.value = formatTime(draft.sliderMax);
    rangeStart.max = String(draft.sliderMax);
    rangeEnd.max = String(draft.sliderMax);
    rangeStart.value = String(Math.min(draft.start, draft.sliderMax));
    rangeEnd.value = String(Math.min(draft.end, draft.sliderMax));
    startLabel.textContent = formatTime(draft.start);
    endLabel.textContent = formatTime(draft.end);
  }

  function setTimes({ start, end, max }, { preview = true } = {}) {
    if (typeof max === "number" && Number.isFinite(max)) {
      draft.sliderMax = Math.max(15, Math.floor(max));
    }
    if (typeof start === "number" && Number.isFinite(start)) {
      draft.start = Math.max(0, Math.floor(start));
    }
    if (typeof end === "number" && Number.isFinite(end)) {
      draft.end = Math.max(0, Math.floor(end));
    }
    if (draft.end <= draft.start) draft.end = draft.start + 1;
    if (draft.end > draft.sliderMax) draft.sliderMax = draft.end;
    if (draft.start > draft.sliderMax) draft.sliderMax = draft.start + 15;
    syncTimeUi();
    if (preview) refreshPreview();
  }

  function applyParsed(result) {
    draft.source = result.source;
    draft.videoId = result.videoId;
    const start = result.start || 0;
    const end = start + DEFAULT_SPAN;
    const max = Math.max(DEFAULT_MAX, end + 60);
    draft.lastSaved = null;
    copyBtn.disabled = true;
    setTimes({ start, end, max }, { preview: false });
    refreshPreview(true);
    status.textContent = `Loaded ${result.source === "twitch" ? "Twitch VOD" : "YouTube video"} ${result.videoId}. Adjust the window, then save.`;
  }

  function tryParseUrl() {
    const result = parseVideoUrl(urlInput.value);
    if (result.error) {
      draft.source = null;
      draft.videoId = null;
      status.textContent = result.error;
      refreshPreview(true);
      return false;
    }
    applyParsed(result);
    return true;
  }

  urlInput.addEventListener("change", tryParseUrl);
  urlInput.addEventListener("blur", () => {
    if (urlInput.value.trim()) tryParseUrl();
  });
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryParseUrl();
    }
  });

  streamerSelect.addEventListener("change", () => {
    draft.streamerId = streamerSelect.value;
    refreshPreview(true);
  });

  captionInput.addEventListener("input", () => {
    draft.caption = captionInput.value.slice(0, 200);
  });

  root.querySelectorAll('input[name="aspect"]').forEach((el) => {
    el.addEventListener("change", () => {
      if (el.checked) {
        draft.aspect = el.value === "9:16" ? "9:16" : "16:9";
        refreshPreview(true);
      }
    });
  });

  startInput.addEventListener("change", () => {
    const v = parseTime(startInput.value);
    if (v == null) {
      startInput.value = formatTime(draft.start);
      return;
    }
    setTimes({ start: v });
  });
  endInput.addEventListener("change", () => {
    const v = parseTime(endInput.value);
    if (v == null) {
      endInput.value = formatTime(draft.end);
      return;
    }
    setTimes({ end: v });
  });
  maxInput.addEventListener("change", () => {
    const v = parseTime(maxInput.value);
    if (v == null || v < 15) {
      maxInput.value = formatTime(draft.sliderMax);
      return;
    }
    setTimes({ max: v }, { preview: false });
  });

  rangeStart.addEventListener("input", () => {
    let start = Number(rangeStart.value);
    let end = draft.end;
    if (start >= end) end = start + 1;
    setTimes({ start, end });
  });
  rangeEnd.addEventListener("input", () => {
    let end = Number(rangeEnd.value);
    let start = draft.start;
    if (end <= start) start = Math.max(0, end - 1);
    setTimes({ start, end });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!draft.source || !draft.videoId) {
      tryParseUrl();
    }
    const clip = currentClipShape();
    if (!clip) {
      saveStatus.textContent = "Paste a valid YouTube or Twitch VOD link first.";
      return;
    }
    clip.caption = (captionInput.value || "").slice(0, 200);
    draft.caption = clip.caption;
    const saved = upsertClip(clip);
    draft.lastSaved = saved;
    copyBtn.disabled = false;
    saveStatus.innerHTML = `Saved to this browser. Open it in <a href="#/clips">My Clips</a> or copy the share link.`;
  });

  copyBtn.addEventListener("click", async () => {
    if (!draft.lastSaved) return;
    const ok = await copyShareLink(draft.lastSaved);
    copyBtn.textContent = ok ? "Copied" : "Copy share link";
    setTimeout(() => {
      copyBtn.textContent = "Copy share link";
    }, 1400);
  });
}

export { shareUrlFor };
