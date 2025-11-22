import * as vscode from 'vscode';
import { ReviewItem } from '../utilities/types';
import { StateKeys } from '../utilities/constants';

/**
 * Service for managing Spaced Repetition System (SRS)
 * Uses simple algorithm: 1 day, 3 days, 7 days intervals
 * TODO: Implement more sophisticated SM-2 algorithm
 * TODO: Integrate with backend for cross-device sync
 */
export class SRSService {
  constructor(private context: vscode.ExtensionContext) {}

  async getAllReviewItems(): Promise<ReviewItem[]> {
    return this.context.globalState.get<ReviewItem[]>(StateKeys.REVIEW_ITEMS, []);
  }

  async getReviewItem(hadithId: string): Promise<ReviewItem | undefined> {
    const items = await this.getAllReviewItems();
    return items.find(item => item.hadithId === hadithId);
  }

  async getDueReviews(): Promise<ReviewItem[]> {
    const items = await this.getAllReviewItems();
    const now = new Date();
    return items.filter(item => new Date(item.nextReview) <= now);
  }

  async getUpcomingReviews(days: number = 7): Promise<ReviewItem[]> {
    const items = await this.getAllReviewItems();
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return items.filter(item => {
      const nextReview = new Date(item.nextReview);
      return nextReview > now && nextReview <= future;
    });
  }

  async addReviewItem(hadithId: string): Promise<ReviewItem> {
    const items = await this.getAllReviewItems();
    
    // Check if already exists
    const existing = items.find(item => item.hadithId === hadithId);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const newItem: ReviewItem = {
      id: this.generateId(),
      hadithId,
      lastReviewed: now.toISOString(),
      nextReview: tomorrow.toISOString(),
      interval: 1, // Start with 1 day
      easiness: 2.5,
      repetitions: 0
    };

    items.push(newItem);
    await this.context.globalState.update(StateKeys.REVIEW_ITEMS, items);
    return newItem;
  }

  async recordReview(hadithId: string, quality: 'easy' | 'medium' | 'hard' | 'again'): Promise<ReviewItem | undefined> {
    const items = await this.getAllReviewItems();
    const index = items.findIndex(item => item.hadithId === hadithId);
    
    if (index === -1) {
      return undefined;
    }

    const item = items[index];
    const now = new Date();

    // Simple SRS algorithm
    let newInterval: number;
    let newRepetitions = item.repetitions;

    switch (quality) {
      case 'again':
        newInterval = 1;
        newRepetitions = 0;
        break;
      case 'hard':
        newInterval = Math.max(1, Math.floor(item.interval * 1.2));
        newRepetitions++;
        break;
      case 'medium':
        newInterval = item.interval < 3 ? 3 : 7;
        newRepetitions++;
        break;
      case 'easy':
        if (item.interval === 1) {
          newInterval = 3;
        } else if (item.interval === 3) {
          newInterval = 7;
        } else {
          newInterval = Math.floor(item.interval * 2);
        }
        newRepetitions++;
        break;
    }

    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    items[index] = {
      ...item,
      lastReviewed: now.toISOString(),
      nextReview: nextReview.toISOString(),
      interval: newInterval,
      repetitions: newRepetitions
    };

    await this.context.globalState.update(StateKeys.REVIEW_ITEMS, items);
    return items[index];
  }

  async removeReviewItem(hadithId: string): Promise<boolean> {
    const items = await this.getAllReviewItems();
    const filtered = items.filter(item => item.hadithId !== hadithId);
    
    if (filtered.length === items.length) {
      return false;
    }
    
    await this.context.globalState.update(StateKeys.REVIEW_ITEMS, filtered);
    return true;
  }

  private generateId(): string {
    return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
