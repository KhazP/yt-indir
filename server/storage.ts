import { downloads, type Download, type InsertDownload, type UpdateDownload } from "@shared/schema";

export interface IStorage {
  createDownload(download: InsertDownload): Promise<Download>;
  getDownload(id: number): Promise<Download | undefined>;
  updateDownload(id: number, update: UpdateDownload): Promise<Download | undefined>;
  deleteDownload(id: number): Promise<boolean>;
  getAllDownloads(): Promise<Download[]>;
}

export class MemStorage implements IStorage {
  private downloads: Map<number, Download>;
  private currentId: number;

  constructor() {
    this.downloads = new Map();
    this.currentId = 1;
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = this.currentId++;
    const download: Download = {
      ...insertDownload,
      id,
      status: "processing",
      progress: 0,
      filename: null,
      createdAt: new Date(),
    };
    this.downloads.set(id, download);
    return download;
  }

  async getDownload(id: number): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async updateDownload(id: number, update: UpdateDownload): Promise<Download | undefined> {
    const existing = this.downloads.get(id);
    if (!existing) return undefined;

    const updated: Download = { ...existing, ...update };
    this.downloads.set(id, updated);
    return updated;
  }

  async deleteDownload(id: number): Promise<boolean> {
    return this.downloads.delete(id);
  }

  async getAllDownloads(): Promise<Download[]> {
    return Array.from(this.downloads.values());
  }
}

export const storage = new MemStorage();
