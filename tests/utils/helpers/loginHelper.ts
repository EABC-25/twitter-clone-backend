import supertestSession from "supertest-session";
import app from "src/app";

const getLoggedInSession = async (credentials: {
  email: string;
  password: string;
}) => {
  const session = supertestSession(app);
  const loginResponse = await session
    .post("/api/v1/auth/login")
    .send(credentials);

  return { session, response: loginResponse };
};

export default getLoggedInSession;
