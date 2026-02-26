# Specification

## Summary
**Goal:** Fix the broken "Enter the Sky" button on the LandingPage so it correctly triggers the authentication and onboarding flow.

**Planned changes:**
- Wire the "Enter the Sky" button click handler in `LandingPage.tsx` to properly initiate the Internet Identity login flow
- Ensure that after successful authentication, the app transitions to the onboarding modal (new users) or dashboard (returning users)
- Ensure errors are not silently swallowed

**User-visible outcome:** Clicking "Enter the Sky" on the landing page launches the login flow and takes the user into the app as expected.
