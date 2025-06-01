import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDownloadSchema, youtubeUrlSchema, qualitySchema } from "@shared/schema";
import { z } from "zod";

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
  // YouTube download endpoint
  app.post("/api/download", async (req, res) => {
    try {
      // Validate request body
      const { url, quality } = insertDownloadSchema.parse(req.body);
      
      // Additional URL validation
      youtubeUrlSchema.parse({ url });
      qualitySchema.parse(quality);

      // Create download record
      const download = await storage.createDownload({ url, quality });

      // Simulate processing delay
      setTimeout(async () => {
        await storage.updateDownload(download.id, {
          status: "completed",
          progress: 100,
          filename: `youtube_video_${quality}_${download.id}.mp4`
        });
      }, 5000);

      res.json({
        id: download.id,
        url: download.url,
        quality: download.quality,
        status: download.status,
        message: "Download started successfully"
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input",
          errors: error.errors
        });
      }

      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  // Get download status
  app.get("/api/download/:id", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generic download endpoint
  app.get("/api/file/download", (req, res) => {
    const filename = "youtube_video.mp4";
    
    // Create a simple mock MP4-like content
    const mockMP4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // MP4 signature
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x6D, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08
    ]);
    
    const content = "Mock YouTube video content - this would be the actual video stream in production.\n";
    const fullContent = Buffer.concat([mockMP4Header, Buffer.from(content)]);
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', fullContent.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(fullContent);
  });

  // Video info endpoint
  app.get("/api/video-info", async (req, res) => {
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

    } catch (error) {
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
  app.post("/api/validate-url", async (req, res) => {
    try {
      const { url } = youtubeUrlSchema.parse(req.body);
      
      res.json({
        valid: true,
        message: "Valid YouTube URL format"
      });

    } catch (error) {
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
