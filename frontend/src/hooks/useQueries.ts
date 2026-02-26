import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Message as BackendMessage, TimetableEntry, TimetableEntryInput } from '../backend';
import { Recurrence } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob } from '../backend';

// ─── Local Types ──────────────────────────────────────────────────────────────

// Re-export backend Message type with a local alias for convenience
export type Message = BackendMessage;

// Re-export timetable types for convenience
export type { TimetableEntry, TimetableEntryInput };
export { Recurrence };

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (err: unknown) {
        // Backend traps with "Unauthorized" for unregistered callers.
        // Treat this as "no profile yet" so the registration modal can appear.
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('Unauthorized') ||
          msg.includes('unauthorized') ||
          msg.includes('Only registered users')
        ) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    // Fail fast: do not retry on init so a slow/unreachable backend resolves quickly
    retry: 0,
    staleTime: 30000,
    gcTime: 60000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, timeZone }: { displayName: string; timeZone: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(displayName, timeZone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, timeZone }: { displayName: string; timeZone: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.register(displayName, timeZone);
      // Surface backend result variants as errors so the UI can handle them
      if (result === 'anonymousCaller') {
        throw new Error('You must be logged in to register.');
      }
      if (result === 'invalidInput') {
        throw new Error('Display name must be between 1 and 30 characters.');
      }
      if (result === 'slotFull') {
        throw new Error('This app already has two registered users. No more slots available.');
      }
      // 'success' and 'alreadyRegistered' are both acceptable — return the result
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUserProfiles();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Unauthorized') || msg.includes('unauthorized')) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useUpdateDisplayName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDisplayName: string): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      if (!newDisplayName.trim() || newDisplayName.trim().length > 30) {
        throw new Error('Display name must be between 1 and 30 characters.');
      }
      return actor.updateDisplayName(newDisplayName.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useGetMessages() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllMessages();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Unauthorized') || msg.includes('unauthorized')) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      file,
      fileName,
      mimeType,
    }: {
      content: string;
      file: ExternalBlob | null;
      fileName: string | null;
      mimeType: string | null;
    }): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(content, file, fileName, mimeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useResetSystem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (passcode: string): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.resetSystem(passcode);
      if (!result) {
        throw new Error('Reset failed: incorrect passcode or backend error.');
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// ─── Timetable Entries ────────────────────────────────────────────────────────

export function useGetCallerTimetableEntries() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<TimetableEntry[]>({
    queryKey: ['timetableEntries', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllCallerTimetableEntries();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Unauthorized') || msg.includes('unauthorized')) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 3000,
  });
}

export function useAddTimetableEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryInput: TimetableEntryInput): Promise<TimetableEntry> => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTimetableEntry(entryInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetableEntries'] });
    },
  });
}

export function useUpdateTimetableEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entry,
    }: {
      id: bigint;
      entry: TimetableEntryInput;
    }): Promise<TimetableEntry> => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTimetableEntry(id, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetableEntries'] });
    },
  });
}

export function useDeleteTimetableEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: bigint): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTimetableEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetableEntries'] });
    },
  });
}
