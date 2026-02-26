import React, { useState, useEffect } from 'react';
import { Clock, Wifi } from 'lucide-react';
import { formatTimeOnlyInZone } from '../utils/timezones';
import { useGetAllUserProfiles } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { UserProfile } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import EditableDisplayName from './EditableDisplayName';

interface UserClockCardProps {
  profile: UserProfile;
  isMe: boolean;
}

function UserClockCard({ profile, isMe }: UserClockCardProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = formatTimeOnlyInZone(currentTime, profile.timeZone);
  const dateStr = currentTime.toLocaleDateString('en-US', {
    timeZone: profile.timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="flex-1 rounded-xl p-4 transition-all"
      style={
        isMe
          ? {
              background: 'oklch(0.76 0.14 65 / 0.1)',
              border: '1px solid oklch(0.76 0.14 65 / 0.35)',
              boxShadow: '0 0 20px oklch(0.76 0.14 65 / 0.15)',
            }
          : {
              background: 'oklch(0.62 0.18 285 / 0.1)',
              border: '1px solid oklch(0.62 0.18 285 / 0.35)',
              boxShadow: '0 0 20px oklch(0.62 0.18 285 / 0.15)',
            }
      }
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse-soft"
            style={{ background: isMe ? 'oklch(0.76 0.14 65)' : 'oklch(0.62 0.18 285)' }}
          />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isMe ? 'You' : 'Partner'}
          </span>
        </div>
        <Clock
          className="w-3.5 h-3.5"
          style={{ color: isMe ? 'oklch(0.76 0.14 65)' : 'oklch(0.62 0.18 285)' }}
        />
      </div>

      {/* Display name — editable for "me", static for partner */}
      {isMe ? (
        <EditableDisplayName currentName={profile.displayName} />
      ) : (
        <p className="font-display font-semibold text-foreground text-base truncate">
          {profile.displayName}
        </p>
      )}

      <p
        className="font-display font-bold text-2xl mt-1"
        style={{ color: isMe ? 'oklch(0.76 0.14 65)' : 'oklch(0.84 0.14 88)' }}
      >
        {timeStr}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">
        {profile.timeZone.replace(/_/g, ' ')}
      </p>
    </div>
  );
}

function ClockCardSkeleton() {
  return (
    <div
      className="flex-1 rounded-xl p-4"
      style={{ background: 'oklch(0.22 0.06 270 / 0.5)', border: '1px solid oklch(0.38 0.08 270)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-7 w-28 mb-1" />
      <Skeleton className="h-3 w-20 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function WaitingCard() {
  return (
    <div
      className="flex-1 rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]"
      style={{
        background: 'oklch(0.22 0.06 270 / 0.3)',
        border: '1px dashed oklch(0.38 0.08 270)',
      }}
    >
      <Wifi className="w-5 h-5 text-muted-foreground animate-pulse" />
      <p className="text-sm text-muted-foreground text-center font-medium">
        Waiting for partner to join...
      </p>
      <p className="text-xs text-muted-foreground/60 text-center">
        Share this app with your partner to get started
      </p>
    </div>
  );
}

export default function UserClockDisplay() {
  const { identity } = useInternetIdentity();
  const { data: profiles, isLoading } = useGetAllUserProfiles();

  const myPrincipalStr = identity?.getPrincipal().toString();

  const myProfile = profiles?.find((p) => p.principal.toString() === myPrincipalStr) ?? null;
  const partnerProfile = profiles?.find((p) => p.principal.toString() !== myPrincipalStr) ?? null;

  return (
    <div className="flex gap-3">
      {isLoading ? (
        <ClockCardSkeleton />
      ) : myProfile ? (
        <UserClockCard profile={myProfile} isMe={true} />
      ) : (
        <ClockCardSkeleton />
      )}

      {isLoading ? (
        <ClockCardSkeleton />
      ) : partnerProfile ? (
        <UserClockCard profile={partnerProfile} isMe={false} />
      ) : (
        <WaitingCard />
      )}
    </div>
  );
}
