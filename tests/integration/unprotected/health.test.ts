import request from "supertest";
import app from "src/app";
import db from "src/db";

afterAll(async () => {
  await db.getPool().end();
});

describe("Unprotected health route", () => {
  // ENDPOINT: /health
  it("/health should return 200 response and db[0].result === 2", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.db[0].result).toEqual(2);
  });
});
