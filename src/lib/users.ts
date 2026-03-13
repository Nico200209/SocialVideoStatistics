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
    username: 'MediaByZehra',
    passwordHash: '$2a$12$ZjfvaKIgA9A25TcVXkqP.OeXhIuPl6pYrzLjErbcTOFiLVX8XlyXS',
    displayName: 'Media by Zehra',
  },
    {
    id: 'user_nico',
    username: 'Nicolas',
    passwordHash: '$2a$12$HUL2kN/UYJ7/nMfvfHTXluCJRx31PQwZ044BA167lqU1I6sT6Emke',
    displayName: 'Nicolas',
  },

  // ── Add new users below this line ─────────────────────────────────────────
  // {
  //   id: 'user_client2',
  //   username: 'ClientTwo',
  //   passwordHash: '$2b$12$...paste hash here...',
  //   displayName: 'Client Two',
  // },
]
