import * as vscode from 'vscode';
import { Note } from '../utilities/types';
import { StateKeys } from '../utilities/constants';

/**
 * Service for managing user notes
 * Uses VS Code's globalState for client-side storage
 * TODO: Replace with Supabase integration in future
 */
export class NotesService {
  constructor(private context: vscode.ExtensionContext) {}

  async getAllNotes(): Promise<Note[]> {
    return this.context.globalState.get<Note[]>(StateKeys.NOTES, []);
  }

  async getNote(id: string): Promise<Note | undefined> {
    const notes = await this.getAllNotes();
    return notes.find(note => note.id === id);
  }

  async getNotesByHadith(hadithId: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter(note => note.hadithId === hadithId);
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notes = await this.getAllNotes();
    const newNote: Note = {
      ...note,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    await this.context.globalState.update(StateKeys.NOTES, notes);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | undefined> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) {
      return undefined;
    }
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.context.globalState.update(StateKeys.NOTES, notes);
    return notes[index];
  }

  async deleteNote(id: string): Promise<boolean> {
    const notes = await this.getAllNotes();
    const filtered = notes.filter(note => note.id !== id);
    if (filtered.length === notes.length) {
      return false; // Note not found
    }
    await this.context.globalState.update(StateKeys.NOTES, filtered);
    return true;
  }

  async exportNotesToMarkdown(): Promise<string> {
    const notes = await this.getAllNotes();
    let markdown = '# Authentic Hadith Notes\n\n';
    markdown += `Exported: ${new Date().toLocaleString()}\n\n`;
    markdown += '---\n\n';

    notes.forEach(note => {
      markdown += `## ${note.title}\n\n`;
      markdown += `**Hadith ID:** ${note.hadithId}\n\n`;
      markdown += `${note.content}\n\n`;
      markdown += `*Created: ${new Date(note.createdAt).toLocaleString()}*\n`;
      markdown += `*Updated: ${new Date(note.updatedAt).toLocaleString()}*\n\n`;
      markdown += '---\n\n';
    });

    return markdown;
  }

  private generateId(): string {
    return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
