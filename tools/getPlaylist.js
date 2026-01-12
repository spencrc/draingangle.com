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
function extractSongTitle(fullTitleObj) {
  const fullTitle = fullTitleObj?.text ?? "";
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

// Fetch playlist
try {
  const playlist = await youtube.getPlaylist(playlistId);

  console.log(`# Videos: ${playlist.videos.length}`);
  console.log("-------");

  for (const v of playlist.videos) {
    const title = extractSongTitle(v.title);
    console.log(
      `'${title}': { a: 'PLACEHOLDER', id: '${v.id}', d: ${v.duration.seconds} },`
    );
  }
} catch (err) {
  console.error("Failed to fetch playlist:", err);
  process.exit(1);
}
