export function validateEnv() {
  const requiredEnvVars = ["BOT_TOKEN", "APPLICATION_ID", "DEV_GUILD_ID"];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing ${key} in .env`);
    }
  }
}
