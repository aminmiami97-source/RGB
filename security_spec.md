# RGB Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. Every document under `/users/{userId}` must belong strictly to the authenticated user (`request.auth.uid == userId` and `data.uid == request.auth.uid`).
2. Users must have a verified email (`request.auth.token.email_verified == true`) before creating or updating a profile document.
3. Collection-wide `list` queries on `/users` are strictly denied (`allow list: if false`) so no user can enumerate or scrape other accounts' PII (`email`, `displayName`).
4. `createdAt` and `updatedAt` must always equal `request.time` on creation, and `createdAt`, `uid`, and `email` are immutable after creation.
5. `preferredExecutor` must be strictly `'solara'` or `'xeno'`.
6. Only a verified authenticated user whose token email is strictly `aminmiami97@gmail.com` (`isUpdateAdmin()`) may create or delete documents under `/updates/{updateId}`.
7. `/updates/{updateId}` documents store zero PII (no emails) and require `published == true`, `authorUid == request.auth.uid`, `createdAt == request.time`, valid semver, valid category enum, and strict length bounds.
8. Public reads on `/updates/{updateId}` explicitly evaluate `existing().published == true`.
9. Every string field is bounded by explicit `.size()` limits, and all document IDs (`userId`, `updateId`, `configId`) must match `^[a-zA-Z0-9_-]+$` (`<= 128` chars).
10. `/scriptConfig/{configId}` (specifically `/scriptConfig/live`) stores zero PII, allows `get` only when `existing().published == true`, denies `list` and `delete`, and restricts `create` and `update` strictly to `isUpdateAdmin()` (verified `aminmiami97@gmail.com`) with `updatedByUid == request.auth.uid`, `updatedAt == request.time`, and explicit `.size()` bounds (`code` 10..200000 chars).

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated user PII read**: `GET /users/user123` with `auth == null`.
2. **Cross-user read (PII leak)**: `GET /users/victimUid` as `auth.uid == 'attackerUid'`.
3. **Collection scraping**: `LIST /users` or `LIST /scriptConfig` as any signed-in user.
4. **Unverified email write**: `CREATE /users/u1` with `email_verified: false`.
5. **Identity spoofing**: `CREATE /users/u1` as `auth.uid == 'u1'` with payload `{ uid: 'adminUid', ... }`.
6. **Shadow field injection (privilege escalation)**: `CREATE /users/u1` or `UPDATE /scriptConfig/live` including `{ role: 'admin', isVerified: true }`.
7. **Unauthorized update or script overwrite**: `CREATE /updates/upd1` or `UPDATE /scriptConfig/live` by a signed-in user with `email == 'other@gmail.com'`.
8. **Admin email spoofing (unverified token)**: `UPDATE /scriptConfig/live` with `token.email == 'aminmiami97@gmail.com'` and `token.email_verified == false`.
9. **Unpublished/hidden update read or write**: `CREATE /updates/upd1` with `{ published: false }` or `LIST /updates` without `where('published', '==', true)`.
10. **Client-forged update timestamp / updatedByUid**: `UPDATE /scriptConfig/live` as admin with `updatedAt` in the past or `updatedByUid != request.auth.uid`.
11. **Oversized string / malformed semver DoS**: `CREATE /updates/upd1` with `title` > 100 chars, or `UPDATE /scriptConfig/live` with `code` > 200000 chars.
12. **Malformed document ID poisoning**: `CREATE /users/bad$id..`, `CREATE /updates/bad$id..`, or `CREATE /scriptConfig/other` (only `'live'` allowed).

