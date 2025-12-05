/**
 * Wishlist Notes Component / İstək Siyahısı Qeydləri Komponenti
 * Add/edit notes for wishlist items / İstək siyahısı elementləri üçün qeyd əlavə et/redaktə et
 */

'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface WishlistNotesProps {
  wishlistItemId: string;
  initialNote?: string;
}

export function WishlistNotes({ wishlistItemId, initialNote }: WishlistNotesProps) {
  const [note, setNote] = useState(initialNote || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const t = useTranslations('wishlist');

  useEffect(() => {
    fetchNote();
  }, [wishlistItemId]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/wishlist/notes?wishlistItemId=${wishlistItemId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setNote(data.data.note || '');
      }
    } catch (error) {
      console.error('Error fetching note', error);
    }
  };

  const handleSave = async () => {
    if (note.length > 500) {
      alert(t('noteTooLong') || 'Note must be 500 characters or less');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/wishlist/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wishlistItemId,
          note: note.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
      } else {
        alert(data.error || t('failedToSaveNote') || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note', error);
      alert(t('failedToSaveNote') || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('deleteNoteConfirm') || 'Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/notes?wishlistItemId=${wishlistItemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setNote('');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting note', error);
    }
  };

  if (!isEditing && !note) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="text-gray-600 hover:text-gray-900"
      >
        <FileText className="h-4 w-4 mr-1" />
        {t('addNote') || 'Add Note'}
      </Button>
    );
  }

  if (!isEditing && note) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
          <p className="text-sm text-gray-700 flex-1">{note}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            {t('edit') || 'Edit'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            {t('delete') || 'Delete'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('notePlaceholder') || 'Add a note...'}
        maxLength={500}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {note.length}/500 {t('characters') || 'characters'}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              fetchNote();
            }}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-1" />
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

