import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AddEditTaskModal from './AddEditTaskModal';
import {
  useGetCallerTimetableEntries,
  useDeleteTimetableEntry,
} from '../hooks/useQueries';
import { Recurrence } from '../backend';
import type { TimetableEntry } from '../backend';
import { nanosToDate } from '../utils/timezones';
import type { UserProfile } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

const HOUR_HEIGHT = 64;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function getLocalHourMinute(nanos: bigint, timezone: string): { hour: number; minute: number } {
  const date = nanosToDate(nanos);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  let hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  if (hour === 24) hour = 0;
  return { hour, minute };
}

function getLocalDateString(nanos: bigint, timezone: string): string {
  const date = nanosToDate(nanos);
  return date.toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Returns true if the entry should be shown on the given selectedDate.
 * - Recurrence.none: only show on the entry's stored date (day field or startTime date).
 * - Recurrence.weekday: show on Mon–Fri (day-of-week 1–5).
 * - Recurrence.weekend: show on Sat–Sun (day-of-week 0, 6).
 */
function shouldShowEntry(entry: TimetableEntry, selectedDate: string, timezone: string): boolean {
  const rec = entry.recurrence as Recurrence;

  if (rec === Recurrence.weekday || rec === Recurrence.weekend) {
    // Parse selectedDate as local noon to get correct day-of-week
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const dow = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if (rec === Recurrence.weekday) {
      return dow >= 1 && dow <= 5;
    } else {
      return dow === 0 || dow === 6;
    }
  }

  // Recurrence.none — match by stored date
  // Prefer the entry's day field if set, otherwise derive from startTime
  const entryDay = entry.day && entry.day.length > 0
    ? entry.day
    : getLocalDateString(entry.startTime, timezone);
  return entryDay === selectedDate;
}

interface TaskBlockProps {
  entry: TimetableEntry;
  timezone: string;
  isOwn: boolean;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
  selectedDate: string;
}

function TaskBlock({ entry, timezone, isOwn, onEdit, onDelete, isDeleting, selectedDate }: TaskBlockProps) {
  const startLocal = getLocalHourMinute(entry.startTime, timezone);
  const endLocal = getLocalHourMinute(entry.endTime, timezone);

  const startMinutes = startLocal.hour * 60 + startLocal.minute;
  const endMinutes = endLocal.hour * 60 + endLocal.minute;
  const durationMinutes = Math.max(endMinutes - startMinutes, 30);

  const top = (startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 28);

  const startTimeStr = nanosToDate(entry.startTime).toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const endTimeStr = nanosToDate(entry.endTime).toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const isRecurring = (entry.recurrence as Recurrence) !== Recurrence.none;

  return (
    <div
      className="absolute left-1 right-1 rounded-lg px-2 py-1 overflow-hidden group transition-all"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: isOwn
          ? 'oklch(0.76 0.14 65 / 0.18)'
          : 'oklch(0.62 0.18 285 / 0.18)',
        border: isOwn
          ? '1px solid oklch(0.76 0.14 65 / 0.4)'
          : '1px solid oklch(0.62 0.18 285 / 0.4)',
      }}
    >
      <div className="flex items-start justify-between gap-1 h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p
              className="text-xs font-semibold truncate leading-tight"
              style={{ color: isOwn ? 'oklch(0.76 0.14 65)' : 'oklch(0.72 0.15 285)' }}
            >
              {entry.title}
            </p>
            {isRecurring && (
              <Repeat
                className="w-2.5 h-2.5 shrink-0"
                style={{ color: isOwn ? 'oklch(0.76 0.14 65 / 0.7)' : 'oklch(0.72 0.15 285 / 0.7)' }}
              />
            )}
          </div>
          {height > 40 && (
            <p className="text-xs text-muted-foreground truncate leading-tight">
              {startTimeStr} – {endTimeStr}
            </p>
          )}
          {height > 56 && isRecurring && (
            <p
              className="text-xs leading-tight mt-0.5"
              style={{ color: isOwn ? 'oklch(0.76 0.14 65 / 0.6)' : 'oklch(0.72 0.15 285 / 0.6)' }}
            >
              {(entry.recurrence as Recurrence) === Recurrence.weekday ? 'Mon–Fri' : 'Sat–Sun'}
            </p>
          )}
        </div>
        {isOwn && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="p-0.5 rounded transition-colors"
              style={{ color: 'oklch(0.76 0.14 65)' }}
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              disabled={isDeleting}
              className="p-0.5 rounded text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TimetableColumnProps {
  entries: TimetableEntry[];
  timezone: string;
  isOwn: boolean;
  label: string;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
  deletingId: bigint | null;
  selectedDate: string;
}

function TimetableColumn({
  entries,
  timezone,
  isOwn,
  label,
  onEdit,
  onDelete,
  isDeleting,
  deletingId,
  selectedDate,
}: TimetableColumnProps) {
  // Filter entries to only those that should appear on the selected date
  const visibleEntries = entries.filter(e => shouldShowEntry(e, selectedDate, timezone));

  return (
    <div className="flex-1 min-w-0">
      <div
        className="text-center py-2 px-3 rounded-t-lg text-xs font-semibold uppercase tracking-wider"
        style={{
          background: isOwn ? 'oklch(0.76 0.14 65 / 0.12)' : 'oklch(0.62 0.18 285 / 0.12)',
          color: isOwn ? 'oklch(0.76 0.14 65)' : 'oklch(0.72 0.15 285)',
          borderBottom: isOwn
            ? '1px solid oklch(0.76 0.14 65 / 0.2)'
            : '1px solid oklch(0.62 0.18 285 / 0.2)',
        }}
      >
        {label}
      </div>
      <div
        className="relative"
        style={{
          height: `${HOUR_HEIGHT * 24}px`,
          borderLeft: '1px solid oklch(0.38 0.08 270)',
          borderRight: '1px solid oklch(0.38 0.08 270)',
          borderBottom: '1px solid oklch(0.38 0.08 270)',
        }}
      >
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0"
            style={{
              top: `${hour * HOUR_HEIGHT}px`,
              borderTop: '1px solid oklch(0.38 0.08 270 / 0.4)',
            }}
          />
        ))}
        {HOURS.map((hour) => (
          <div
            key={`half-${hour}`}
            className="absolute left-0 right-0"
            style={{
              top: `${hour * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
              borderTop: '1px solid oklch(0.38 0.08 270 / 0.2)',
            }}
          />
        ))}
        {visibleEntries.map((entry) => (
          <TaskBlock
            key={entry.id.toString()}
            entry={entry}
            timezone={timezone}
            isOwn={isOwn}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting && deletingId === entry.id}
            selectedDate={selectedDate}
          />
        ))}
      </div>
    </div>
  );
}

interface TimetableViewProps {
  myProfile: UserProfile;
  myPrincipal: Principal;
  partnerProfile: UserProfile | null;
  partnerPrincipal: Principal | null;
}

export default function TimetableView({
  myProfile,
  myPrincipal,
  partnerProfile,
  partnerPrincipal,
}: TimetableViewProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: myProfile.timeZone });
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Each user only fetches their own entries; partner entries are not accessible via query
  const { data: myEntries = [] } = useGetCallerTimetableEntries();
  const deleteEntry = useDeleteTimetableEntry();

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const scrollTo = Math.max(0, (hours * 60 + minutes) / 60 * HOUR_HEIGHT - 100);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteEntry.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditingEntry(null);
  };

  const navigateDate = (direction: -1 | 1) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toLocaleDateString('en-CA'));
  };

  const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isToday = selectedDate === new Date().toLocaleDateString('en-CA', { timeZone: myProfile.timeZone });

  return (
    <div className="flex flex-col h-full">
      {/* Date navigation */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid oklch(0.38 0.08 270 / 0.5)' }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <p className="font-display font-semibold text-foreground text-sm">{displayDate}</p>
          {isToday && (
            <span className="text-xs font-medium" style={{ color: 'oklch(0.76 0.14 65)' }}>
              Today
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate(1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Add task button */}
      <div
        className="px-4 py-2"
        style={{ borderBottom: '1px solid oklch(0.38 0.08 270 / 0.5)' }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => { setEditingEntry(null); setAddModalOpen(true); }}
                className="font-medium gap-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
                  color: 'oklch(0.12 0.03 270)',
                  border: '1px solid oklch(0.84 0.14 88 / 0.3)',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a task to your schedule</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Timetable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex">
          {/* Time axis */}
          <div className="w-14 shrink-0 relative" style={{ height: `${HOUR_HEIGHT * 24}px` }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-xs text-muted-foreground leading-none"
                style={{ top: `${hour * HOUR_HEIGHT - 6}px` }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Columns */}
          <div className="flex flex-1 gap-0 min-w-0">
            <TimetableColumn
              entries={myEntries}
              timezone={myProfile.timeZone}
              isOwn={true}
              label="My Schedule"
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteEntry.isPending}
              deletingId={deletingId}
              selectedDate={selectedDate}
            />
            {/* Partner column — shows empty grid since we can't fetch partner entries directly */}
            <TimetableColumn
              entries={[]}
              timezone={partnerProfile?.timeZone || myProfile.timeZone}
              isOwn={false}
              label={partnerProfile ? `${partnerProfile.displayName}'s Schedule` : "Partner's Schedule"}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={false}
              deletingId={null}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>

      <AddEditTaskModal
        open={addModalOpen}
        onClose={handleCloseModal}
        userTimezone={myProfile.timeZone}
        editingEntry={editingEntry}
      />
    </div>
  );
}
