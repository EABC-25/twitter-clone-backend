import request from "supertest";
import supertestSession from "supertest-session";
import app from "src/app";
import db from "src/db";
import getLoggedInSession from "tests/utils/helpers/loginHelper";
import { resetTestDb } from "tests/utils/helpers/helpers";
import seeder from "tests/utils/helpers/seeder";

beforeEach(async () => {
  await resetTestDb(["users"]);
  await seeder("users", "user.json");
});

afterAll(async () => {
  await resetTestDb(["users"]);
  await db.getPool().end();
});

describe("Unprotected auth flow", () => {
  // ENDPOINT: /api/v1/auth/login
  it("/api/v1/auth/login using correct credentials should return 200 response and session cookie", async () => {
    const { response } = await getLoggedInSession({
      email: "usertesting@email.com",
      password: "11111111",
    });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("/api/v1/auth/login using incorrect credentials should return 404 response", async () => {
    const { response } = await getLoggedInSession({
      email: "wrongemail@email.com",
      password: "1212121212",
    });

    expect(response.status).toBe(404);
    expect(response.headers["set-cookie"]).not.toBeDefined();
  });

  // ENDPOINT: /api/v1/auth/register
  it("/api/v1/auth/register should return 201 response", async () => {
    const session = supertestSession(app);
    const registerResponse = await session.post("/api/v1/auth/register").send({
      username: "usertestingtwo",
      email: "usertestingtwo@email.com",
      password: "11111111",
      dateOfBirth: "1993-12-12",
    });

    expect(registerResponse.status).toBe(201);
  });

  // no need to test these here because these were already covered by the unit tests: username.length, valid email, password.length, valid dateOfBirth
});
