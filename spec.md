# Specification

## Summary
**Goal:** Fix the `adminReset` backend function so that authorization is based solely on the passcode string, removing any principal-based or role-based checks that block the reset.

**Planned changes:**
- Rewrite `adminReset` in `backend/main.mo` to authorize based only on the passcode `'161189'`, removing any principal whitelist or role guard.
- If the correct passcode is provided, clear all registered users, chat messages, and timetable entries and return a success result.
- If an incorrect or empty passcode is provided, return an error without clearing any data.

**User-visible outcome:** An admin who enters the correct passcode `161189` in the admin panel can successfully reset all data without receiving an "only authorized admins can reset" error.
