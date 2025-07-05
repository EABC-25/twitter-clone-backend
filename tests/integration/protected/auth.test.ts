import db from "src/db";
import getLoggedInSession from "tests/utils/helpers/loginHelper";
import { resetTestDb } from "tests/utils/helpers/helpers";
import seeder from "tests/utils/helpers/seeder";

afterAll(async () => {
  await resetTestDb(["users"]);
  await db.getPool().end();
});

describe("Protected auth route", () => {
  // ENDPOINT: /api/v1/auth/logout
  it("/api/v1/auth/logout should return 200 response and session cookie", async () => {
    await seeder("users", "user.json");
    const { session, response } = await getLoggedInSession({
      email: "usertesting@email.com",
      password: "11111111",
    });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();

    const logoutRes = await session.post("/api/v1/auth/logout");

    // console.log(logoutRes.headers["set-cookie"]);
    // logout cookie shape: ['token=none; Path=/; Expires=Sat, 05 Jul 2025 08:46:27 GMT; HttpOnly; SameSite=Strict']

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers["set-cookie"]).toBeDefined();
  });
});
