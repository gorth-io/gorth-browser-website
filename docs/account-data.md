# Accounts and Browser backups

## Identity and ownership

`database/schema.ts` preserves the original local `user` projection:
`id`, `externalUserId`, `name`, `username`, `role`, `status`, `email`,
`image`, `banExpires`, `bannedAt`, `deletedAt`, `metadata`, `lastSeenAt`,
`syncedAt`, `createdAt`, and `updatedAt`.
The official Better Auth migration additionally stores `emailVerified` and
`ssoStatus`; it preserves existing user IDs, moderation fields and ownership.

This is a local account projection, not a second authentication authority.
A verified Gorth SSO `sub` maps to `externalUserId`; profile synchronization
never overwrites the local role, status, moderation timestamps or metadata.
Suspended, deleted, inactive or banned accounts cannot create/use website sessions.
Do not merge accounts on email conflicts or grant roles based on SSO claims.

Website and desktop sessions are separate. Desktop OAuth credentials are not
accepted by these cookie-authenticated endpoints or exposed to browser JavaScript.

## UI and API

Sign in and open `/account/sync`.

- `GET /sync`: list the signed-in owner's backups (summary only).
- `POST /sync`: create an immutable backup.
- `GET /sync/file?id=<uuid>`: download that owner's backup JSON.
- `DELETE /sync?id=<uuid>`: delete that owner's backup.

All endpoints require the website session; mutations additionally require
the exact configured same-origin Origin header. A caller-supplied user ID is
never accepted. A foreign/missing backup ID returns 404.
No CORS wildcard or unauthenticated snapshot endpoint is added.

The JSON body of POST is:

```json
{
  "version": 1,
  "name": "My browsing session",
  "deviceName": "My Mac",
  "data": {
    "activeTabId": "tab-1",
    "splitTabId": null,
    "activeWorkspaceId": "space-1",
    "tabs": [
      {
        "id": "tab-1",
        "title": "Example",
        "url": "https://example.com/",
        "isMuted": false,
        "isPinned": false,
        "internalPage": null
      }
    ],
    "groups": [
      {
        "id": "group-1",
        "name": "Research",
        "mode": "normal",
        "tabIds": ["tab-1"]
      }
    ],
    "workspaces": [
      {
        "id": "space-1",
        "name": "Work",
        "tabIds": ["tab-1"],
        "groupIds": ["group-1"],
        "activeTabId": "tab-1"
      }
    ],
    "bookmarks": [
      {
        "id": "bookmark-1",
        "title": "Example",
        "url": "https://example.com/"
      }
    ],
    "preferences": { "theme": "system", "tabLayout": "separate" }
  }
}
```

The upload UI accepts `{ "version": 1, "data": ... }` files as well as a raw
native BrowserSnapshot JSON. Server validation is always authoritative.
Unknown fields are discarded: no cookies, tokens, passwords, history, extension
storage, device-local file paths or navigation stacks are retained.

URLs accept http/https/gorth only and reject embedded username/password.
IDs must be unique, referenced tabs/groups/workspaces must exist, and split/glance
groups require two tabs. Limits: 2 MB per request/backup, 500 tabs and groups,
64 workspaces, 10,000 bookmarks and 50 backups per user. Quota enforcement uses
a database transaction and owner-scoped advisory lock to prevent concurrent
uploads exceeding it. The stored JSON carries a SHA-256 checksum and summary counts.

## Persistence and rollout

Snapshots live in PostgreSQL `browser_snapshot`, owned by the local user via
a cascading foreign key. They are not temporary files or browser localStorage.
Use separate databases/schemas for Browser and Launcher; do not apply both
initial migrations to one unnamespaced PostgreSQL schema.

An initial Drizzle SQL migration is committed under `database/drizzle`.
The schema was applied with `pnpm drizzle-kit push` on 2026-10-09, and the website
OAuth client was registered in SSO. Generated SQL remains available for reviewed
deployments; push does not create migration history. Do not replay initial SQL
over this already-pushed database.
If the earlier scaffold schema was already applied, do not apply this initial
migration over it: generate/review a data-preserving rename/backfill migration.

## Deliberate current limits

This is manual, versioned backup storage, not live bidirectional synchronization.
The desktop app has not been modified by this website task: direct export/upload,
restore with confirmation, conflict handling and desktop resource-token
authorization still need a follow-up integration.

The current Browser only has an enable-workspace sidebar scaffold, not an actual
workspace data model. The backup contract is workspace-ready, but cannot manufacture
workspace data that the desktop app does not store yet.

Data is private by authorization, not end-to-end encrypted. URLs can contain
sensitive query parameters; users should inspect an export before uploading it.
Downloads do not silently overwrite the active desktop session.
Database push and unauthenticated HTTP guard/PKCE checks have been completed.
The 2026-10-11 Better Auth migration archives old session/verification tables
and adds native session/account/verification storage. See `auth-structure.md`.
Real-account login and the desktop integration are not claimed as tested.
