import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDownloadSchema, youtubeUrlSchema, qualitySchema } from "@shared/schema";
import { z } from "zod";
import { YtDlp, type VideoInfo } from 'ytdlp-nodejs';
import stream from 'stream';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Helper function to parse ISO 8601 duration
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Helper function to format view count
function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const ytdlp = new YtDlp();
  const cookiesFilePath = path.join(os.tmpdir(), 'cookies.txt');

  // Function to prepare cookies file if content is available
  async function prepareCookies(): Promise<string | undefined> {
    const cookiesContent = process.env.YOUTUBE_COOKIES_CONTENT;
    if (cookiesContent && cookiesContent.trim() !== "") {
      try {
        await fs.writeFile(cookiesFilePath, cookiesContent);
        console.log("YouTube cookies file prepared at:", cookiesFilePath);
        return cookiesFilePath;
      } catch (error) {
        console.error("Failed to write temporary cookies file:", error);
        return undefined;
      }
    } else {
      console.log("YOUTUBE_COOKIES_CONTENT environment variable not set or empty. Proceeding without cookies.");
      return undefined;
    }
  }

  // YouTube download endpoint
  app.get("/api/download", async (req: Request, res: Response) => {
    try {
      const url = req.query.url as string;
      const quality = req.query.quality as string;

      if (!url) {
        return res.status(400).json({ message: "URL parameter is required" });
      }
      if (!quality) {
        // Quality parameter is kept for now, but ytdlp-nodejs might use its own format selection.
        // We can let yt-dlp decide the best format or pass specific format codes later.
        console.log("Quality parameter provided, but yt-dlp will determine best format for now.");
      }

      youtubeUrlSchema.parse({ url });

      console.log(`Attempting to download: ${url}`);

      const activeCookiesFile = await prepareCookies();
      const ytdlpOptions: Record<string, any> = {};
      if (activeCookiesFile) {
        ytdlpOptions.cookies = activeCookiesFile;
      }

      const videoInfoResponse = await ytdlp.getInfoAsync(url, ytdlpOptions);

      // Type guard for VideoInfo
      if (videoInfoResponse._type !== 'video') {
        console.error("Requested URL is a playlist or not a single video.");
        return res.status(400).json({ message: "Downloading playlists is not supported. Please provide a single video URL." });
      }
      
      const videoInfo = videoInfoResponse as VideoInfo; // Cast to VideoInfo after check

      const videoTitle = videoInfo.title.replace(/[^a-zA-Z0-9\\s_\\-\\[\\]\\(\\)]/g, '_') || 'youtube_video';
      const filename = `${videoTitle}.${videoInfo.ext || 'mp4'}`;

      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
      const mimeType = videoInfo.ext === 'webm' ? 'video/webm' : 'video/mp4';
      res.setHeader('Content-Type', mimeType);

      let fileSize = videoInfo.filesize || videoInfo.filesize_approx;
      // yt-dlp sometimes returns format specific filesize in videoInfo.formats
      // For simplicity, we'll try to use the top-level filesize if available.
      // If precise quality selection is implemented, we'd pick the filesize from the selected format.
      if (fileSize) {
        res.setHeader('Content-Length', fileSize.toString());
      } else {
        console.warn(`Content-Length not available for ${filename}. Client might not show download progress accurately.`);
      }
      
      // Prepare arguments for ytdlp.stream
      let formatString = `best[ext=mp4][height<=?${quality.replace('p','')}]/best[ext=webm][height<=?${quality.replace('p','')}]/best`;
      if (quality.toLowerCase() === 'best') {
          formatString = 'best';
      }

      const streamOptions: Record<string, any> = {
        format: formatString,
      };
      if (activeCookiesFile) {
        streamOptions.cookies = activeCookiesFile;
      }

      console.log(`Requesting stream with format: ${formatString} and options:`, streamOptions);
      const ytdlpReadableStream = ytdlp.stream(url, streamOptions);
      
      if (ytdlpReadableStream && typeof ytdlpReadableStream.pipeAsync === 'function') {
        console.log(`Streaming video: ${filename} to client.`);
        // Pipe the stream to the response.
        // pipeAsync handles piping and promise resolution/rejection.
        await ytdlpReadableStream.pipeAsync(res);
        console.log(`Finished streaming ${filename}.`);
      } else {
        console.error('Failed to get a ytdlp.stream object with pipeAsync method.');
        if (!res.headersSent) {
            return res.status(500).json({ message: "Failed to get video stream object" });
        }
      }

    } catch (error: any) {
      console.error("Download processing error:", error);
      if (!res.headersSent) {
        let statusCode = 500;
        let message = "Internal server error during video processing.";

        if (error instanceof z.ZodError) {
          statusCode = 400;
          message = "Invalid input";
          return res.status(statusCode).json({ message, errors: error.errors });
        }
        
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes("age restricted")) {
            statusCode = 403;
            message = "Video is age restricted and cannot be downloaded.";
        } else if (errorMessage.includes("private video") || errorMessage.includes("video is private")) {
            statusCode = 403;
            message = "Video is private and cannot be downloaded.";
        } else if (errorMessage.includes("unavailable")) {
            statusCode = 404;
            message = "Video is unavailable.";
        } else if (errorMessage.includes("no formats found") || errorMessage.includes("format not available")) {
            statusCode = 404;
            message = `Requested quality (${req.query.quality}) not available for this video. Try a different quality.`;
        }
         else if (error.stderr && error.stderr.toLowerCase().includes("aria2c")) {
            statusCode = 500;
            message = "Error with download accelerator. Please ensure yt-dlp is configured correctly without Aria2c or check Aria2c setup.";
        }


        res.status(statusCode).json({
          message: message,
          details: error.message // Include original error message for more context on client/logs if needed
        });
      } else {
        // If headers are already sent, we can't send a JSON error response.
        // We should ensure the stream is destroyed if it hasn't been.
        console.error("Error after headers sent, client response might be incomplete.");
        if (req.socket) req.socket.destroy(); // Forcefully close the connection
      }
    } finally {
      // Clean up temporary cookies file if it was created
      if (process.env.YOUTUBE_COOKIES_CONTENT && process.env.YOUTUBE_COOKIES_CONTENT.trim() !== "") {
        try {
          await fs.unlink(cookiesFilePath);
          console.log("Temporary cookies file deleted.");
        } catch (cleanupError) {
          console.error("Failed to delete temporary cookies file:", cleanupError);
        }
      }
    }
  });

  // Get download status
  app.get("/api/download/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid download ID" });
      }

      const download = await storage.getDownload(id);
      if (!download) {
        return res.status(404).json({ message: "Download not found" });
      }

      res.json(download);
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Video info endpoint
  app.get("/api/video-info", async (req: Request, res: Response) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ message: "URL parameter required" });
      }

      // Validate URL format
      youtubeUrlSchema.parse({ url });
      
      // Extract video ID from URL
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (!videoIdMatch) {
        return res.status(400).json({ message: "Could not extract video ID from URL" });
      }
      
      const videoId = videoIdMatch[1];
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      // Fetch video data from YouTube API
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch video data from YouTube" });
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return res.status(404).json({ message: "Video not found or is private" });
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      // Parse duration from ISO 8601 format
      const duration = contentDetails.duration;
      const parsedDuration = parseDuration(duration);

      // Format view count
      const viewCount = statistics.viewCount ? formatViewCount(parseInt(statistics.viewCount)) : undefined;

      // Format upload date
      const uploadDate = new Date(snippet.publishedAt).toLocaleDateString();

      const videoInfo = {
        title: snippet.title,
        duration: parsedDuration,
        thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url,
        viewCount,
        uploadDate,
        availableQualities: ["360p", "480p", "720p", "1080p"], // This would need yt-dlp to get actual formats
        isAgeRestricted: contentDetails.contentRating?.ytRating === "ytAgeRestricted"
      };

      res.json(videoInfo);

    } catch (error: any) {
      console.error("Video info error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid YouTube URL format"
        });
      }

      res.status(500).json({
        message: "Failed to fetch video information"
      });
    }
  });

  // URL validation endpoint
  app.post("/api/validate-url", async (req: Request, res: Response) => {
    try {
      const { url } = youtubeUrlSchema.parse(req.body);
      
      res.json({
        valid: true,
        message: "Valid YouTube URL format"
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          valid: false,
          message: "Invalid YouTube URL format"
        });
      }

      res.status(500).json({
        valid: false,
        message: "Failed to validate URL"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
