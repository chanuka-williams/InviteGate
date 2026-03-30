const Database = require("better-sqlite3");
const db = new Database("./invites.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS invites (
    user_id TEXT PRIMARY KEY,
    invite_code TEXT NOT NULL,
    guild_id TEXT NOT NULL
  )
`);

function getInvite(userId, guildId) {
  return (
    db
      .prepare(
        "SELECT invite_code FROM invites WHERE user_id = ? AND guild_id = ?",
      )
      .get(userId, guildId) ?? null
  );
}

function setInvite(userId, guildId, inviteCode) {
  db.prepare(
    "INSERT OR REPLACE INTO invites (user_id, guild_id, invite_code) VALUES (?, ?, ?)",
  ).run(userId, guildId, inviteCode);
}

function deleteInvite(userId, guildId) {
  db.prepare("DELETE FROM invites WHERE user_id = ? AND guild_id = ?").run(
    userId,
    guildId,
  );
}

module.exports = { getInvite, setInvite, deleteInvite };
