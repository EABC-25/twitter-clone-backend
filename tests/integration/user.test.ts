import request from "supertest";
import app from "src/app";
import db from "src/db";
import { resetTestDb } from "tests/utils/helpers/helpers";

beforeEach(async () => {});

afterAll(async () => {
  await db.getPool().end();
});

describe("GET /api/v1/user", () => {
  it("should return empty array when no users exist", async () => {
    await resetTestDb(["users"]);

    const res = await request(app).get("/api/v1/user/count");
    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userCount: 0 });
  });
});
