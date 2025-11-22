import * as vscode from 'vscode';
import { Bookmark } from '../utilities/types';
import { StateKeys } from '../utilities/constants';

/**
 * Service for managing bookmarks/favorites
 * Uses VS Code's globalState for client-side storage
 * TODO: Replace with Supabase integration in future
 */
export class BookmarksService {
  constructor(private context: vscode.ExtensionContext) {}

  async getAllBookmarks(): Promise<Bookmark[]> {
    return this.context.globalState.get<Bookmark[]>(StateKeys.BOOKMARKS, []);
  }

  async getBookmark(hadithId: string): Promise<Bookmark | undefined> {
    const bookmarks = await this.getAllBookmarks();
    return bookmarks.find(bookmark => bookmark.hadithId === hadithId);
  }

  async isBookmarked(hadithId: string): Promise<boolean> {
    const bookmark = await this.getBookmark(hadithId);
    return bookmark !== undefined;
  }

  async addBookmark(hadithId: string, notes?: string): Promise<Bookmark> {
    const bookmarks = await this.getAllBookmarks();
    
    // Check if already bookmarked
    const existing = bookmarks.find(b => b.hadithId === hadithId);
    if (existing) {
      return existing;
    }

    const newBookmark: Bookmark = {
      id: this.generateId(),
      hadithId,
      addedAt: new Date().toISOString(),
      notes
    };
    
    bookmarks.push(newBookmark);
    await this.context.globalState.update(StateKeys.BOOKMARKS, bookmarks);
    return newBookmark;
  }

  async removeBookmark(hadithId: string): Promise<boolean> {
    const bookmarks = await this.getAllBookmarks();
    const filtered = bookmarks.filter(b => b.hadithId !== hadithId);
    
    if (filtered.length === bookmarks.length) {
      return false; // Bookmark not found
    }
    
    await this.context.globalState.update(StateKeys.BOOKMARKS, filtered);
    return true;
  }

  async toggleBookmark(hadithId: string): Promise<boolean> {
    const isBookmarked = await this.isBookmarked(hadithId);
    
    if (isBookmarked) {
      await this.removeBookmark(hadithId);
      return false;
    } else {
      await this.addBookmark(hadithId);
      return true;
    }
  }

  async updateBookmarkNotes(hadithId: string, notes: string): Promise<Bookmark | undefined> {
    const bookmarks = await this.getAllBookmarks();
    const index = bookmarks.findIndex(b => b.hadithId === hadithId);
    
    if (index === -1) {
      return undefined;
    }
    
    bookmarks[index].notes = notes;
    await this.context.globalState.update(StateKeys.BOOKMARKS, bookmarks);
    return bookmarks[index];
  }

  private generateId(): string {
    return `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
