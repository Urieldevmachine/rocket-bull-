# Security Spec - Rocket Bull Leaderboard

## Data Invariants
- A leaderboard entry must have a valid `userId` matching the authenticated user.
- The `score` must be a positive integer.
- The `username` must be a string between 3 and 20 characters.
- Users can only update their own scores.
- `updatedAt` must be a server timestamp.

## The Dirty Dozen Payloads
1. Create entry with someone else's `userId`.
2. Create entry without being signed in.
3. Update `score` to a negative value.
4. Update `username` to 1MB string.
5. Update someone else's record.
6. Create entry with a future `updatedAt`.
7. Deleting someone else's record.
8. Listing without filters (should be allowed for leaderboard but restricted in size).
9. Attempt to change `userId` after creation.
10. Attempt to inject scripts in `username`.
11. Update record with an extra `isAdmin` field.
12. Create record with a spoofed `updatedAt`.

## Test Runner (Logic)
- Deny if `request.auth.uid != response.data.userId` for writes.
- Deny if `incoming().score` is not a number.
- Deny if `incoming().username.size() > 20`.
- Deny if `incoming().updatedAt != request.time`.
