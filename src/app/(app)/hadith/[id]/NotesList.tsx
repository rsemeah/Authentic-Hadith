'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export default function NotesList({ notes }: { notes: Note[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [actionNoteId, setActionNoteId] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; noteId: string | null } | null>(null);

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    setActionNoteId(editingId);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, content: editContent }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError({ message: data.error || 'Unable to update note', noteId: editingId });
        return;
      }
      cancelEditing();
      router.refresh();
    } finally {
      setActionNoteId(null);
    }
  };

  const deleteNote = async (id: string) => {
    setActionNoteId(id);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError({ message: data.error || 'Unable to delete note', noteId: id });
        return;
      }
      if (editingId === id) cancelEditing();
      router.refresh();
    } finally {
      setActionNoteId(null);
    }
  };

  return (
    <ul className="space-y-2 text-sm text-neutral-700">
      {notes.length === 0 && <li className="text-neutral-500">No notes yet.</li>}
      {notes.map((note) => {
        const isEditing = editingId === note.id;
        const isBusy = actionNoteId === note.id;
        return (
          <li key={note.id} className="rounded-xl bg-neutral-50 p-3">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={saveEdit}
                    disabled={isBusy || !editContent.trim()}
                    className="rounded-full bg-neutral-900 px-3 py-1 font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {isBusy ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={isBusy}
                    className="rounded-full border border-neutral-200 px-3 py-1 font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    disabled={isBusy}
                    className="ml-auto text-neutral-500 hover:text-neutral-800 disabled:opacity-60"
                  >
                    {isBusy ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
                {error && error.noteId === note.id && (
                  <p className="text-xs text-red-600">{error.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="whitespace-pre-wrap">{note.content}</div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span>{new Date(note.created_at).toLocaleString()}</span>
                  <button
                    onClick={() => startEditing(note)}
                    className="font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Edit
                  </button>
                  <span aria-hidden>•</span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    disabled={isBusy}
                    className="font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-60"
                  >
                    {isBusy ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
                {error && error.noteId === note.id && (
                  <p className="text-xs text-red-600">{error.message}</p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
