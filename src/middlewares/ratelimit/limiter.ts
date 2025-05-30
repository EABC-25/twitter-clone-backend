import rateLimit from "express-rate-limit";

export const userLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.method === "OPTIONS",
  keyGenerator: req => {
    const userId =
      Array.isArray(req.body?.user) && req.body.user[0]?.userId
        ? req.body.user[0].userId
        : null;
    // we keep the fallback req.ip for now
    const key = userId || req.ip;
    console.log("rate limit key generator for: ", key);
    return key;
  },
  message: "Too many requests, please try again later.",
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.method === "OPTIONS",
  keyGenerator: req => req.ip as string,
  message: "Too many requests, please try again later.",
});

export const customAuthLimiter = (count: number, minutes: number) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: count,
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => req.method === "OPTIONS",
    keyGenerator: req => req.ip as string,
    message: "Too many requests, please try again later.",
  });
};
