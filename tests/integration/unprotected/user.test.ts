import request from "supertest";
import app from "src/app";
import db from "src/db";
import { resetTestDb } from "tests/utils/helpers/helpers";
import seeder from "tests/utils/helpers/seeder";

afterAll(async () => {
  await resetTestDb(["users"]);
  await db.getPool().end();
});

describe("GET /api/v1/user", () => {
  it("should return userCount === 0 when no users exist", async () => {
    await resetTestDb(["users"]);
    const res = await request(app).get("/api/v1/user/count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userCount: 0 });
  });

  it("should return userCount > 0 when there are users", async () => {
    await seeder("users", "users.json");
    const res = await request(app).get("/api/v1/user/count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userCount: 3 });
  });
});
