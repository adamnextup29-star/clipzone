/**
 * Streamer roster — edit this file to change names, handles, socials, or colors.
 *
 * Primary live platforms:
 *   Jynxzi  -> Twitch  (jynxzi)
 *   Ron     -> Twitch  (stableronaldo)  [Stable Ronaldo / Rani Netz]
 *   Los     -> Kick    (lospollostv)    [LosPollosTV / Louis Sammartino]
 */
export const STREAMERS = [
  {
    id: "jynxzi",
    name: "Jynxzi",
    fullName: "Jynxzi",
    realName: "Nick Stewart",
    tagline: "High-energy Siege, variety, and chaos.",
    bio: "Twitch streamer known for Rainbow Six Siege, variety streams, and larger-than-life reactions.",
    accent: "#b56cff",
    accent2: "#6d28d9",
    platform: "twitch",
    handle: "jynxzi",
    live: { platform: "twitch", channel: "jynxzi" },
    links: {
      twitch: "https://www.twitch.tv/jynxzi",
      clips: "https://www.twitch.tv/jynxzi/clips",
      vods: "https://www.twitch.tv/jynxzi/videos",
      youtube: "https://www.youtube.com/@jynxzi",
      youtubeLive: "https://www.youtube.com/@MoreJynxzi",
      youtubeVods: "https://www.youtube.com/@jynxzivod",
      x: "https://x.com/jynxzi",
      tiktok: "https://www.tiktok.com/@jynxziontwitch",
      instagram: "https://www.instagram.com/jynxzi",
    },
  },
  {
    id: "ron",
    name: "Ron",
    fullName: "Stable Ronaldo",
    realName: "Rani Netz",
    tagline: "The clip himself. Loud IRL and variety.",
    bio: "Streamer known as Stable Ronaldo — frequent collaborator with Jynxzi and Los, including their Chained Together marathon.",
    accent: "#ffcc1a",
    accent2: "#ff8a00",
    platform: "twitch",
    handle: "stableronaldo",
    live: { platform: "twitch", channel: "stableronaldo" },
    links: {
      twitch: "https://www.twitch.tv/stableronaldo",
      clips: "https://www.twitch.tv/stableronaldo/clips",
      vods: "https://www.twitch.tv/stableronaldo/videos",
      youtube: "https://www.youtube.com/@StableRonaldoYT",
      youtubeLive: "https://www.youtube.com/@StableRonaldoLive",
      x: "https://x.com/StableRonaldo",
      tiktok: "https://www.tiktok.com/@realstableronaldo",
      instagram: "https://www.instagram.com/stableronaldo",
    },
  },
  {
    id: "los",
    name: "Los",
    fullName: "LosPollosTV",
    realName: "Louis Sammartino",
    tagline: "The Pollo Lounge. Kick streams and collabs.",
    bio: "Kick and Twitch streamer LosPollosTV — part of the Jynxzi, Ron, and Los collab crew.",
    accent: "#ff4d2e",
    accent2: "#ff8a3d",
    platform: "kick",
    handle: "lospollostv",
    live: { platform: "kick", channel: "lospollostv" },
    links: {
      kick: "https://kick.com/lospollostv",
      twitch: "https://www.twitch.tv/lospollostv",
      clips: "https://www.twitch.tv/lospollostv/clips",
      vods: "https://www.twitch.tv/lospollostv/videos",
      kickVods: "https://kick.com/lospollostv/videos",
      youtube: "https://www.youtube.com/@lospollostvgaming",
      x: "https://x.com/LosPollosTV",
      instagram: "https://www.instagram.com/lospollosig",
      tiktok: "https://www.tiktok.com/@lospollostt",
      website: "https://pollos.tv/",
    },
  },
];

export function getStreamer(id) {
  return STREAMERS.find((s) => s.id === id) || null;
}

export const STREAMER_IDS = STREAMERS.map((s) => s.id);
