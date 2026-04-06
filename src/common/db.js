const fs = require("fs");
const Database = require("better-sqlite3");

if (!fs.existsSync("./data")) fs.mkdirSync("./data");
const db = new Database("./data/bot.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS invites (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    invite_code TEXT NOT NULL,
    PRIMARY KEY (user_id, guild_id)
  );
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    invite_max_age INTEGER NOT NULL DEFAULT 86400
  );
`);

// -- Invites --
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

// -- Guild Settings --
function initGuildSettings(guildId) {
  db.prepare("INSERT OR IGNORE INTO guild_settings (guild_id) VALUES (?)").run(
    guildId,
  );
}
function getGuildSettings(guildId) {
  return (
    db
      .prepare("SELECT * FROM guild_settings WHERE guild_id = ?")
      .get(guildId) ?? null
  );
}
function setInviteMaxAge(guildId, maxAge) {
  db.prepare(
    "UPDATE guild_settings SET invite_max_age = ? WHERE guild_id = ?",
  ).run(maxAge, guildId);
}

module.exports = {
  getInvite,
  setInvite,
  deleteInvite,
  initGuildSettings,
  getGuildSettings,
  setInviteMaxAge,
};
