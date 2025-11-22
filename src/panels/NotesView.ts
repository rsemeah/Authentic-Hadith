import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { NotesService } from '../services/NotesService';
import { Note } from '../utilities/types';

/**
 * Notes webview panel for creating, viewing, and editing notes
 */
export class NotesView {
  public static currentPanel: NotesView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri,
    private notesService: NotesService
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._updateWebview();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri, notesService: NotesService) {
    if (NotesView.currentPanel) {
      NotesView.currentPanel._panel.reveal(vscode.ViewColumn.One);
      NotesView.currentPanel._updateWebview();
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithNotes',
        'My Notes',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      NotesView.currentPanel = new NotesView(panel, extensionUri, notesService);
    }
  }

  public dispose() {
    NotesView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private async _updateWebview() {
    const notes = await this.notesService.getAllNotes();
    this._panel.webview.html = this._getWebviewContent(notes);
  }

  private _getWebviewContent(notes: Note[]): string {
    const notesHtml = notes.map(note => `
      <div class="list-item" data-note-id="${note.id}">
        <h3>${note.title}</h3>
        <p>${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
        <small>Updated: ${new Date(note.updatedAt).toLocaleString()}</small>
        <div class="button-group">
          <button class="view-note secondary" data-note-id="${note.id}">View</button>
          <button class="edit-note secondary" data-note-id="${note.id}">Edit</button>
          <button class="delete-note secondary" data-note-id="${note.id}">Delete</button>
        </div>
      </div>
    `).join('');

    const content = `
      <h1>📝 My Notes</h1>
      
      <div class="button-group">
        <button id="createNote">Create New Note</button>
        <button id="exportNotes" class="secondary">Export to Markdown</button>
      </div>

      <div id="notesList">
        ${notes.length > 0 ? notesHtml : '<p>No notes yet. Create your first note!</p>'}
      </div>

      <div id="noteEditor" class="hidden">
        <h2 id="editorTitle">New Note</h2>
        <input type="hidden" id="noteId" value="">
        <input type="text" id="noteTitle" placeholder="Note title">
        <input type="text" id="noteHadithId" placeholder="Hadith ID (optional)">
        <textarea id="noteContent" rows="10" placeholder="Write your notes here..."></textarea>
        <div class="button-group">
          <button id="saveNote">Save</button>
          <button id="cancelEdit" class="secondary">Cancel</button>
        </div>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();
      
      function showEditor(note = null) {
        document.getElementById('notesList').classList.add('hidden');
        document.getElementById('noteEditor').classList.remove('hidden');
        
        if (note) {
          document.getElementById('editorTitle').textContent = 'Edit Note';
          document.getElementById('noteId').value = note.id;
          document.getElementById('noteTitle').value = note.title;
          document.getElementById('noteHadithId').value = note.hadithId;
          document.getElementById('noteContent').value = note.content;
        } else {
          document.getElementById('editorTitle').textContent = 'New Note';
          document.getElementById('noteId').value = '';
          document.getElementById('noteTitle').value = '';
          document.getElementById('noteHadithId').value = '';
          document.getElementById('noteContent').value = '';
        }
      }

      function hideEditor() {
        document.getElementById('notesList').classList.remove('hidden');
        document.getElementById('noteEditor').classList.add('hidden');
      }

      document.getElementById('createNote').addEventListener('click', () => {
        showEditor();
      });

      document.getElementById('exportNotes').addEventListener('click', () => {
        vscode.postMessage({ command: 'exportNotes' });
      });

      document.getElementById('saveNote').addEventListener('click', () => {
        const id = document.getElementById('noteId').value;
        const title = document.getElementById('noteTitle').value;
        const hadithId = document.getElementById('noteHadithId').value || 'general';
        const content = document.getElementById('noteContent').value;
        
        if (!title || !content) {
          alert('Please fill in title and content');
          return;
        }

        vscode.postMessage({
          command: id ? 'updateNote' : 'createNote',
          data: { id, title, hadithId, content }
        });
      });

      document.getElementById('cancelEdit').addEventListener('click', () => {
        hideEditor();
      });

      document.querySelectorAll('.view-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const noteId = e.target.dataset.noteId;
          vscode.postMessage({ command: 'viewNote', noteId });
        });
      });

      document.querySelectorAll('.edit-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const noteId = e.target.dataset.noteId;
          vscode.postMessage({ command: 'editNote', noteId });
        });
      });

      document.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const noteId = e.target.dataset.noteId;
          if (confirm('Are you sure you want to delete this note?')) {
            vscode.postMessage({ command: 'deleteNote', noteId });
          }
        });
      });
    `;

    return getWebviewHtml(this._panel.webview, 'Notes', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case 'createNote':
            await this.notesService.createNote(message.data);
            vscode.window.showInformationMessage('Note created!');
            this._updateWebview();
            break;
          case 'updateNote':
            await this.notesService.updateNote(message.data.id, message.data);
            vscode.window.showInformationMessage('Note updated!');
            this._updateWebview();
            break;
          case 'deleteNote':
            await this.notesService.deleteNote(message.noteId);
            vscode.window.showInformationMessage('Note deleted!');
            this._updateWebview();
            break;
          case 'viewNote':
            const note = await this.notesService.getNote(message.noteId);
            if (note) {
              const doc = await vscode.workspace.openTextDocument({
                content: `# ${note.title}\n\n${note.content}`,
                language: 'markdown'
              });
              vscode.window.showTextDocument(doc);
            }
            break;
          case 'editNote':
            const noteToEdit = await this.notesService.getNote(message.noteId);
            if (noteToEdit) {
              // Re-render with editor showing the note
              this._panel.webview.postMessage({
                command: 'showEditor',
                note: noteToEdit
              });
            }
            break;
          case 'exportNotes':
            vscode.commands.executeCommand('authentic-hadith.exportNotesMarkdown');
            break;
        }
      },
      null,
      this._disposables
    );
  }
}
