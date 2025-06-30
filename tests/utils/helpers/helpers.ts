import db from "../../../src/db";

export const resetTestDb = async (
  tables = ["users", "posts", "replies", "user_follows", "post_likes"]
) => {
  await db.executeResult("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of tables) {
    await db.executeResult(`TRUNCATE TABLE ${table}`);
  }

  await db.executeResult("SET FOREIGN_KEY_CHECKS = 1");
};

export function toMySQLTimestampUTC(isoString: string): string {
  const date = new Date(isoString);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
