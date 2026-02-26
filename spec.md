# Specification

## Summary
**Goal:** Fix the app being stuck indefinitely on a loading spinner due to an initialization deadlock in `App.tsx` and query hooks.

**Planned changes:**
- Add a hard 5-second timeout to the auth initialization check in `App.tsx` so that if `useInternetIdentity` does not resolve, the app falls back to showing the LandingPage
- Ensure `showLanding` is set to `true` whenever initialization ends without a confirmed authenticated identity
- Treat backend profile-fetch query errors as "not registered" rather than a hanging/blocking state, using `isLoading` vs `isFetching` states correctly
- Audit `useQueries.ts` and initialization-time query hooks to set `retry: 0` or low retry counts and define `staleTime`/`gcTime` so failed or slow backend calls resolve quickly

**User-visible outcome:** The app always renders a visible UI (LandingPage, Dashboard, or ProfileSetupModal) within 5 seconds, even when the backend is slow or unreachable, instead of staying stuck on a blank loading spinner.
