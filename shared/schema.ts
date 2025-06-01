import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  quality: text("quality").notNull(),
  status: text("status").notNull(), // 'processing', 'completed', 'failed'
  progress: integer("progress").default(0),
  filename: text("filename"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
  quality: true,
});

export const updateDownloadSchema = createInsertSchema(downloads).pick({
  status: true,
  progress: true,
  filename: true,
}).partial();

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type UpdateDownload = z.infer<typeof updateDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

// YouTube URL validation schema
export const youtubeUrlSchema = z.object({
  url: z.string()
    .url("Please enter a valid URL")
    .regex(/(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/, "Please enter a valid YouTube URL"),
});

// Quality options
export const qualityOptions = ['360p', '480p', '720p', '1080p'] as const;
export const qualitySchema = z.enum(qualityOptions);

export type YouTubeUrl = z.infer<typeof youtubeUrlSchema>;
export type Quality = z.infer<typeof qualitySchema>;
