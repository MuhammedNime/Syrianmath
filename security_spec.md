# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default Deny**: Any unmatched path is rejected (`allow read, write: if false;`).
2. **Owner-Isolated User Data**: Every document under `/users/{userId}` and its subcollections (`private`, `progress`, `activities`, `tutorChats`, `tutorFavorites`) belongs strictly to `userId == request.auth.uid`, with PII (`email`) isolated under `/users/{userId}/private/info`.
3. **Parent Master Gate**: Subcollections (`progress`, `activities`, `tutorChats`, `tutorFavorites`, `private`) require the parent `/users/{userId}` profile document to exist via `exists()`.
4. **No Self-Assigned Privilege Escalation**: Newly created `/users/{userId}` profiles must have `role == 'student'` unless the caller is verified admin (`isAdmin()`). Students cannot alter `role` or `uid`.
5. **Temporal Integrity**: `createdAt` must equal `request.time` on `create` and remain immutable on `update`; `updatedAt` must equal `request.time` on both `create` and `update`.
6. **Strict Schema & Bounds**: Every write validates required/allowed keys (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update), type safety, `.size()` bounds on strings/arrays, and ID regex `^[a-zA-Z0-9_\-]+$`.
7. **Verified Writes**: Standard user mutations require `request.auth != null && request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Fail with PERMISSION_DENIED)
1. **Unauthenticated read/write** on `/users/u1` without `request.auth`.
2. **Cross-user profile read** by `uid: "u2"` reading `/users/u1/private/info`.
3. **Self-assigned admin escalation** on `/users/u1` create: `{ uid: "u1", displayName: "Hacker", gradeId: 12, role: "admin", ... }`.
4. **Shadow field injection** on `/users/u1` update adding `{ isVerified: true }` alongside `gradeId`.
5. **Role tampering** on `/users/u1` update changing `role` from `"student"` to `"admin"`.
6. **UID spoofing** in subcollection `/users/u1/progress/l1` with `{ userId: "u2", ... }`.
7. **Orphaned subcollection write** under `/users/nonexistent/progress/l1` when `/users/nonexistent` does not exist.
8. **Client-forged timestamp** on create with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
9. **Immutable `createdAt` overwrite** on update modifying `createdAt`.
10. **ID poisoning** on `/users/u1/progress/bad$id..1500chars` failing `isValidId()`.
11. **Unbounded array/string DoS** on `/users/u1/tutorChats/c1` with `messages.length > 100` or `title.length > 200`.
12. **Unverified email admin spoof**: caller has `email: "muhammedcemal.nime@gmail.com"` with `email_verified: false` attempting admin read/write.
