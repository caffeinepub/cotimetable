import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useUpdateDisplayName } from '../hooks/useQueries';

interface EditableDisplayNameProps {
  currentName: string;
}

export default function EditableDisplayName({ currentName }: EditableDisplayNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const updateDisplayName = useUpdateDisplayName();

  // Keep local value in sync if the prop changes (e.g. after a successful save)
  useEffect(() => {
    if (!isEditing) {
      setValue(currentName);
    }
  }, [currentName, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setValue(currentName);
    setError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setValue(currentName);
    setError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    if (trimmed.length > 30) {
      setError('Max 30 characters.');
      return;
    }
    if (trimmed === currentName) {
      setIsEditing(false);
      return;
    }
    setError('');
    try {
      await updateDisplayName.mutateAsync(trimmed);
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update name.';
      setError(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 mt-0.5">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={30}
            disabled={updateDisplayName.isPending}
            className="flex-1 min-w-0 text-sm font-semibold rounded-md px-2 py-0.5 outline-none transition-all"
            style={{
              background: 'oklch(0.22 0.06 270 / 0.8)',
              border: error
                ? '1px solid oklch(0.62 0.22 25 / 0.8)'
                : '1px solid oklch(0.76 0.14 65 / 0.5)',
              color: 'oklch(0.92 0.04 88)',
              fontSize: '0.875rem',
            }}
          />
          <button
            onClick={handleSave}
            disabled={updateDisplayName.isPending}
            title="Save"
            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            style={{
              background: 'oklch(0.76 0.14 65 / 0.2)',
              border: '1px solid oklch(0.76 0.14 65 / 0.4)',
            }}
          >
            {updateDisplayName.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'oklch(0.84 0.14 88)' }} />
            ) : (
              <Check className="w-3 h-3" style={{ color: 'oklch(0.84 0.14 88)' }} />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={updateDisplayName.isPending}
            title="Cancel"
            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            style={{
              background: 'oklch(0.38 0.08 270 / 0.4)',
              border: '1px solid oklch(0.38 0.08 270 / 0.6)',
            }}
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        {error && (
          <p className="text-xs" style={{ color: 'oklch(0.62 0.22 25)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <p className="font-display font-semibold text-foreground text-base truncate">
        {currentName}
      </p>
      <button
        onClick={handleEdit}
        title="Edit display name"
        className="shrink-0 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'oklch(0.76 0.14 65 / 0.15)',
          border: '1px solid oklch(0.76 0.14 65 / 0.3)',
        }}
      >
        <Pencil className="w-2.5 h-2.5" style={{ color: 'oklch(0.84 0.14 88)' }} />
      </button>
    </div>
  );
}
