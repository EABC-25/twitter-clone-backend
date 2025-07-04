declare module "supertest-session" {
  import type { Agent } from "supertest-session";
  import type { Express } from "express";

  function session(app: Express): Agent;

  export = session;
}
