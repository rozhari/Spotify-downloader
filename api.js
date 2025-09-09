const express = require("express");
const yts = require("yt-search");
const play = require("play-dl");

const app = express();
const PORT = process.env.PORT || 3000;

// Home
app.get("/", (req, res) => {
  res.send("🎵 Spotify Downloader API Running with play-dl ✅");
});

// Spotify → YouTube search
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

    // Search YouTube using spotifyId as keyword
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

// Download YouTube audio
app.get("/download", async (req, res) => {
  const yturl = req.query.url;
  if (!yturl) return res.json({ error: "No YouTube URL provided!" });

  try {
    if (!(await play.validate(yturl))) {
      return res.json({ error: "Invalid YouTube URL!" });
    }

    const info = await play.video_info(yturl);
    const title = info.video_details.title.replace(/[^\w\s]/gi, "_");

    const stream = await play.stream_from_info(info, { quality: 2 });

    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    stream.stream.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.json({ error: "Download failed with play-dl!", youtube: yturl });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Spotify Downloader API running on http://localhost:${PORT}`);
});    }

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

// Download YouTube as MP3
app.get("/download", async (req, res) => {
  const yturl = req.query.url;
  if (!yturl || !ytdl.validateURL(yturl)) {
    return res.json({ error: "Invalid YouTube URL!" });
  }

  try {
    const info = await ytdl.getInfo(yturl, { lang: "en" });
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "_");

    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    ytdl.downloadFromInfo(info, {
      filter: "audioonly",
      quality: "highestaudio",
      requestOptions: { headers: { "User-Agent": "Mozilla/5.0" } },
      highWaterMark: 1 << 25
    }).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.json({
      error: "Download failed! YouTube blocked the request.",
      youtube: yturl
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Spotify Downloader API running on http://localhost:${PORT}`);
});
