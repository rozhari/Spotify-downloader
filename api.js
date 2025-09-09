const express = require("express");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

const app = express();
const PORT = process.env.PORT || 3000;

// Home
app.get("/", (req, res) => {
  res.send("🎵 Spotify Downloader API Running ✅");
});

// Spotify -> YouTube Search
app.get("/spotify", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No Spotify URL provided!" });

  try {
    let spotifyId = "";
    let type = "track";

    if (url.includes("/track/")) {
      spotifyId = url.split("/track/")[1].split("?")[0];
    } else if (url.includes("/album/")) {
      type = "album";
      spotifyId = url.split("/album/")[1].split("?")[0];
    } else if (url.includes("/playlist/")) {
      type = "playlist";
      spotifyId = url.split("/playlist/")[1].split("?")[0];
    } else {
      return res.json({ error: "Invalid Spotify URL" });
    }

    // Just use ID as query for now (since no Spotify API key)
    const search = await yts(spotifyId);
    if (!search.videos || search.videos.length === 0) {
      return res.json({ error: "No matching song found!" });
    }

    const video = search.videos[0];

    res.json({
      status: "success",
      spotify_type: type,
      spotify_id: spotifyId,
      youtube: `https://youtu.be/${video.videoId}`,
      title: video.title,
      duration: video.timestamp,
      download: `${req.protocol}://${req.get("host")}/download?url=https://youtu.be/${video.videoId}`
    });
  } catch (err) {
    console.error("Spotify API error:", err);
    res.json({ error: "Failed to process Spotify link!" });
  }
});

// Download endpoint
app.get("/download", async (req, res) => {
  const yturl = req.query.url;
  if (!yturl || !ytdl.validateURL(yturl)) {
    return res.json({ error: "Invalid YouTube URL!" });
  }

  try {
    res.header("Content-Disposition", 'attachment; filename="song.mp3"');
    ytdl(yturl, { filter: "audioonly", quality: "highestaudio" }).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.json({ error: "Download failed!" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Spotify Downloader API running on http://localhost:${PORT}`);
});
