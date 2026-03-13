/**
 * Hardcoded user list.
 *
 * To add a new user:
 *  1. Generate a bcrypt hash for their password by running in your terminal:
 *       node -e "require('bcryptjs').hash('TheirPassword', 12, (e,h) => console.log(h))"
 *  2. Add a new entry below with a unique id, username, the hash, and a display name.
 *  3. Redeploy. That user will now be able to log in with their own isolated dashboard.
 *
 * Each user only sees their own videos — data is fully isolated per account.
 */

export interface AppUser {
  id: string
  username: string
  passwordHash: string
  displayName: string
}

export const USERS: AppUser[] = [
  {
    id: 'user_zehra',
    username: 'MediabyZehra',
    // Hash of: Password123!
    passwordHash: '$2b$12$ix87.fFlgLlldWYc1SVsBeM1jQubVebSG6Fz3DipkfcBWXyHhyI4K',
    displayName: 'Media by Zehra',
  },

  // ── Add new users below this line ─────────────────────────────────────────
  // {
  //   id: 'user_client2',
  //   username: 'ClientTwo',
  //   passwordHash: '$2b$12$...paste hash here...',
  //   displayName: 'Client Two',
  // },
]
