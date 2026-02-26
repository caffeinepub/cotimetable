import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllUserProfiles } from '../hooks/useQueries';
import { MessageSquare, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import UserClockDisplay from '../components/UserClockDisplay';
import TimetableView from '../components/TimetableView';
import ChatInterface from '../components/ChatInterface';
import type { UserProfile } from '../backend';

interface DashboardProps {
  myProfile: UserProfile;
}

export default function Dashboard({ myProfile }: DashboardProps) {
  const { identity } = useInternetIdentity();
  const [clocksExpanded, setClocksExpanded] = useState(true);

  const myPrincipal = identity!.getPrincipal();

  const { data: profiles } = useGetAllUserProfiles();
  const myPrincipalStr = myPrincipal.toString();
  const partnerProfile = profiles?.find((p) => p.principal.toString() !== myPrincipalStr) ?? null;
  const partnerPrincipal = partnerProfile ? partnerProfile.principal : null;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-4 gap-4 relative z-10">
      {/* User clocks section */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'oklch(0.17 0.05 270 / 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid oklch(0.76 0.14 65 / 0.2)',
          boxShadow: '0 4px 24px oklch(0.08 0.04 270 / 0.4)',
        }}
      >
        <button
          onClick={() => setClocksExpanded(!clocksExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'oklch(0.76 0.14 65)' }} />
            <span className="font-display font-semibold text-sm" style={{ color: 'oklch(0.84 0.14 88)' }}>
              Live Clocks
            </span>
          </div>
          {clocksExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {clocksExpanded && (
          <div className="px-4 pb-4">
            <UserClockDisplay />
          </div>
        )}
      </div>

      {/* Main content: Timetable + Chat */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Timetable */}
        <div
          className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0"
          style={{
            background: 'oklch(0.17 0.05 270 / 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid oklch(0.62 0.18 285 / 0.25)',
            boxShadow: '0 4px 24px oklch(0.08 0.04 270 / 0.4)',
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid oklch(0.62 0.18 285 / 0.2)' }}
          >
            <Calendar className="w-4 h-4" style={{ color: 'oklch(0.62 0.18 285)' }} />
            <span className="font-display font-semibold text-sm" style={{ color: 'oklch(0.84 0.14 88)' }}>
              Timetable
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <TimetableView
              myProfile={myProfile}
              myPrincipal={myPrincipal}
              partnerProfile={partnerProfile}
              partnerPrincipal={partnerPrincipal}
            />
          </div>
        </div>

        {/* Chat */}
        <div
          className="w-full lg:w-80 xl:w-96 rounded-2xl overflow-hidden flex flex-col min-h-[400px] lg:min-h-0"
          style={{
            background: 'oklch(0.17 0.05 270 / 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid oklch(0.76 0.14 65 / 0.25)',
            boxShadow: '0 4px 24px oklch(0.08 0.04 270 / 0.4)',
          }}
        >
          <ChatInterface
            myProfile={myProfile}
            myPrincipal={myPrincipal}
            partnerProfile={partnerProfile}
            partnerPrincipal={partnerPrincipal}
          />
        </div>
      </div>
    </div>
  );
}
