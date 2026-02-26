import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, Repeat } from 'lucide-react';
import { localDatetimeToNanos, nanosToLocalDatetimeString } from '../utils/timezones';
import { useAddTimetableEntry, useUpdateTimetableEntry } from '../hooks/useQueries';
import { Recurrence } from '../backend';
import type { TimetableEntry } from '../backend';

interface AddEditTaskModalProps {
  open: boolean;
  onClose: () => void;
  userTimezone: string;
  editingEntry?: TimetableEntry | null;
}

const RECURRENCE_OPTIONS: { value: Recurrence; label: string; description: string }[] = [
  { value: Recurrence.none, label: 'One-time', description: 'Appears on the selected date only' },
  { value: Recurrence.weekday, label: 'Every weekday', description: 'Mon – Fri, every week' },
  { value: Recurrence.weekend, label: 'Every weekend', description: 'Sat & Sun, every week' },
];

export default function AddEditTaskModal({
  open,
  onClose,
  userTimezone,
  editingEntry,
}: AddEditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>(Recurrence.none);
  const [error, setError] = useState('');

  const addEntry = useAddTimetableEntry();
  const updateEntry = useUpdateTimetableEntry();

  const isEditing = !!editingEntry;
  const isPending = addEntry.isPending || updateEntry.isPending;

  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setTitle(editingEntry.title);
        setStartTime(nanosToLocalDatetimeString(editingEntry.startTime, userTimezone));
        setEndTime(nanosToLocalDatetimeString(editingEntry.endTime, userTimezone));
        setRecurrence(editingEntry.recurrence as Recurrence);
      } else {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const hourStr = `${pad(now.getHours())}:00`;
        const endHourStr = `${pad(Math.min(now.getHours() + 1, 23))}:00`;
        setTitle('');
        setStartTime(`${dateStr}T${hourStr}`);
        setEndTime(`${dateStr}T${endHourStr}`);
        setRecurrence(Recurrence.none);
      }
      setError('');
    }
  }, [open, editingEntry, userTimezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Please set both start and end times.');
      return;
    }

    const startNanos = localDatetimeToNanos(startTime, userTimezone);
    const endNanos = localDatetimeToNanos(endTime, userTimezone);

    if (endNanos <= startNanos) {
      setError('End time must be after start time.');
      return;
    }

    // For recurring entries, day is not used for filtering (recurrence pattern takes over).
    // For one-time entries, day stores the date string for filtering.
    const dayStr = startTime.split('T')[0] ?? '';

    const entryInput = {
      title: title.trim(),
      day: dayStr,
      startTime: startNanos,
      endTime: endNanos,
      recurrence,
    };

    try {
      if (isEditing && editingEntry) {
        await updateEntry.mutateAsync({ id: editingEntry.id, entry: entryInput });
      } else {
        await addEntry.mutateAsync(entryInput);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to save task. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: 'oklch(0.17 0.05 270 / 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid oklch(0.62 0.18 285 / 0.35)',
          boxShadow: '0 8px 40px oklch(0.08 0.04 270 / 0.8)',
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(0.62 0.18 285 / 0.15)', border: '1px solid oklch(0.62 0.18 285 / 0.3)' }}
            >
              <Calendar className="w-5 h-5" style={{ color: 'oklch(0.72 0.15 285)' }} />
            </div>
            <DialogTitle className="font-display text-xl" style={{ color: 'oklch(0.84 0.14 88)' }}>
              {isEditing ? 'Edit Task' : 'Add Task'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-foreground placeholder:text-muted-foreground"
              style={{
                background: 'oklch(0.22 0.06 270)',
                border: '1px solid oklch(0.38 0.08 270)',
              }}
              autoFocus
              maxLength={200}
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-foreground font-medium">Start</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-foreground"
                style={{
                  background: 'oklch(0.22 0.06 270)',
                  border: '1px solid oklch(0.38 0.08 270)',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-foreground font-medium">End</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-foreground"
                style={{
                  background: 'oklch(0.22 0.06 270)',
                  border: '1px solid oklch(0.38 0.08 270)',
                }}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground -mt-1">
            Times are in your timezone:{' '}
            <span style={{ color: 'oklch(0.76 0.14 65)' }}>{userTimezone.replace(/_/g, ' ')}</span>
          </p>

          {/* Recurrence selector */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5" style={{ color: 'oklch(0.72 0.15 285)' }} />
              Recurrence
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {RECURRENCE_OPTIONS.map((option) => {
                const isSelected = recurrence === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRecurrence(option.value)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                    style={{
                      background: isSelected
                        ? 'oklch(0.62 0.18 285 / 0.18)'
                        : 'oklch(0.22 0.06 270)',
                      border: isSelected
                        ? '1px solid oklch(0.62 0.18 285 / 0.55)'
                        : '1px solid oklch(0.38 0.08 270)',
                    }}
                  >
                    {/* Radio dot */}
                    <div
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        border: isSelected
                          ? '2px solid oklch(0.72 0.15 285)'
                          : '2px solid oklch(0.45 0.08 270)',
                        background: isSelected ? 'oklch(0.72 0.15 285 / 0.2)' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'oklch(0.72 0.15 285)' }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium leading-tight"
                        style={{ color: isSelected ? 'oklch(0.84 0.14 88)' : 'oklch(0.75 0.06 270)' }}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
                color: 'oklch(0.12 0.03 270)',
                border: '1px solid oklch(0.84 0.14 88 / 0.3)',
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
