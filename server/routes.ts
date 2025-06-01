import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDownloadSchema, youtubeUrlSchema, qualitySchema } from "@shared/schema";
import { z } from "zod";

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

  // Simulate file download endpoint
  app.get("/api/download/file", (req, res) => {
    // In a real implementation, this would stream the actual video file
    const filename = "youtube_video.mp4";
    const content = "Mock video file content - in production this would be the actual video stream";
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', Buffer.byteLength(content));
    
    res.send(content);
  });

  // URL validation endpoint
  app.post("/api/validate-url", async (req, res) => {
    try {
      const { url } = youtubeUrlSchema.parse(req.body);
      
      // Mock video info - in production this would fetch from YouTube API
      const mockVideoInfo = {
        title: "Sample Video Title",
        duration: "3:45",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        availableQualities: ["360p", "480p", "720p", "1080p"],
        isAgeRestricted: url.includes("dQw4w9WgXcQ") // Rick Roll as example
      };

      res.json({
        valid: true,
        videoInfo: mockVideoInfo
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
