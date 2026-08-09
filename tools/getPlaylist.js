// Vibe coded (using ChatGPT) tool for getting playlist links. ChatGPT did a pretty bad job, so i still had to go in and fix some things... it'll replace devs right guys?
//   also, manually getting playlists was driving me insane, and i didn't want to dive too deep into the youtubei.js api (excuse)
import InnerTube from "youtubei.js";
const youtube = await InnerTube.create();

// Parse CLI argument
const input = process.argv[2];

if (!input) {
  console.error("Usage: node playlist_fetch.js <playlist URL or ID>");
  process.exit(1);
}

// Extract playlist ID from URL or accept raw ID
let playlistId;
try {
  if (input.startsWith("http")) {
    const url = new URL(input);
    playlistId = url.searchParams.get("list");
  } else {
    playlistId = input;
  }
} catch {
  playlistId = input;
}

if (!playlistId) {
  console.error("Error: Cannot extract playlist ID from argument.");
  process.exit(1);
}

// Get title
function extractSongTitle(fullTitle) {
  let title = fullTitle;

  // Remove things in parentheses
  title = title.replace(/\([^)]*\)/g, "").trim();

  // Split on "Artist - Song"
  const parts = title.split(" - ");

  if (parts.length > 1) {
    title = parts.slice(1).join(" - ").trim();
  }

  return title;
}

function parseDuration(badgeText) {
  if (!badgeText) return 0;
  const parts = badgeText.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parts[0] * 60 + parts[1];
}

// Fetch playlist
try {
  const playlist = await youtube.getPlaylist(playlistId);

  console.log(`# Videos: ${playlist.videos.length}`);
  console.log("-------");

  for (const v of playlist.videos) {
    const title = extractSongTitle(v.metadata.title.text);
    const id = v.content_id;
    const badgeText = v.content_image?.overlays?.[0]?.badges?.[0]?.text ?? "0:00";
    const duration = parseDuration(badgeText);
    console.log(
      `'${title}': { a: 'PLACEHOLDER', id: '${id}', d: ${duration} },`
    );
  }
} catch (err) {
  console.error("Failed to fetch playlist:", err);
  process.exit(1);
}
